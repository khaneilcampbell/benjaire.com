// benjaire.com Worker. Static pages are served from ./dist by the assets
// layer; only /api/* reaches this script (see wrangler.jsonc).
import { EmailMessage } from 'cloudflare:email';
import { buildMime, checkoutParams, composeEmail, flowPayload, hostAllowed, originAllowed, paymentLinkFor, postWithRetry, recipientFor, SITE_CAP_KEYS, underSiteCap, validate, type CheckoutTier, type Inquiry } from './lib';

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};
const MAX_BODY = 20_000;
const GOOGLE_VERIFICATION_PATH = '/google16283c1e65acebfc.html';

function respond(req: Request, status: number, body: Record<string, unknown>): Response {
  // Without JavaScript the browser posts a normal form: send it back to the
  // contact page with a status flag instead of showing raw JSON.
  const wantsJson = (req.headers.get('Accept') ?? '').includes('application/json');
  if (!wantsJson) {
    const url = new URL('/contact', req.url);
    url.searchParams.set('status', body.ok ? 'sent' : 'error');
    return Response.redirect(url.toString(), 303);
  }
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

async function verifyTurnstile(token: string, secret: string, ip: string | null): Promise<boolean> {
  if (!token || !secret) return false;
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean; action?: string };
  return data.success === true && (data.action === undefined || data.action === 'contact');
}

// Forward a delivered inquiry to Benjaire Flow (n8n), which sorts it, alerts
// the owner and acknowledges the sender. Runs after the response is sent and
// never affects it: the email above stays the record if Flow is unreachable.
async function forwardToFlow(inquiry: Inquiry, env: Env): Promise<void> {
  if (!env.FLOW_INTAKE_URL || !env.FLOW_INTAKE_KEY) return;
  const result = await postWithRetry(env.FLOW_INTAKE_URL, {
    headers: {
      'Content-Type': 'application/json',
      'x-flow-key': env.FLOW_INTAKE_KEY,
      'Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify(flowPayload(inquiry)),
  });
  if (!result.ok) {
    console.error('Flow intake failed', { attempts: result.attempts, status: result.status, error: result.error });
  } else if (result.attempts > 1) {
    console.log('Flow intake delivered after retry', { attempts: result.attempts });
  }
}

async function handleContact(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
  }
  if (!originAllowed(req.headers.get('Origin'), env.ALLOWED_HOSTS, new URL(req.url).hostname)) {
    return respond(req, 403, { ok: false, error: 'This form can only be sent from benjaire.com.' });
  }
  const length = Number(req.headers.get('Content-Length') ?? '0');
  if (length > MAX_BODY) return respond(req, 413, { ok: false, error: 'Your message is too long.' });

  const ip = req.headers.get('CF-Connecting-IP');
  const { success: underLimit } = await env.CONTACT_LIMITER.limit({ key: ip ?? 'unknown' });
  if (!underLimit) {
    return respond(req, 429, { ok: false, error: 'Too many messages in a short time. Please wait a minute and try again.' });
  }
  if (!(await underSiteCap(env.SITE_LIMITER, SITE_CAP_KEYS.contact))) {
    console.warn('Contact form site-wide cap reached');
    return respond(req, 429, { ok: false, error: 'The form is busy right now. Please try again in a minute.' });
  }

  let form: FormData;
  try {
    // Content-Length is absent on chunked bodies, so measure what arrived.
    const body = await req.arrayBuffer();
    if (body.byteLength > MAX_BODY) return respond(req, 413, { ok: false, error: 'Your message is too long.' });
    form = await new Response(body, { headers: { 'Content-Type': req.headers.get('Content-Type') ?? '' } }).formData();
  } catch {
    return respond(req, 400, { ok: false, error: 'The form could not be read. Please try again.' });
  }

  // Honeypot: real visitors never fill this hidden field. Pretend success.
  if (String(form.get('website') ?? '').trim()) return respond(req, 200, { ok: true });

  const human = await verifyTurnstile(String(form.get('cf-turnstile-response') ?? ''), env.TURNSTILE_SECRET_KEY, ip);
  if (!human) {
    return respond(req, 400, { ok: false, error: "We couldn't confirm you're not a robot. Please complete the check and try again." });
  }

  const { inquiry, errors } = validate(form);
  if (!inquiry) return respond(req, 422, { ok: false, error: 'Please fix the highlighted fields.', fields: errors });

  if (!env.CONTACT_TO) {
    console.error('CONTACT_TO is not configured');
    return respond(req, 503, { ok: false, error: 'The form is temporarily unavailable.' });
  }

  const { subject, text } = composeEmail(inquiry, { receivedAt: new Date().toISOString(), host: new URL(req.url).hostname });
  const to = recipientFor(inquiry.category, env.CONTACT_TO, env.CATEGORY_RECIPIENTS);
  const domain = env.MAIL_FROM.split('@')[1];
  const raw = buildMime({
    from: { name: 'Benjaire website', email: env.MAIL_FROM },
    to,
    replyTo: { name: inquiry.name, email: inquiry.email },
    subject,
    text,
    messageId: `<${crypto.randomUUID()}@${domain}>`,
    date: new Date(),
  });
  try {
    // Classic send_email: works with Email Routing verified destinations.
    await env.SEND_EMAIL.send(new EmailMessage(env.MAIL_FROM, to, raw));
  } catch (err) {
    console.error('send_email failed', err instanceof Error ? err.message : err);
    return respond(req, 502, { ok: false, error: "Your message couldn't be sent." });
  }
  ctx.waitUntil(forwardToFlow(inquiry, env));
  return respond(req, 200, { ok: true });
}

// GET /api/checkout?tier=starter|professional: creates a Stripe Checkout
// Session (success and cancel pages on this site) and redirects to it. Without
// a secret key or a price for the tier, or if Stripe errors, the buyer goes to
// the tier's Payment Link instead, so the buy button always works.
async function handleCheckout(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const tier = url.searchParams.get('tier') ?? '';
  const fallback = paymentLinkFor(tier);
  if (!fallback) return Response.redirect(new URL('/digital/flow#pricing', url).toString(), 303);

  const tiers = (env.STRIPE_TIERS ?? {}) as Record<string, CheckoutTier>;
  const cfg = Object.hasOwn(tiers, tier) ? tiers[tier] : undefined;
  const ip = req.headers.get('CF-Connecting-IP') ?? 'unknown';
  if (!env.STRIPE_SECRET_KEY || !cfg?.price) return Response.redirect(fallback, 303);
  const { success: underLimit } = await env.CONTACT_LIMITER.limit({ key: `checkout:${ip}` });
  if (!underLimit) return Response.redirect(fallback, 303);
  // Past the site-wide cap, buyers still pay through the tier's Payment Link.
  if (!(await underSiteCap(env.SITE_LIMITER, SITE_CAP_KEYS.checkout))) {
    console.warn('Checkout site-wide cap reached');
    return Response.redirect(fallback, 303);
  }

  // Return buyers to the host they came from, but only one of ours.
  const origin = hostAllowed(url.hostname, env.ALLOWED_HOSTS) ? url.origin : 'https://benjaire.com';
  try {
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: checkoutParams(tier, cfg, origin),
      signal: AbortSignal.timeout(10_000),
    });
    const data = (await res.json()) as { url?: string; error?: { message?: string } };
    if (res.ok && data.url) return Response.redirect(data.url, 303);
    console.error('Stripe checkout failed', res.status, data.error?.message);
  } catch (err) {
    console.error('Stripe checkout failed', err instanceof Error ? err.message : err);
  }
  return Response.redirect(fallback, 303);
}

export default {
  async fetch(req, env, ctx): Promise<Response> {
    const { pathname } = new URL(req.url);
    if (pathname === '/api/contact') return handleContact(req, env, ctx);
    if (pathname === '/api/checkout') return handleCheckout(req, env);
    // Google Search Console HTML-file verification must answer 200 at this
    // exact .html path (the assets layer would redirect it to a clean URL).
    if (pathname === GOOGLE_VERIFICATION_PATH) {
      return new Response(`google-site-verification: ${GOOGLE_VERIFICATION_PATH.slice(1)}`, {
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Content-Type-Options': 'nosniff' },
      });
    }
    return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
  },
} satisfies ExportedHandler<Env>;

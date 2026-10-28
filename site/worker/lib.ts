// Pure contact-form logic (no Cloudflare APIs) so it can be unit-tested
// with `node --test`. Keep the category list in sync with src/site.ts.

export const CATEGORIES: Record<string, string> = {
  digital: 'Digital Solutions',
  general: 'General Business Inquiry',
  partnership: 'Partnership',
  supplier: 'Supplier / Manufacturing',
};

export const LIMITS = { name: 120, email: 254, company: 160, messageMin: 20, messageMax: 5000 } as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface Inquiry {
  category: string;
  name: string;
  email: string;
  company: string;
  message: string;
}

export type FieldErrors = Partial<Record<keyof Inquiry | 'consent', string>>;

/** Collapse whitespace and strip control characters (header-injection safe). */
export function cleanLine(value: unknown, max: number): string {
  return String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

/** Keep line breaks in the message body but drop other control characters. */
export function cleanBody(value: unknown, max: number): string {
  return String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]+/g, '')
    .trim()
    .slice(0, max);
}

export function validate(form: FormData): { inquiry?: Inquiry; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const category = cleanLine(form.get('category'), 40);
  const name = cleanLine(form.get('name'), LIMITS.name);
  const email = cleanLine(form.get('email'), LIMITS.email);
  const company = cleanLine(form.get('company'), LIMITS.company);
  const message = cleanBody(form.get('message'), LIMITS.messageMax);

  if (!(category in CATEGORIES)) errors.category = 'Choose what your message is about.';
  if (!name) errors.name = 'Enter your name.';
  if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';
  if (message.length < LIMITS.messageMin) errors.message = `Tell us a little more: at least ${LIMITS.messageMin} characters.`;
  if (!form.get('consent')) errors.consent = 'Please agree to the Privacy Policy so we can reply.';

  return Object.keys(errors).length ? { errors } : { inquiry: { category, name, email, company, message }, errors };
}

/**
 * Recipient for a category. CATEGORY_RECIPIENTS is optional JSON such as
 * {"supplier":"sourcing@example.com"}; anything unmapped goes to the default.
 * Every address must be a verified Email Routing destination.
 */
export function recipientFor(category: string, fallback: string, mapJson?: string): string {
  if (mapJson) {
    try {
      const map = JSON.parse(mapJson) as Record<string, string>;
      if (typeof map[category] === 'string' && map[category].includes('@')) return map[category];
    } catch {
      /* ignore malformed config and use the default */
    }
  }
  return fallback;
}

/**
 * Body for the Benjaire Flow intake webhook (n8n). Flow has no category field,
 * so the category label leads the message where Claude and the owner see it.
 */
export function flowPayload(i: Inquiry) {
  return {
    name: i.name,
    email: i.email,
    company: i.company,
    phone: '',
    message: `Category: ${CATEGORIES[i.category]}\n\n${i.message}`,
    source: 'website',
    website: '',
  };
}

/**
 * Sends a POST to the Flow webhook, retrying only when Flow can't have acted
 * on it yet (same rule as the commerce pipeline's api_retry): a dropped
 * connection, 429, or a 502/503/504 gateway error. A timeout or plain 500
 * may mean n8n already ran, so it is not retried; the owner email stays the
 * record. Each try carries the same Idempotency-Key so Flow can drop repeats.
 */
export const FLOW_RETRY_STATUS = new Set([429, 502, 503, 504]);
export const FLOW_RETRY_DELAYS_MS = [1_000, 3_000];

export type FlowResult = { ok: boolean; attempts: number; status?: number; error?: string };

export async function postWithRetry(
  url: string,
  init: { headers: Record<string, string>; body: string },
  opts: { fetchFn?: typeof fetch; delays?: number[]; sleep?: (ms: number) => Promise<unknown>; timeoutMs?: number } = {},
): Promise<FlowResult> {
  const fetchFn = opts.fetchFn ?? fetch;
  const delays = opts.delays ?? FLOW_RETRY_DELAYS_MS;
  const sleep = opts.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));
  for (let attempt = 1; ; attempt++) {
    let retry = false;
    let result: FlowResult;
    try {
      const res = await fetchFn(url, {
        method: 'POST',
        headers: init.headers,
        body: init.body,
        // 3 tries x 8s + 4s of waits stays inside the 30s waitUntil window.
        signal: AbortSignal.timeout(opts.timeoutMs ?? 8_000),
      });
      result = { ok: res.ok, attempts: attempt, status: res.status };
      retry = FLOW_RETRY_STATUS.has(res.status);
    } catch (err) {
      const name = err instanceof Error ? err.name : '';
      result = { ok: false, attempts: attempt, error: err instanceof Error ? err.message : String(err) };
      // TimeoutError / AbortError: the request may have reached n8n.
      retry = name !== 'TimeoutError' && name !== 'AbortError';
    }
    if (result.ok || !retry || attempt > delays.length) return result;
    await sleep(delays[attempt - 1]);
  }
}

/** Formats an ISO timestamp as New York local time, e.g. "Fri, Oct 16, 2026, 3:53 AM EDT". */
export function formatNewYork(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(d);
}

export function composeEmail(i: Inquiry, meta: { receivedAt: string; host: string }) {
  const label = CATEGORIES[i.category];
  const subject = `[${label}] ${i.name}${i.company ? ` · ${i.company}` : ''}`.slice(0, 200);
  const text = [
    `New inquiry from ${meta.host}`,
    '',
    `Category: ${label}`,
    `Name:     ${i.name}`,
    `Email:    ${i.email}`,
    `Company:  ${i.company || '(not given)'}`,
    `Received: ${formatNewYork(meta.receivedAt)}`,
    '',
    '--- Message ---',
    i.message,
    '',
    'Reply to this email to answer the sender directly.',
  ].join('\n');
  return { subject, text };
}

/** True for one of our own hosts, including per-branch preview hosts. */
export function hostAllowed(hostname: string, allowedHosts: string): boolean {
  const hosts = allowedHosts.split(',').map((h) => h.trim()).filter(Boolean);
  return hosts.includes(hostname) || hostname.endsWith('-benjaire-com.benjaireco.workers.dev');
}

/**
 * Only accept POSTs whose Origin is one of our own hosts. A localhost Origin
 * is accepted only when the request itself is to localhost (wrangler dev).
 */
export function originAllowed(origin: string | null, allowedHosts: string, requestHost = ''): boolean {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    if (url.hostname === 'localhost') return requestHost === 'localhost';
    if (url.protocol !== 'https:') return false;
    return hostAllowed(url.hostname, allowedHosts);
  } catch {
    return false;
  }
}

/** RFC 2047 encode a header value when it contains non-ASCII characters. */
function encodeHeader(value: string): string {
  return /^[\x20-\x7e]*$/.test(value) ? value : `=?UTF-8?B?${toBase64(value)}?=`;
}

function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

/**
 * Build a plain-text MIME message for Cloudflare's classic `send_email`
 * (EmailMessage), which works with Email Routing verified destinations.
 * Inputs are already stripped of CR/LF by validate(), so headers are safe.
 */
export function buildMime(opts: {
  from: { name: string; email: string };
  to: string;
  replyTo: { name: string; email: string };
  subject: string;
  text: string;
  messageId: string;
  date: Date;
}): string {
  const addr = (a: { name: string; email: string }) => `${encodeHeader(a.name.replace(/["\\]/g, ''))} <${a.email}>`;
  const body = toBase64(opts.text).replace(/.{1,76}/g, '$&\r\n');
  return [
    `From: ${addr(opts.from)}`,
    `To: <${opts.to}>`,
    `Reply-To: ${addr(opts.replyTo)}`,
    `Subject: ${encodeHeader(opts.subject)}`,
    `Date: ${opts.date.toUTCString()}`,
    `Message-ID: ${opts.messageId}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    body,
  ].join('\r\n');
}

/**
 * Stripe Payment Links for each Flow tier. The Worker falls back to these
 * when Checkout Sessions aren't configured (no STRIPE_SECRET_KEY or no price
 * for the tier) or Stripe errors, so a buy button always reaches a checkout.
 * Must match FLOW_CHECKOUT in src/site.ts (a unit test checks this).
 */
export const PAYMENT_LINKS: Record<string, string> = {
  starter: 'https://buy.stripe.com/5kQfZjd5C99Qf7Ta0R5AQ02',
  professional: 'https://buy.stripe.com/aFabJ31mUdq63pb0qh5AQ03',
};

/**
 * The Payment Link for a tier, or undefined for anything else. Own keys only,
 * so a query like ?tier=constructor can't pick up an Object.prototype member.
 */
export function paymentLinkFor(tier: string): string | undefined {
  return Object.hasOwn(PAYMENT_LINKS, tier) ? PAYMENT_LINKS[tier] : undefined;
}

export interface CheckoutTier {
  price: string;
  automaticTax?: boolean;
}

/** Shown above Stripe's pay button. Keep in step with /refunds and /terms. */
export const CHECKOUT_NOTE =
  'Benjaire Flow Starter and Professional include a 14 day money back guarantee (benjaire.com/refunds). By paying you agree to our terms: benjaire.com/terms';

/**
 * Form body for POST /v1/checkout/sessions. The success page receives the
 * tier and session id; the cancel page receives the tier.
 */
export function checkoutParams(tier: string, cfg: CheckoutTier, origin: string): URLSearchParams {
  return new URLSearchParams({
    mode: 'payment',
    'line_items[0][price]': cfg.price,
    'line_items[0][quantity]': '1',
    success_url: `${origin}/digital/flow-thanks?tier=${tier}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/digital/flow-cancel?tier=${tier}`,
    'automatic_tax[enabled]': cfg.automaticTax ? 'true' : 'false',
    'custom_text[submit][message]': CHECKOUT_NOTE,
    'metadata[tier]': tier,
    'payment_intent_data[metadata][tier]': tier,
  });
}

// Site-wide caps on top of the per-visitor limit, so many addresses together
// still can't send unlimited email or open unlimited Stripe sessions. The
// SITE_LIMITER binding counts per Cloudflare location, per minute. A missing
// binding (an older deploy) never blocks a real visitor.
export const SITE_CAP_KEYS = { contact: 'site:contact', checkout: 'site:checkout' } as const;

export async function underSiteCap(
  limiter: { limit(opts: { key: string }): Promise<{ success: boolean }> } | undefined,
  key: string,
): Promise<boolean> {
  if (!limiter) return true;
  try {
    return (await limiter.limit({ key })).success;
  } catch {
    return true;
  }
}

// Run reports to AI Ops Atlas (POST /api/hooks/agents), so the contact and
// Flow intake agents show real results there. Only the agent, the outcome and
// a short reason are sent: never the visitor's name, email or message.
export const ATLAS_PROJECT = 'benjaire-site';
export type AtlasStatus = 'ok' | 'failed' | 'skipped';

export function atlasRun(agent: string, phase: string, status: AtlasStatus, detail = '', at = new Date()) {
  return { project: ATLAS_PROJECT, agents: [agent], phase, status, detail: detail.slice(0, 300), at: at.toISOString() };
}

export async function reportToAtlas(
  url: string | undefined,
  token: string | undefined,
  run: ReturnType<typeof atlasRun>,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  if (!url || !token) return;
  try {
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(run),
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) console.error('Atlas report failed', res.status);
  } catch (err) {
    console.error('Atlas report failed', err instanceof Error ? err.message : err);
  }
}

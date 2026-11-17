// Contact form: category prefill, client-side validation and submission to
// the Worker at /api/contact (ADR-0004). The Worker repeats every check
// server-side, verifies Turnstile and sends the email. Without JavaScript the
// form still posts normally and the Worker redirects back with ?status=.
const EMAIL = 'contact@benjaire.com';

declare global {
  interface Window { turnstile?: { reset: (el?: string | HTMLElement) => void } }
}
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function initContactForm(): void {
  const form = document.getElementById('inquiry') as HTMLFormElement | null;
  if (!form) return;
  const status = document.getElementById('form-status') as HTMLElement;

  const params = new URLSearchParams(location.search);
  // ?category=partnership preselects a chip; an unknown value keeps the default.
  const wanted = params.get('category');
  if (wanted) {
    const chip = form.querySelector<HTMLInputElement>(`input[name="category"][value="${CSS.escape(wanted)}"]`);
    if (chip) chip.checked = true;
  }
  // ?product=flow-installed starts the message for a fit call to have Flow set up.
  const message = form.querySelector<HTMLTextAreaElement>('#message');
  if (params.get('product') === 'flow-installed' && message && !message.value) {
    message.value = 'I would like a fit call to have Benjaire Flow set up for us. Our website runs on: ';
  }

  const setError = (id: string, msg: string) => {
    const err = document.getElementById(`${id}-err`);
    const field = document.getElementById(`f-${id}`);
    const input = document.getElementById(id);
    if (err) err.textContent = msg;
    field?.classList.toggle('has-error', !!msg);
    input?.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };

  const validate = (): string | null => {
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();
    const checks: Array<[string, string]> = [
      ['name', name ? '' : 'Enter your name.'],
      ['email', !email ? 'Enter your email address.' : EMAIL_RE.test(email) ? '' : 'Enter a valid email address, like name@company.com.'],
      ['message', message.length >= 20 ? '' : 'Tell us a little more: at least 20 characters.'],
      ['consent', data.get('consent') ? '' : 'Please agree to the Privacy Policy so we can reply.'],
    ];
    let first: string | null = null;
    for (const [id, msg] of checks) {
      setError(id, msg);
      if (msg && !first) first = id;
    }
    return first;
  };

  const show = (tone: 'ok' | 'error', text: string) => {
    status.dataset.tone = tone;
    status.textContent = text;
    status.hidden = false;
  };

  // Result of a no-JavaScript submission (the Worker redirects back here).
  if (params.get('status') === 'sent') show('ok', 'Thanks. Your message is on its way, and we will respond as soon as possible.');
  if (params.get('status') === 'error') show('error', `Your message couldn't be sent. Please try again, or email ${EMAIL}.`);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstInvalid = validate();
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }
    if ((form.elements.namedItem('website') as HTMLInputElement).value) return; // honeypot

    if (!form.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]')?.value) {
      show('error', 'Please complete the spam check above the Send button.');
      return;
    }

    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    button.disabled = true;
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: Record<string, string> };
      if (res.ok && data.ok) {
        form.reset();
        show('ok', 'Thanks. Your message is on its way, and we will respond as soon as possible.');
      } else {
        for (const [id, msg] of Object.entries(data.fields ?? {})) setError(id, msg);
        show('error', `${data.error ?? "Your message couldn't be sent."} Your text is still here. You can also email ${EMAIL}.`);
      }
    } catch {
      show('error', `Your message couldn't be sent. Your text is still here, so try again, or email ${EMAIL}.`);
    } finally {
      button.disabled = false;
      window.turnstile?.reset();
    }
  });
}

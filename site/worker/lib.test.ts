import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkoutParams, cleanLine, composeEmail, flowPayload, formatNewYork, originAllowed, PAYMENT_LINKS, paymentLinkFor, postWithRetry, recipientFor, validate } from './lib.ts';
import { FLOW_CHECKOUT } from '../src/site.ts';

const form = (fields: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.append(k, v);
  return f;
};
const good = { category: 'supplier', name: 'Alex Chen', email: 'alex@factory.example', company: 'Factory Co', message: 'We make laptop stands and would like to talk.', consent: 'on' };

test('accepts a complete inquiry', () => {
  const { inquiry, errors } = validate(form(good));
  assert.deepEqual(errors, {});
  assert.equal(inquiry?.category, 'supplier');
});

test('flags each invalid field', () => {
  const { inquiry, errors } = validate(form({ category: 'spam', name: '', email: 'nope', message: 'short' }));
  assert.equal(inquiry, undefined);
  assert.deepEqual(Object.keys(errors).sort(), ['category', 'consent', 'email', 'message', 'name']);
});

test('strips header-injection characters from single-line fields', () => {
  assert.equal(cleanLine('Alex\r\nBcc: evil@example.com', 120), 'Alex Bcc: evil@example.com');
  const { inquiry } = validate(form({ ...good, name: 'Alex\r\nBcc: x@y.z' }));
  assert.ok(!inquiry?.name.includes('\n'));
});

test('caps field lengths', () => {
  const { inquiry } = validate(form({ ...good, message: 'x'.repeat(9000) }));
  assert.equal(inquiry?.message.length, 5000);
});

test('subject carries the category label', () => {
  const { inquiry } = validate(form(good));
  const { subject, text } = composeEmail(inquiry!, { receivedAt: '2026-10-13T00:00:00Z', host: 'benjaire.com' });
  assert.equal(subject, '[Supplier / Manufacturing] Alex Chen · Factory Co');
  assert.match(text, /Email:\s+alex@factory\.example/);
});

test('builds the Flow intake payload with the category in the message', () => {
  const { inquiry } = validate(form(good));
  assert.deepEqual(flowPayload(inquiry!), {
    name: 'Alex Chen',
    email: 'alex@factory.example',
    company: 'Factory Co',
    phone: '',
    message: 'Category: Supplier / Manufacturing\n\nWe make laptop stands and would like to talk.',
    source: 'website',
    website: '',
  });
});

test('shows the received time in New York time', () => {
  assert.equal(formatNewYork('2026-10-16T07:53:52.571Z'), 'Fri, Oct 16, 2026, 3:53 AM EDT');
  assert.equal(formatNewYork('2026-12-01T17:05:00Z'), 'Tue, Dec 1, 2026, 12:05 PM EST');
  const { inquiry } = validate(form(good));
  const { text } = composeEmail(inquiry!, { receivedAt: '2026-10-16T07:53:52.571Z', host: 'benjaire.com' });
  assert.match(text, /Received: Fri, Oct 16, 2026, 3:53 AM EDT/);
});

test('routes categories with an optional map and falls back otherwise', () => {
  assert.equal(recipientFor('supplier', 'inbox@x.com'), 'inbox@x.com');
  assert.equal(recipientFor('supplier', 'inbox@x.com', '{"supplier":"src@x.com"}'), 'src@x.com');
  assert.equal(recipientFor('general', 'inbox@x.com', '{"supplier":"src@x.com"}'), 'inbox@x.com');
  assert.equal(recipientFor('supplier', 'inbox@x.com', 'not json'), 'inbox@x.com');
});

test('only our own origins may post', () => {
  const hosts = 'benjaire.com,www.benjaire.com,benjaire-com.benjaireco.workers.dev';
  assert.ok(originAllowed('https://benjaire.com', hosts));
  assert.ok(originAllowed('https://benjaire-com.benjaireco.workers.dev', hosts));
  assert.ok(originAllowed('https://abc123-benjaire-com.benjaireco.workers.dev', hosts));
  assert.ok(!originAllowed('https://evil.example', hosts));
  assert.ok(!originAllowed('http://benjaire.com', hosts));
  assert.ok(!originAllowed(null, hosts));
  // localhost only counts when the request itself is to localhost (wrangler dev).
  assert.ok(!originAllowed('http://localhost:4321', hosts, 'benjaire.com'));
  assert.ok(originAllowed('http://localhost:8787', hosts, 'localhost'));
});

test('builds a valid plain-text MIME message', async () => {
  const { buildMime } = await import('./lib.ts');
  const raw = buildMime({
    from: { name: 'Benjaire website', email: 'website@benjaire.com' },
    to: 'inbox@example.com',
    replyTo: { name: 'José "Q" Pérez', email: 'jose@example.com' },
    subject: '[Brand Collaboration] José Pérez',
    text: 'Hola — línea uno\nline two',
    messageId: '<abc@benjaire.com>',
    date: new Date('2026-10-13T00:00:00Z'),
  });
  const [head, body] = raw.split('\r\n\r\n');
  assert.match(head, /^From: Benjaire website <website@benjaire\.com>$/m);
  assert.match(head, /^To: <inbox@example\.com>$/m);
  assert.match(head, /^Reply-To: =\?UTF-8\?B\?.+\?= <jose@example\.com>$/m);
  assert.match(head, /^Subject: =\?UTF-8\?B\?/m);
  assert.match(head, /^Message-ID: <abc@benjaire\.com>$/m);
  assert.ok(!/\n(?!\r?$)[^\r]*\r?\n\r?\n/.test(head), 'no blank line inside headers');
  const decoded = new TextDecoder().decode(Uint8Array.from(atob(body.replace(/\r\n/g, '')), (c) => c.charCodeAt(0)));
  assert.equal(decoded, 'Hola — línea uno\nline two');
  const subject = head.match(/^Subject: =\?UTF-8\?B\?(.+)\?=$/m)![1];
  assert.equal(new TextDecoder().decode(Uint8Array.from(atob(subject), (c) => c.charCodeAt(0))), '[Brand Collaboration] José Pérez');
});

test('fallback payment links match the site buy buttons', () => {
  for (const [tier, link] of Object.entries(FLOW_CHECKOUT)) {
    if (link) assert.equal(PAYMENT_LINKS[tier], link, tier);
  }
});

test('checkout session returns to our success and cancel pages', () => {
  const p = checkoutParams('starter', { price: 'price_123', automaticTax: true }, 'https://benjaire.com');
  assert.equal(p.get('mode'), 'payment');
  assert.equal(p.get('line_items[0][price]'), 'price_123');
  assert.equal(p.get('success_url'), 'https://benjaire.com/digital/flow-thanks?tier=starter&session_id={CHECKOUT_SESSION_ID}');
  assert.equal(p.get('cancel_url'), 'https://benjaire.com/digital/flow-cancel?tier=starter');
  assert.equal(p.get('automatic_tax[enabled]'), 'true');
  assert.equal(p.get('metadata[tier]'), 'starter');
});

test('checkout only accepts known tiers', () => {
  assert.equal(paymentLinkFor('starter'), PAYMENT_LINKS.starter);
  for (const tier of ['', 'done_for_you', 'constructor', '__proto__', 'toString', 'STARTER']) {
    assert.equal(paymentLinkFor(tier), undefined, tier);
  }
});

// Fake fetch that plays back responses (a number is a status, an Error is thrown).
function scripted(steps: (number | Error)[]) {
  const calls: RequestInit[] = [];
  const fetchFn = (async (_url: string, init: RequestInit) => {
    calls.push(init);
    const step = steps[calls.length - 1];
    if (step instanceof Error) throw step;
    return new Response(null, { status: step });
  }) as unknown as typeof fetch;
  return { fetchFn, calls };
}
const named = (name: string) => Object.assign(new Error(name), { name });
const post = (steps: (number | Error)[]) => {
  const s = scripted(steps);
  const run = postWithRetry('https://flow.example/hook', { headers: { 'Idempotency-Key': 'k1' }, body: '{}' }, { fetchFn: s.fetchFn, sleep: async () => {} });
  return run.then((result) => ({ result, calls: s.calls }));
};

test('flow forward retries gateway errors and dropped connections, then succeeds', async () => {
  const { result, calls } = await post([503, new TypeError('network connection lost'), 200]);
  assert.deepEqual(result, { ok: true, attempts: 3, status: 200 });
  assert.ok(calls.every((c) => (c.headers as Record<string, string>)['Idempotency-Key'] === 'k1'));
});

test('flow forward never retries a timeout or a plain 500, since n8n may have run', async () => {
  assert.equal((await post([named('TimeoutError'), 200])).calls.length, 1);
  assert.equal((await post([500, 200])).calls.length, 1);
  assert.equal((await post([401, 200])).calls.length, 1);
});

test('flow forward gives up after three tries', async () => {
  const { result, calls } = await post([429, 502, 504, 200]);
  assert.equal(calls.length, 3);
  assert.deepEqual(result, { ok: false, attempts: 3, status: 504 });
});

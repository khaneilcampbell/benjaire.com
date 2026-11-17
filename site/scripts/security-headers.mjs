// Writes dist/_headers with security headers for every static page (PRD §8.2).
// Inline scripts emitted by Astro are allowed by their SHA-256 hash, so the
// policy needs no 'unsafe-inline' for scripts. Usage: node scripts/security-headers.mjs dist
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? 'dist';
const hashes = new Set();
// Recursive: pages in subfolders (dist/digital/*.html) carry inline scripts too.
for (const f of readdirSync(root, { recursive: true }).filter((n) => String(n).endsWith('.html'))) {
  const html = readFileSync(join(root, f), 'utf8');
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc=/.test(attrs) || /type="application\/ld\+json"/.test(attrs) || !body.trim()) continue;
    hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
  }
}

const turnstile = 'https://challenges.cloudflare.com';
// The Flow Installed thanks page embeds the Calendly kickoff booking.
const calendly = 'https://calendly.com';
// Cloudflare Web Analytics: the edge injects its beacon script, which reports
// to cloudflareinsights.com. Without these two hosts visits go uncounted.
const insightsScript = 'https://static.cloudflareinsights.com';
const insightsReport = 'https://cloudflareinsights.com';
const csp = [
  "default-src 'self'",
  `script-src 'self' ${[...hashes].join(' ')} ${turnstile} ${insightsScript}`.replace(/\s+/g, ' '),
  // Turnstile sizes its iframe with inline styles; scripts stay strict.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  `connect-src 'self' ${insightsReport}`,
  `frame-src ${turnstile} ${calendly}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const headers = `/*
  Content-Security-Policy: ${csp}
  Strict-Transport-Security: max-age=63072000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Cross-Origin-Opener-Policy: same-origin

/_astro/*
  Cache-Control: public, max-age=31536000, immutable

https://benjaire-com.benjaireco.workers.dev/*
  X-Robots-Tag: noindex
`;
writeFileSync(join(root, '_headers'), headers);
console.log(`_headers written: ${hashes.size} inline script hash(es) allowed.`);

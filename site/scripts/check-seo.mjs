// SEO guardrails for the built site (PRD US-7). Usage: node scripts/check-seo.mjs dist
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? 'dist';
const pages = readdirSync(root).filter((f) => f.endsWith('.html') && !f.startsWith('google'));
const errors = [];
const titles = new Map();
const meta = (html, re) => html.match(re)?.[1];

for (const f of pages) {
  const html = readFileSync(join(root, f), 'utf8');
  const title = meta(html, /<title>([^<]*)<\/title>/);
  const desc = meta(html, /<meta name="description" content="([^"]*)"/);
  const canonical = meta(html, /<link rel="canonical" href="([^"]*)"/);
  const og = meta(html, /<meta property="og:image" content="([^"]*)"/);
  if (!title) errors.push(`${f}: missing <title>`);
  else if (titles.has(title)) errors.push(`${f}: duplicate title (also ${titles.get(title)})`);
  else titles.set(title, f);
  if (!desc || desc.length < 50) errors.push(`${f}: meta description missing or under 50 characters`);
  if (!canonical || canonical.endsWith('.html') || !canonical.startsWith('https://benjaire.com/')) errors.push(`${f}: canonical must be a clean https://benjaire.com URL (got ${canonical})`);
  if (!og?.endsWith('.png')) errors.push(`${f}: og:image must be a PNG (got ${og})`);
  else if (!existsSync(join(root, new URL(og).pathname))) errors.push(`${f}: og:image file not found`);
  if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) errors.push(`${f}: must have exactly one <h1>`);
  // Indexable pages: snippet-friendly lengths and a self-contained entity graph.
  if (!/<meta name="robots" content="noindex"/.test(html)) {
    if (title && title.length > 60) errors.push(`${f}: title is ${title.length} characters (max 60)`);
    if (desc && (desc.length < 120 || desc.length > 160)) errors.push(`${f}: meta description is ${desc.length} characters (want 120 to 160)`);
    if (!html.includes('"@id":"https://benjaire.com/#organization","name"')) errors.push(`${f}: Organization schema node missing`);
  }
}

const sitemapPath = join(root, 'sitemap.xml');
if (!existsSync(sitemapPath)) errors.push('sitemap.xml missing');
else {
  for (const [, loc] of readFileSync(sitemapPath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const path = new URL(loc).pathname;
    const file = path === '/' ? 'index.html' : `${path.slice(1)}.html`;
    if (!existsSync(join(root, file))) errors.push(`sitemap lists ${loc} but ${file} doesn't exist`);
    else if (/<meta name="robots" content="noindex"/.test(readFileSync(join(root, file), 'utf8'))) errors.push(`sitemap lists noindex page ${loc}`);
  }
}

// security.txt (RFC 9116): must exist, name a contact, and not be about to expire.
const securityTxt = join(root, '.well-known', 'security.txt');
if (!existsSync(securityTxt)) errors.push('.well-known/security.txt missing');
else {
  const txt = readFileSync(securityTxt, 'utf8');
  const expires = Date.parse(txt.match(/^Expires:\s*(\S+)/m)?.[1] ?? '');
  if (!/^Contact:\s*\S+/m.test(txt)) errors.push('security.txt has no Contact');
  if (Number.isNaN(expires)) errors.push('security.txt has no valid Expires');
  else if (expires - Date.now() < 30 * 86_400_000) errors.push('security.txt Expires is under 30 days away: renew it (max one year ahead)');
}

for (const e of errors) console.error(`✗ ${e}`);
console.log(`${pages.length} pages checked, ${errors.length} SEO problem(s).`);
process.exit(errors.length ? 1 : 0);

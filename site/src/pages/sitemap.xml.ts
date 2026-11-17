import type { APIRoute } from 'astro';
import { SITE } from '../site';

// Public, indexable pages only. Legal pages join once counsel has reviewed
// them (they carry noindex until then; see PRD V-10).
const PATHS = ['/', '/digital', '/digital/flow', '/about', '/contact'];

export const GET: APIRoute = () => {
  const urls = PATHS.map((p) => `  <url><loc>${new URL(p, SITE.url).href}</loc></url>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

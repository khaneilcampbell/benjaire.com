# Benjaire.com

Website for Benjaire, a New York company that builds workflow automation and digital systems for service firms. Benjaire is one business, **Digital Solutions**, and its first product is **Benjaire Flow**. (Consumer Brands was retired on 2026-11-07.)

Live at **https://benjaire.com**.

## Pages

| Path | Page |
|---|---|
| `/` | Home |
| `/digital` | Digital Solutions |
| `/digital/flow` | Benjaire Flow, the first Digital Solutions product (self install n8n inquiry automation kit), and Flow Installed, the kit set up for the client after a fit call |
| `/digital/flow-thanks` | Post purchase page the Stripe Payment Link redirects to, `noindex` |
| `/about` | About |
| `/contact` | Contact form (Digital Solutions, general, partnership inquiries) |
| `/privacy`, `/terms` | Legal drafts, `noindex` and out of the sitemap until reviewed |

Legacy `.html` URLs (for example `/about.html`) redirect permanently to the clean paths. `/brands`, `/companies` and `/insights` redirect to `/digital`.

## Stack

- [Astro](https://astro.build) static site in [`site/`](site/)
- Hosted on **Cloudflare Workers** static assets (`site/wrangler.jsonc`), with `www` redirecting to the apex domain
- Contact form handled by a small Worker at `/api/contact` (Turnstile, validation, rate limit). Valid inquiries are forwarded to the Benjaire Flow intake in n8n (`FLOW_INTAKE_URL`, `FLOW_KEY` secret), with Cloudflare Email Routing as the fallback
- Benjaire Flow checkout uses Stripe Payment Links set in `FLOW_CHECKOUT` (`site/src/site.ts`); a tier without a link falls back to the contact form. Payment verification, order records and the download email run in n8n, outside this repository
- Security headers (CSP with script hashes, HSTS, `X-Frame-Options: DENY`) generated at build time
- Design system v0.3 "The Pavilion": see [`docs/design-system.md`](docs/design-system.md)

Setup, commands, file layout and Cloudflare settings are in [`site/README.md`](site/README.md).

## Quick start

Requires Node 22.12 or newer.

```bash
cd site
npm ci
npm run dev
```

Then open http://localhost:4321.

## Before pushing

Run the full check suite from `site/` and make sure it exits 0:

```bash
npm run ci
```

It runs type checks, Worker tests, the build, internal link checks and SEO checks. GitHub Actions ([`site-ci.yml`](.github/workflows/site-ci.yml)) runs the same checks plus axe accessibility tests (WCAG 2.2 AA).

## Deployment

Cloudflare Workers Builds deploys `main` to production automatically (`npx wrangler deploy`). Pull request branches get a preview at `<branch>-benjaire-com.benjaireco.workers.dev`. Changes reach `main` through pull requests; see [CONTRIBUTING.md](CONTRIBUTING.md).

## Content rules

- Benjaire stays company first: no founder name, personal bio, photo or personal social links anywhere on the site.
- Shared company copy lives in `site/src/site.ts`. Reuse the canonical description word for word rather than paraphrasing it per page.
- House style: "a New York company", US spelling, no em dashes and no hyphenated compounds in visible copy. Meta descriptions are 120 to 160 characters.
- Never commit secrets. Worker secrets are set in the Cloudflare dashboard only.
- Never commit n8n workflow JSON or the Benjaire Flow product files; they are sold separately.

## Documentation

- [`docs/PRD.md`](docs/PRD.md): product requirements
- [`docs/adr/`](docs/adr/): architecture decision records
- [`docs/design-system.md`](docs/design-system.md): visual language, tokens and logo rules
- [`docs/runbooks/launch-cutover.md`](docs/runbooks/launch-cutover.md): the completed move from GitHub Pages to Cloudflare

## Legacy site

The retired GitHub Pages site (root `.html` files, `assets/`, `CNAME` and its audit scripts) was removed in the post launch cleanup. It remains in git history before that commit.

# Benjaire.com

Website for Benjaire, a New York company developing consumer brands and digital solutions that combine technology, design, and business innovation. Benjaire is one company with two business pillars, **Digital Solutions** and **Consumer Brands**, under one identity.

Live at **https://benjaire.com**.

## Pages

| Path | Page |
|---|---|
| `/` | Home |
| `/digital` | Digital Solutions |
| `/digital/flow` | Benjaire Flow, the first Digital Solutions product (self install n8n inquiry automation kit), and Flow Installed, the kit set up for the client after a fit call |
| `/digital/flow-thanks` | Post purchase page Stripe redirects to, `noindex` |
| `/digital/flow-cancel` | Page a buyer lands on after cancelling a Stripe Checkout session, `noindex` |
| `/about` | About |
| `/brands` | Consumer Brands |
| `/contact` | Contact form (Digital Solutions, general, partnership, supplier inquiries) |
| `/privacy`, `/terms`, `/refunds` | Legal drafts, `noindex` and out of the sitemap until reviewed |

Legacy `.html` URLs (for example `/about.html`) redirect permanently to the clean paths.

## Stack

- [Astro](https://astro.build) static site in [`site/`](site/)
- Hosted on **Cloudflare Workers** static assets (`site/wrangler.jsonc`), with `www` redirecting to the apex domain
- Contact form handled by a small Worker at `/api/contact` (Turnstile, validation, rate limit). Valid inquiries are forwarded to the Benjaire Flow intake in n8n (`FLOW_INTAKE_URL` and `FLOW_INTAKE_KEY` secrets), with Cloudflare Email Routing as the fallback
- Benjaire Flow checkout: the same Worker serves `/api/checkout`, which creates a Stripe Checkout Session for the tier's price ID in `STRIPE_TIERS` (`site/wrangler.jsonc`) when `STRIPE_SECRET_KEY` is set. Without that secret, or on any Stripe error, buyers are sent to the tier's Stripe Payment Link from `FLOW_CHECKOUT` (`site/src/site.ts`); a tier with no link falls back to the contact form. Payment verification, order records and the download email run in n8n, outside this repository
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
- Brands appear only once they are publicly approved (`site/src/content/brands/`). This repository is public, so never commit unreleased brands.
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

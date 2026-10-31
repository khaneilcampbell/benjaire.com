# benjaire.com (Astro)

The Benjaire website, live at https://benjaire.com. It is built with Astro and
deployed to Cloudflare Workers static assets (ADR-0002). The retired GitHub
Pages site was removed from the repository root after launch and survives only
in git history.

## Run locally

Requires Node 22.12 or newer.

```bash
cd site
npm ci
npm run dev        # http://localhost:4321
npm run build      # static output in site/dist
npm run preview    # serve the build
```

## Checks (also run in CI: `.github/workflows/site-ci.yml`)

Run `npm run ci` before pushing to `main` and make sure it exits 0. It runs
everything below except the accessibility tests, which need Chromium
(`npx playwright install chromium`).

```bash
npx astro check        # types
npm run check:worker   # Worker types
npm run test:worker    # Worker unit tests
npm run build
npm run test:links     # internal links and assets
npm run test:seo       # titles <= 60 chars, meta descriptions 120 to 160
npm run test:a11y      # axe, WCAG 2.2 AA, desktop and mobile widths
```

To run the form locally, create `site/.dev.vars` (git-ignored) with
`TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA` (Cloudflare's always-pass test secret)
and `CONTACT_TO=you@example.com`, then `npx wrangler dev`.

## Where things live

| Path | What |
|---|---|
| `src/site.ts` | Company facts, nav, inquiry categories, supplier areas |
| `src/styles/global.css` | Design tokens and styles (see `docs/design-system.md`) |
| `src/styles/home.css`, `src/scripts/home.ts` | Homepage layout and motion |
| `src/layouts/Base.astro` | Page shell: meta tags, JSON-LD, nav, footer |
| `src/components/` | Shared components, including `LogoMark.astro` and `PageBand.astro` |
| `src/assets/` | Pavilion renders for the homepage and inner pages |
| `src/pages/` | One file per page |
| `src/content/brands/` | Brand entries (one JSON file per **publicly approved** brand) |
| `src/scripts/contact.ts` | Contact form behaviour in the browser |
| `worker/` | Cloudflare Worker for `/api/contact` (Turnstile check, validation, rate limit, email, optional forward to the Flow intake) and `/api/checkout` (Stripe Checkout Session, with Payment Link fallback). `lib.ts` is unit-tested |
| `scripts/security-headers.mjs` | Writes `dist/_headers` (CSP with inline-script hashes, HSTS, etc.) after each build |
| `public/_redirects` | Permanent redirects from the legacy `.html` URLs |
| `public/brand/` | Identity v4 logo files: charcoal, plus `-cream` (pearl) reverses. Regenerate with `node scripts/build-logos.mjs public/brand` |
| `public/brand/email/` | PNG logos for email clients that do not render SVG (header lockup, signature tile and wordmark, 512px avatar), rendered at 3× from the SVGs above. `email-header-lockup-pearl.png` is the pearl gradient lockup for the dark email header (`docs/design/logo/v3/svg/*-pearl.svg`); `email-header-lockup-graphite.png`, `email-mark-tile-pearl.png` and `benjaire-avatar-2048.png` follow the primary logo (graphite gradient on pearl, `docs/design/logo/v3/svg/*-graphite.svg`). Referenced by absolute URL from outgoing emails, so keep the file names stable |

## Adding a brand

See `src/content/brands/README.md`. This repository is public: never commit
unreleased brands.

## Cloudflare settings (Workers & Pages → Create → Import a repository)

Cloudflare's current flow deploys static sites as a Worker with static assets,
configured by `wrangler.jsonc` in this folder.

| Setting | Value |
|---|---|
| Project name | `benjaire-com` (must match `name` in `wrangler.jsonc`) |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` (production branch `main`) |
| Non-production branch deploy command | `npx wrangler preview` (uses the `previews` block in `wrangler.jsonc`) |
| Advanced settings → Path (root directory) | `site` |
| Advanced settings → Build variables | `NODE_VERSION` = `22` |
| Preview builds | On |

In the current dashboard these live under **Settings → Builds**: the **Production** tab holds the deploy command, and the **Previews Base** tab holds the preview command. A preview build that runs `npx wrangler versions upload` fails with "The name in your wrangler.jsonc file (benjaire-com) must match the name of your Worker"; set the Previews Base command to `npx wrangler preview`.

### Worker secrets (Settings → Variables and secrets, type **Secret**)

| Name | Value |
|---|---|
| `TURNSTILE_SECRET_KEY` | Secret key of the Turnstile widget |
| `CONTACT_TO` | The verified Email Routing destination that receives inquiries |
| `CATEGORY_RECIPIENTS` (optional) | JSON such as `{"supplier":"sourcing@benjaire.com"}` to route a category elsewhere; each address must be a verified destination |
| `FLOW_INTAKE_URL` (optional) | Benjaire Flow intake webhook, `https://<your-n8n-instance>/webhook/flow-intake`. With `FLOW_INTAKE_KEY` set, each delivered inquiry is also forwarded to Flow (AI sorting, owner alert with status buttons, acknowledgement to the sender) |
| `STRIPE_SECRET_KEY` (optional) | Stripe secret key for `/api/checkout`. Use a **restricted key** with only *Checkout Sessions: Write*. Production gets the live key; previews get an `sk_test_` key plus test-mode price IDs in `previews.vars.STRIPE_TIERS`. Without it, buy buttons fall back to the Stripe Payment Links (no cancel page) |
| `FLOW_INTAKE_KEY` (optional) | The Flow intake key (the `intake_key` in n8n's `flow_settings` table), sent as the `x-flow-key` header |

Never put these values in the repository; it is public.

## Domains

`benjaire.com` and `www.benjaire.com` are attached to the Worker as custom
domains in the Cloudflare dashboard (not in `wrangler.jsonc`). A Redirect Rule
sends `www` to the apex with a 301, and Always Use HTTPS is on. Pull request
previews live at `<branch>-benjaire-com.benjaireco.workers.dev`. Preview
bindings are not inherited, so any new binding must also be added to the
`previews` block.

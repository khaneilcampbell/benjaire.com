# benjaire.com

Public website for Benjaire, a New York company with two pillars, Digital Solutions and Consumer Brands. This repository is **public**: everything committed here, including this file, is visible to anyone.

## Commands (run from `site/`, Node 22.12 or newer)

- Install: `npm ci`
- Develop: `npm run dev` (http://localhost:4321)
- Full check before any PR, must exit 0: `npm run ci`
- Accessibility (also runs in CI): `npm run test:a11y` after a build

## Non negotiable rules

- Company first: no founder or personal name, photo, biography, personal email or social link anywhere, including commits, PRs and code comments. No links to any personal portfolio.
- Never commit secrets. Worker secrets are set in the Cloudflare dashboard only. Stripe Payment Links and the Turnstile site key in `site/src/site.ts` are public by design.
- Never commit n8n workflow JSON, Benjaire Flow product files, private research, pricing internals or unreleased brands.
- `main` deploys to production automatically. Work on a `type/short-description` branch and open a PR with a Conventional Commits title; the owner squash merges.
- Changes to DNS, email routing, hosting, or a new vendor or data store need owner approval and an ADR in `docs/adr/`.
- Visual changes are previewed for the owner before they go live.

## Read on demand (do not preload)

| When the task involves | Read |
|---|---|
| Pages, layout, setup, Cloudflare settings | `site/README.md` |
| Colors, type, logo, components, motion | `docs/design-system.md` (v0.3 and the product layer are current; v0.2 is history) |
| Shared company copy and settings | `site/src/site.ts` (reuse its description word for word) |
| Requirements and scope | `docs/PRD.md` (parts predate the Cloudflare cutover; code and README win on conflict) |
| Why a technical choice was made | `docs/adr/README.md` |
| Business context beyond this site | private `khancam15/benjaire-strategy`, starting with its `CLAUDE.md` (attach the repo if needed; never copy its content here) |

Path scoped rules in `.claude/rules/` load automatically when matching files are opened.

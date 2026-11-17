---
paths:
  - "site/worker/**/*"
  - "site/wrangler.jsonc"
  - "site/scripts/security-headers.mjs"
---

# Worker and edge rules

- `/api/contact` must keep Turnstile verification, input validation and the rate limit. Valid inquiries go to the Flow intake in n8n (`FLOW_INTAKE_URL`, `FLOW_KEY`); Cloudflare Email Routing is the fallback. Never weaken either path. See `docs/adr/0004-contact-form-processing.md`.
- Secrets are read from the Worker environment only; never log them or echo request bodies containing personal data.
- `npm run build` runs `security-headers.mjs`, which hashes every inline script in the built HTML into the CSP. Never add `unsafe-inline` to `script-src`, and never inject scripts at runtime, since they would bypass the hashes. A new third party origin (as with Turnstile and Calendly) is added explicitly in that script.
- Keep HSTS and `X-Frame-Options: DENY`.
- Add or update tests in `worker/lib.test.ts` for any behavior change, then run `npm run ci`.
- Changes to routes, bindings or domains in `wrangler.jsonc` affect production on merge; call them out in the PR.

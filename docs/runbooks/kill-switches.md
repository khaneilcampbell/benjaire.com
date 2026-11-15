# Kill switches and caps

How to stop each unattended path that emails customers or talks to Stripe, without a deploy.
Every switch is off by default, so nothing changes until one is set.

## Website Worker (`site/worker`)

| Switch | What stops | What the visitor sees |
|---|---|---|
| `CONTACT_PAUSED=1` | The inquiry email, the Benjaire Flow forward and the Atlas inbox copy | "The contact form is paused for a moment" (HTTP 503) |
| `CHECKOUT_PAUSED=1` | Every Stripe API call from the Worker (Checkout Sessions) | The tier's Stripe Payment Link, so buying still works |

Accepted "on" values: `1`, `true`, `yes`, `on`. Anything else, or no value, means running.

**To turn one on:** Cloudflare dashboard → Workers & Pages → `benjaire-com` → Settings →
Variables and Secrets → Add → type **Secret**, name `CONTACT_PAUSED` (or `CHECKOUT_PAUSED`),
value `1` → Deploy. Use the Secret type: plain-text variables that are not in `wrangler.jsonc`
are dropped by the next deploy from `main`, secrets are kept.
Link: https://dash.cloudflare.com/?to=/:account/workers/services/view/benjaire-com/production/settings

**To turn it off:** delete the secret (or set it to `0`) and deploy.

**To stop sales completely:** also deactivate the Payment Links in Stripe → Payment Links
(https://dashboard.stripe.com/payment-links), because a paused checkout sends buyers there.

Each paused request is reported to AI Ops Atlas as a `skipped` run with the reason, so a
switch left on by mistake is visible there.

### Caps that are always on

- 5 contact submissions and 5 checkout starts per minute per visitor IP (`CONTACT_LIMITER`).
- 20 contact submissions and 20 checkout sessions per minute site-wide (`SITE_LIMITER`).
  Past the checkout cap, buyers go to the Payment Link; the cap and any Stripe error are
  reported to Atlas.
- Cloudflare Email Routing can only deliver to verified destination addresses, so the Worker
  can never email a visitor, only the owner's inboxes.

## n8n workflows (Benjaire Flow and the shop)

The intake, delivery and follow-up workflows run on n8n Cloud. Each has its own pause flag in
its settings data table; the switch, its default and how to flip it are documented in the AI
Ops Atlas runbook for these agents:
https://github.com/khaneilcampbell/ai-ops-atlas/blob/main/docs/runbooks/benjaire-com.md

The fastest stop for any n8n workflow is still to unpublish it in n8n
(https://khancam15.app.n8n.cloud/home/workflows → open it → toggle Published off).

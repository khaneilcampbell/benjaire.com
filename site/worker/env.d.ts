// Secrets and optional settings configured in the Cloudflare dashboard.
// They are not in wrangler.jsonc because this repository is public.
interface Env {
  TURNSTILE_SECRET_KEY: string;
  /** Verified Email Routing destination that receives inquiries. */
  CONTACT_TO: string;
  /** Optional JSON map of category → verified destination address. */
  CATEGORY_RECIPIENTS?: string;
  /** Optional Benjaire Flow intake webhook (n8n). Both must be set to forward inquiries. */
  FLOW_INTAKE_URL?: string;
  /** Shared secret sent as the x-flow-key header. */
  FLOW_INTAKE_KEY?: string;
  /** Stripe secret key for Checkout Sessions (sk_live_ in production, sk_test_ in previews). */
  STRIPE_SECRET_KEY?: string;
  /** Optional AI Ops Atlas run feed, e.g. https://ai-ops-atlas.pages.dev/api/hooks/agents. */
  ATLAS_FEED_URL?: string;
  /** Atlas's write-only AGENT_FEED_TOKEN. Both must be set to report runs. */
  ATLAS_FEED_TOKEN?: string;
}

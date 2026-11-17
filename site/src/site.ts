// Company facts and shared settings. Company-first: never add a person's
// name, photo, bio or private contact details here (PRD §3.2).
export const SITE = {
  name: 'Benjaire',
  // Legal entity: legal pages and Organization schema.
  legalName: 'Benjaire LLC',
  // Canonical company description: homepage lead and Organization schema.
  // Reuse it word for word on company profiles; don't paraphrase per page.
  description:
    'Benjaire is a New York company that builds workflow automation and digital systems for service firms. Its first product is Benjaire Flow, the inquiry system that makes sure every inquiry is answered on time.',
  // Default meta description (120 to 160 characters).
  metaDescription:
    'Benjaire is a New York company that builds workflow automation and digital systems for service firms, starting with Benjaire Flow.',
  // Short boilerplate for footers, social bios and directories.
  boilerplate:
    'Benjaire builds workflow automation and digital systems for service firms. Based in New York.',
  // Company slogan: title tag, share card, Organization schema and home hero.
  // The hero splits it at the full stop. Keep scripts/build-og.mjs in sync.
  slogan: ['Building brands.', 'Powering businesses.'],
  url: 'https://benjaire.com',
  email: 'contact@benjaire.com',
  location: 'New York, NY',
  founded: 2022,
} as const;

export const NAV = [
  { href: '/digital', label: 'Digital Solutions' },
  { href: '/digital/flow', label: 'Flow' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

// Inquiry categories (PRD §3.4). `value` is what the URL (?category=) and
// the form handler use; routing to inboxes is configured server-side (M5).
export const CATEGORIES = [
  { value: 'digital', label: 'Digital Solutions' },
  { value: 'general', label: 'General Business Inquiry' },
  { value: 'partnership', label: 'Partnership' },
] as const;

// Cloudflare Turnstile site key (public by design). The secret key lives
// only in the Worker's secrets as TURNSTILE_SECRET_KEY.
export const TURNSTILE_SITE_KEY = '0x4AAAAAAFVZs6h_1DsCs70r';

// Benjaire Flow checkout (Stripe Payment Links, public by design). A tier with
// a link gets a buy button to /api/checkout, which opens a Stripe Checkout
// Session and falls back to this link; an empty link sends that tier's button
// to the contact form. Keep in sync with PAYMENT_LINKS in worker/lib.ts.
// Each link should redirect after payment to /digital/flow-thanks?tier=<key>.
// done_for_you is Flow Installed: with a link, buyers pay first and book their
// kickoff call on the thanks page; while it is empty the button books a fit call.
export const FLOW_CHECKOUT = {
  starter: 'https://buy.stripe.com/5kQfZjd5C99Qf7Ta0R5AQ02',
  professional: 'https://buy.stripe.com/aFabJ31mUdq63pb0qh5AQ03',
  done_for_you: '',
} as const;

// Calendly event for prospects (fit and discovery calls), embedded by the
// Booking component: the free 30 minute "Benjaire workflow review". Link one
// event, not the profile page, so buyer-only events (the Professional setup
// call, the Flow Installed kickoff) are never offered to prospects.
export const BOOKING_URL = 'https://calendly.com/benjaireco/free-consultation-benjaire';

// Calendly event Flow Installed buyers book on the thanks page after paying.
export const FLOW_INSTALLED_KICKOFF = 'https://calendly.com/benjaireco/flow-installed-kickoff-call';

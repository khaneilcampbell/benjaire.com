# Benjaire.com — Product Requirements Document (v0.2)

> **Update 2026-11-07: Consumer Brands retired.** Benjaire is now one business, **Digital Solutions** (workflow automation and digital systems for service firms; first product Benjaire Flow). Everything below about brands, the Brands page, the brand content model, suppliers and manufacturing is **retired** and kept only as history: §3.3, §3.5, §4.3, US-2, US-4 and the brand rows in §4.1, §11 and §12. `/brands` now redirects to `/digital`, and the contact categories are Digital Solutions, General Business Inquiry and Partnership. Slogan unchanged: "Building brands. Powering businesses." (owner decision 2026-11-09, read as building clients' brands).

| | |
|---|---|
| **Status** | **Approved by owner 2026-10-13** (M0). Each later milestone has its own approval gate. |
| **Revised** | 2026-10-13. v0.2 incorporates the owner's discovery responses. v0.2.1 records the confirmed infrastructure facts (§2, §9). |
| **Product** | benjaire.com, Benjaire's corporate website and parent-brand home |
| **Tagline** | Brands for the Modern Era |
| **Related** | Architecture Decision Records in [`docs/adr/`](adr/) |

## How to read this document

Every requirement and decision carries one of four labels:

| Label | Meaning |
|---|---|
| **[CONFIRMED]** | Stated by the owner. Treated as a requirement. |
| **[PROPOSED]** | My recommendation. Not adopted until approved. |
| **[VERIFY]** | A fact or decision that has to be checked before the work that depends on it can start. |
| **[FUTURE]** | Possible later work. Explicitly **not** in the MVP. |

Nothing labelled PROPOSED or VERIFY should be treated as fact.

---

## 1. Summary

Benjaire needs a credible, company-first home for the parent brand. It should explain what Benjaire is, show public brands when they exist, and route business inquiries to one inbox. The site must be built so brands and pages can be added later without a redesign, and it must avoid backend complexity that no current business need justifies.

**Guiding priorities [CONFIRMED], in order:** business credibility → design quality → performance → security → search visibility → maintainability → scalability → cost efficiency.

**Guiding principle [CONFIRMED]:** prefer simple, reliable, managed technology. Add no authentication, database, customer portal, microservices, or AI-agent infrastructure without a defined business requirement.

## 2. Current State (from the repository)

| Area | Finding | Source |
|---|---|---|
| Pages | `index.html` (its "Our Brands" section is empty), `about.html`, `contact.html` | Repo |
| Stack | Hand-written HTML, shared `assets/site.css` and `assets/site.js`, Google Fonts (Archivo and Inter) | Repo |
| Design | A neutral sand/beige/black/white palette with one umber accent, contrast ratios recorded in comments, hairline rules, no shadows | `assets/site.css` |
| Hosting | **GitHub Pages** from `main`, with a `CNAME` file for `benjaire.com` **[CONFIRMED]** | Repo, README, GitHub repo settings (Pages enabled) |
| DNS provider | **Cloudflare [CONFIRMED]**. Email Routing only works on domains whose DNS is on Cloudflare. | Owner; repo description ("GitHub Pages and Cloudflare") |
| Email for `contact@benjaire.com` | **Cloudflare Email Routing**, forwarding to the owner's private inbox **[CONFIRMED]**. It's a forwarder, not a mailbox. | Owner |
| Repository visibility | **Public [CONFIRMED]** | GitHub API |
| Contact form | Client-side **EmailJS**. No server-side validation and no bot protection. | `contact.html` |
| Security | CSP in a `<meta>` tag. Browsers **ignore** `frame-ancestors` in a meta CSP, so the anti-clickjacking rule isn't enforced. No HSTS control. | Repo |
| SEO | Titles, meta, Open Graph, `Organization` JSON-LD, sitemap, robots, Search Console verification file | Repo |
| Assets | `hero-bg.png` is 6.3 MB and `hero-bg.webp` is 137 KB | Repo |

> **What this means:** DNS is already on Cloudflare, so moving hosting to Cloudflare Pages does **not** need a nameserver change. MX and Email Routing records stay untouched, and the cutover only replaces the website records for `benjaire.com` (and `www`). That greatly lowers the email risk. DNS review completed with the owner on 2026-10-13. Record values are kept out of this public repository. Findings:
1. The website records are **DNS only** (not proxied), so nothing adds security headers today.
2. The site's apex record doesn't use GitHub's full recommended record set. This only matters if we stay on GitHub Pages.
3. **No DMARC record exists. [PROPOSED]** Add one in monitoring mode (`p=none`), then tighten to `p=quarantine` after clean reports. This is a DNS change that needs approval and is independent of the website build.
4. The zone also hosts records outside this project. The cutover changes **only** the two website records.

## 3. Confirmed Requirements

### 3.1 Site structure [CONFIRMED]
1. Home
2. About
3. Brands
4. Contact
5. Privacy Policy
6. Terms of Use, where appropriate

The previous three-page limit is retired. New pages are added **only when they serve a clear business purpose.**

### 3.2 Corporate identity [CONFIRMED]
- Company-first identity, with company-focused language throughout.
- No founder name, personal photographs, biographies, personal addresses, or private contact details without explicit approval.
- The site must stay separate from any personal or professional portfolio sites (no cross-links).

### 3.3 Brands [RETIRED 2026-11-07]
- A scalable Brands page that supports name, description, logo, website URL, and development status.
- Brands can be added, updated, or removed without significant code changes.
- **No invented brand names, launches, or portfolio entries.**
- If no brand is approved for publication, the page ships with an honest, well-designed empty state.
- Unreleased projects stay private.
- **There are no public brands at launch [CONFIRMED].** The Brands page ships with the empty state.

### 3.4 Inquiries [CONFIRMED]
- All inquiries go to **contact@benjaire.com** (one central inbox).
- Categories: **General Inquiry, Business Partnership, Supplier / Manufacturing, Brand Collaboration, Other.**
- Routing must allow per-category addresses later without rebuilding the form.
- Spam prevention, input validation, and secure server-side processing.
- No email address is shown publicly unless it is configured and working.

### 3.5 Suppliers & manufacturing [RETIRED 2026-11-07]
- Benjaire is *exploring* supplier relationships for consumer technology accessories, smartphone accessories, laptop accessories, audio device accessories, and lifestyle products.
- Sourcing interest: China and other international manufacturing markets.
- **No** minimum order quantities. **No** claims about existing partnerships, production capabilities, or supplier relationships.
- Supplier inquiries go through the Contact page. No supplier portal.

### 3.6 Design direction [CONFIRMED]
- **Refine and modernize** the existing design. Do not replace it.
- Minimalist, premium, contemporary, corporate, technology-forward, with clean typography, strong hierarchy, subtle animation, consistent branding, and excellent mobile layouts.
- Preserve the recognizable elements of the current identity.
- No Figma files or brand guidelines exist yet, so a **documented design system** must be produced.
- **Visual changes are presented for approval before implementation.**

### 3.7 Infrastructure guardrails [CONFIRMED]
- Cloudflare Pages is the *preferred candidate*. Migration is **not approved**.
- No changes to DNS records, email routing, or production hosting without approval.
- All existing email functionality must be preserved.
- Favor managed, low-maintenance infrastructure.

## 4. MVP Scope

### 4.1 Pages

| Page | Content | Notes |
|---|---|---|
| **Home** | Hero (name, tagline, one-sentence description), a "What we do" summary (build, operate, grow brands across consumer tech, digital, and lifestyle), a Brands teaser, a call to action to Contact | Brands teaser hides itself when no brand is published **[PROPOSED]** |
| **About** | Mission, approach, focus areas, principles, company facts (New York, NY; est. 2022) | Company-first and no individuals. Founding year to be **[VERIFY]**'d before re-publishing. |
| **Brands** | Brand cards rendered from content files; empty state when there are none | See 4.3 |
| **Contact** | Categorized inquiry form, direct email, response-time expectation, and a short **"Working with suppliers"** section listing areas of interest | The supplier section stays on Contact so we don't add a page **[PROPOSED]** |
| **Privacy Policy** | Data collected by the form, processors, retention, rights, contact | Required because the form collects personal data. Needs legal review. |
| **Terms of Use** | Site use terms, IP, disclaimers | **[PROPOSED]** for launch; owner said "where appropriate" |
| **404** | Branded not-found page with links back | System page, not in nav |

**Navigation [PROPOSED]:** About · Brands · Contact. The footer adds Privacy, Terms, email, and location.

**URLs [PROPOSED]:** `/`, `/about`, `/brands`, `/contact`, `/privacy`, `/terms`. The legacy `/about.html` and `/contact.html` redirect to the new URLs (see ADR-0003 for how).

### 4.2 Features

| ID | Feature | Label |
|---|---|---|
| F-1 | Shared layout (header, nav, footer, meta) defined once | CONFIRMED (needed for maintainability) |
| F-2 | Accessible responsive navigation that works without JavaScript | CONFIRMED |
| F-3 | Brand content model, validated at build time | CONFIRMED |
| F-4 | Brands page plus empty state | CONFIRMED |
| F-5 | Categorized contact form with server-side processing, spam protection, validation, and a config-driven category→recipient map | CONFIRMED |
| F-6 | Privacy and Terms pages | CONFIRMED / PROPOSED |
| F-7 | SEO: generated sitemap, canonical tags, Open Graph images, JSON-LD | PROPOSED |
| F-8 | Cookieless, privacy-friendly analytics | PROPOSED, needs approval |
| F-9 | Documented design system and tokens | CONFIRMED |
| F-10 | HTTP security headers (CSP, HSTS, frame-ancestors) | PROPOSED; depends on the hosting decision |

### 4.3 Brand content model [RETIRED 2026-11-07]

One file per **publicly approved** brand:

| Field | Required | Notes |
|---|---|---|
| `name` | yes | |
| `slug` | yes | Stable ID |
| `description` | yes | ≤ 160 characters |
| `category` | yes | consumer-tech · digital · lifestyle |
| `status` | yes | `live` · `coming-soon` (only for publicly announced brands) |
| `website` | no | Required when `status` is `live` |
| `logo` | yes | SVG preferred |
| `order` | no | Display order |
| `featured` | no | Shows on the Home teaser |

**Privacy rule:** unreleased or unapproved brands are **never committed to this repository**, not even as drafts or hidden entries. Anything in Git can be found in the commit history, and anything in the built site can be discovered. Private pipeline tracking stays outside this codebase. **[VERIFY]** whether this GitHub repository is public or private. The repository is **public [CONFIRMED]**, so this rule is mandatory.

**Empty state [PROPOSED]:** a short, factual statement that Benjaire's portfolio is in development and brands will be announced here, plus a call to action for partnership inquiries. No placeholder logos, no "coming soon" cards for unnamed brands, and no fabricated entries.

### 4.4 Out of scope for the MVP [FUTURE]
Individual brand sites hosted here, e-commerce, customer accounts, partner collaboration tools, supplier management or a supplier portal, a CMS editing UI, newsletter, careers, newsroom, multi-language, per-category inboxes, authentication, databases.

## 5. User Stories & Acceptance Criteria

**US-1 — Understand Benjaire.** *As a visitor, I want to understand what Benjaire is within seconds.*
- AC1: The hero shows the name, tagline, description, and a primary call to action above the fold at 375px and 1440px widths.
- AC2: The copy is company-first. No individual's name, photo, or bio appears anywhere on the site.
- AC3: Mobile LCP is ≤ 2.5s (lab test, simulated 4G).

**US-2 — Browse public brands. [RETIRED 2026-11-07]** *As a partner or consumer, I want to see Benjaire's public brands and visit them.*
- AC1: The Brands page renders only from brand content files.
- AC2: With **zero** files, the page shows the empty state, and the Home teaser is hidden or shows the same message. No placeholder entries appear.
- AC3: With one or more files, each card shows the name, logo (with alt text), category, description, and status. `live` cards link out with `rel="noopener noreferrer"` and an accessible "(opens external site)" label.
- AC4: The build **fails** if a brand file is missing a required field or if a `live` brand has no `website`.
- AC5: Adding, editing, or removing a brand needs only a content file and a logo, with no template changes.

**US-3 — Send a categorized inquiry.** *As a partner, supplier, or collaborator, I want to contact Benjaire about my topic.*
- AC1: The fields are Name (required), Email (required, validated), Company (optional), Category (required, one of the five confirmed values), Message (required, 20–5,000 characters), and a privacy acknowledgement.
- AC2: `?category=supplier` (and the other categories) pre-selects the category.
- AC3: Validation runs in the browser **and** on the server. Errors are tied to their fields and announced to screen readers.
- AC4: Bot protection (Cloudflare Turnstile or equivalent), a honeypot field, and a rate limit block automated spam without a visible puzzle for most people.
- AC5: Every submission is delivered to `contact@benjaire.com` with the category in the subject line, for example `[Supplier / Manufacturing] …`, and Reply-To set to the sender.
- AC6: The category→recipient map lives in a single config. Changing one category's recipient needs no form or template change.
- AC7: Success and failure states are clear. On failure, the visitor's input is kept and the direct email address is shown.
- AC8: No secret key appears in client-side code or in the repository.

**US-4 — Supplier orientation. [RETIRED 2026-11-07]** *As a manufacturer, I want to know whether to reach out.*
- AC1: The Contact page lists the confirmed areas of interest and sourcing regions, phrased as "exploring" or "interested in".
- AC2: The page shows no MOQs, no partner names, and no capability claims.
- AC3: The "Supplier inquiry" call to action pre-selects the Supplier / Manufacturing category.

**US-5 — Trust & privacy.**
- AC1: Privacy and Terms are linked in every footer.
- AC2: No non-essential cookies are set. The privacy policy lists every processor actually in use.

**US-6 — Accessibility.**
- AC1: WCAG 2.2 AA: keyboard-only operation, visible focus, a skip link, ≥ 4.5:1 text contrast, labelled form controls, and `prefers-reduced-motion` respected.
- AC2: axe reports zero serious or critical violations on every page.

**US-7 — Search visibility.**
- AC1: Each page has a unique title, description, canonical tag, and Open Graph image.
- AC2: `Organization` and `WebSite` JSON-LD validate. The Brands page adds `ItemList` only when brands exist.
- AC3: Legacy `.html` URLs resolve to the new URLs without a broken link.
- AC4: The sitemap is generated at build time and lists only public pages.

## 6. Non-Functional Requirements

| Area | Requirement |
|---|---|
| **Performance** | Lighthouse ≥ 95 in all categories on mobile. LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms. First-load page weight ≤ 500 KB. JS ≤ 50 KB gzipped, used for progressive enhancement only. Self-hosted, subset fonts. Retire the 6.3 MB PNG. |
| **Security** | Strict CSP without `'unsafe-inline'`. `frame-ancestors 'none'`, HSTS, `nosniff`, `Referrer-Policy`, and `Permissions-Policy` as **HTTP headers** (requires a host that supports them; see ADR-0002). Server-side validation and sanitization, rate limiting, secrets only in host environment variables. Keep the existing security-audit CI. |
| **Email deliverability** | Form email must authenticate (SPF/DKIM aligned with DMARC) so it doesn't land in spam. Any DNS change for this needs approval. |
| **Accessibility** | WCAG 2.2 AA (see US-6) |
| **SEO** | See US-7 |
| **Privacy** | Cookieless analytics (if approved), data minimization, and a stated retention period **[VERIFY]**. Legal pages reviewed by counsel. |
| **Maintainability** | Content in plain files, one shared layout, design tokens, a README runbook (add a brand, edit copy, deploy, roll back), preview deployments per pull request **[PROPOSED]**. |
| **Cost** | Target $0–10/month in recurring services at MVP traffic **[PROPOSED]**. |
| **Reliability** | Managed static hosting with no servers to patch. Rollback = redeploy the previous build. |

## 7. Design System Plan

**Approach [CONFIRMED]:** refine, don't replace, and get approval before implementing.

**Preserved elements [PROPOSED]:**
- The neutral palette (sand, beige, black, white, umber accent) and its recorded contrast ratios.
- Archivo for display text and Inter for body text.
- Hairline rules, no shadows, generous negative space.
- Wide-tracked uppercase labels on small UI, bold sentence-case headlines.

**Refinements to propose for review [PROPOSED]:**
- A formal type scale (fluid with `clamp()`), spacing scale, and grid.
- Self-hosted, subset fonts (faster, no Google Fonts call, simpler CSP).
- Brand card, form, button, and badge components, with all states (hover, focus, disabled, error, success).
- A restrained motion spec (opacity and translate under 300ms, disabled under reduced motion).
- No dark theme (owner decision 2026-10-13).

**Deliverables before implementation:**
1. `docs/design-system.md`: tokens, type, spacing, components, motion, voice and tone.
2. A static **visual proposal**: before/after screenshots of Home, Brands (empty and populated with clearly labelled *sample* data that never ships), and Contact, at desktop and mobile widths. These are presented for approval (Milestone M2).

## 8. Technical Architecture

### 8.1 Proposed architecture (summary)

```
Content (Markdown/JSON in Git) ──► Static site generator ──► Static HTML/CSS/assets
                                                                     │
                                         Managed static host + CDN ◄─┘
                                                │
Contact form ──POST──► One serverless function ─┴─► Email API ──► contact@benjaire.com
                       (validate, bot check,          (category → recipient map)
                        rate limit)
```

- **One static site plus one small serverless function.** No database, no auth, no microservices.
- Modular by design: brands are content, recipients are config, and the form handler is a single replaceable function. Future services (brand sites, commerce, portals) would be **separate applications** linked from this site, not bolted onto it.

### 8.2 Decisions (details in ADRs)

| Decision | Recommendation | Status | ADR |
|---|---|---|---|
| Frontend framework | **Astro** (static output) with content collections | ACCEPTED | [ADR-0001](adr/0001-frontend-framework.md) |
| Hosting | **Cloudflare Pages** (no nameserver change; cutover needs M6 approval) | ACCEPTED | [ADR-0002](adr/0002-hosting-platform.md) |
| DNS & email preservation | Zone audit and a migration/rollback plan before any change | ACCEPTED | [ADR-0003](adr/0003-dns-and-email-preservation.md) |
| Contact-form processing | Serverless function + Turnstile + transactional email API; replaces EmailJS | ACCEPTED | [ADR-0004](adr/0004-contact-form-processing.md) |

### 8.3 Fallback if the hosting migration is **not** approved
Astro still builds for GitHub Pages. Trade-offs: no HTTP security headers (meta CSP only, no `frame-ancestors`/HSTS control), and the form must use a hosted form backend that offers server-side validation and spam protection (for example Formspree with Turnstile/reCAPTCHA) or EmailJS hardened with a CAPTCHA. The MVP still ships; only the security posture is weaker.

## 9. Decisions Requiring Verification

| # | Item | Why it matters | Owner | Blocks |
|---|---|---|---|---|
| V-1 | ~~DNS provider~~: **Cloudflare [CONFIRMED]** | — | — | — |
| V-2 | ~~Email provider~~: **Cloudflare Email Routing → private inbox [CONFIRMED]** | — | — | — |
| V-3 | ~~Proxy status~~: website records are **DNS only [CONFIRMED]** | — | — | — |
| V-4 | ~~Email authentication~~: SPF and DKIM present, **DMARC missing [CONFIRMED]** | — | — | — |
| V-13 | ~~Zone export~~: **exported 2026-10-13 and stored privately by the owner [CONFIRMED]** | — | — | — |
| V-14 | ~~DMARC~~: **live 2026-10-13** (`p=none`, reports to Cloudflare DMARC Management) [CONFIRMED] | — | — | — |
| V-15 | **Follow-up ~mid-Nov 2026:** after 2–4 weeks of clean reports, move DMARC to `p=quarantine` and SPF `~all` to `-all`. Do this only after the form's sending service (ADR-0004) is in place and passing. | Spoofing protection | Owner + Claude | After M5 |
| V-5 | ~~Public brands~~: **none at launch [CONFIRMED]** | — | — | — |
| V-6 | ~~Repository visibility~~: **public [CONFIRMED]** | — | — | — |
| V-12 | Replies to inquiries currently come from the private inbox, which **exposes a personal address** to whoever writes in | Corporate anonymity | Owner | Not blocking; see §12 |
| V-7 | Founding year (2022) and "New York, NY" are OK to keep publishing | Company facts on About and in structured data | Owner | M4 |
| V-8 | Analytics: approve Cloudflare Web Analytics (cookieless) or none | Privacy policy content | Owner | M4 |
| V-9 | Terms of Use at launch: yes or no | Page scope | Owner | M4 |
| V-10 | Legal review of the Privacy and Terms **drafts** (written 2026-10-13; `noindex` and out of the sitemap until approved) | Compliance | Owner (counsel) | Launch |
| V-11 | ~~Dark theme~~: **no dark mode [CONFIRMED 2026-10-13]** | — | — | — |
| V-16 | ~~Logo source files~~: originals lost; **redrawn as SVG** and **approved** (brushed bronze, plus a textured version for large uses), 2026-10-13 [CONFIRMED] | Nav, footer, favicon, social images | Owner | M3 |

### 9.1 How to verify V-3 and V-4 (read-only; changes nothing)
In the Cloudflare dashboard, go to benjaire.com → **DNS → Records**, note the proxy status of the `benjaire.com` and `www` records, and use **Export** to save a zone file (keep it private; don't commit it). Or, from any terminal:
Run these from any terminal, or let me run them by allowing outbound DNS in this environment:
```bash
dig +short NS benjaire.com            # DNS provider
dig +short MX benjaire.com            # email provider
dig +short TXT benjaire.com           # SPF + site verification records
dig +short TXT _dmarc.benjaire.com    # DMARC policy
dig +short A benjaire.com             # GitHub Pages IPs are 185.199.108–111.153
dig +short CNAME www.benjaire.com
curl -sI https://benjaire.com | grep -i server   # "GitHub.com" means GitHub Pages
```
GitHub Pages records point to `185.199.108–111.153`. If they're proxied, `dig` returns Cloudflare IPs instead.

## 10. Milestones & Implementation Plan

Each milestone ends in an approval gate. Nothing past a gate starts without your sign-off.

| Milestone | Scope | Deliverables | Exit criteria / gate |
|---|---|---|---|
| **M0. Plan approval** | This PRD and the ADRs | Approved PRD v0.2 or later; ADR statuses updated | **Owner approves the plan** |
| **M1. Infrastructure audit** (facts gathered) | V-1 to V-6 confirmed; hosting decision awaits approval | An audit note in `docs/` covering the record inventory, a hosting recommendation confirmed or revised, and a migration/rollback runbook | **Owner approves the hosting decision.** No DNS, email, or hosting changes happen in M1. |
| **M2. Design system & visual proposal** | Design tokens, components, before/after mockups | `docs/design-system.md` plus screenshots | **Owner approves the visuals** |
| **M3. Foundation build** ✅ done 2026-10-13: Astro site in `site/` merged (#16); deployed to Cloudflare Workers (`benjaire-com`, workers.dev only) | Astro scaffold; migrate the current pages with matching visuals; shared layout; CI (build, lint, link check, axe, Lighthouse, existing security audit); preview deploys on the approved host (no production change) | Preview URL | Preview matches the approved design; Lighthouse ≥ 95; CI green |
| **M4. MVP features** ✅ done 2026-10-13 (#17); legal text awaits counsel (V-10) | Brands model and page (empty state), About, Contact with categories and the supplier section, Privacy, Terms, 404, SEO, structured data | Feature-complete preview | Every acceptance criterion in §5 passes on preview |
| **M5. Contact backend & security** ✅ done 2026-10-13 (#18, #19): end-to-end test delivered to the inbox with the category subject and a working Reply-To | Serverless handler, Turnstile, email API, recipient config, HTTP security headers | Working form on preview delivering to contact@benjaire.com | Spam, validation, and failure tests pass; securityheaders.com grade A (if on a host that supports headers) |
| **M6. Launch** (in progress 2026-10-13: pre-launch QA done, Lighthouse 100 on main pages; runbook in `docs/runbooks/launch-cutover.md`) | Pre-launch QA, redirects, approved cutover per the runbook, Search Console resubmission | Live site | **Owner approves cutover.** Email verified working before and after. Rollback tested. |
| **M7. Post-launch** | 2 weeks of monitoring for form delivery, Search Console errors, and performance | A short launch report | Stable; FUTURE backlog prioritized |

**Critical path:** M1 (infrastructure facts) and M2 (design approval). Engineering for M3–M5 is about 7–10 working days once both gates have passed **[PROPOSED estimate]**.

## 11. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| **Email disruption during the hosting cutover** | Lost inquiries | **Low** (DNS already on Cloudflare; MX untouched) | Full zone export, record-by-record comparison before switching nameservers, low TTLs, test mail before and after, keep the old provider live until verified (ADR-0003) |
| Public repository exposes sensitive data (private inbox address, unreleased brands, zone export, secrets) | Privacy or confidentiality breach | Medium | The destination inbox lives only in host environment variables; never commit zone exports or unreleased brands; keep the existing secret audit in CI |
| Unreleased brand names leaked through the repo or the build | Confidentiality breach | Medium | Never commit unapproved brands; review pull requests for content |
| Credibility with an empty Brands page | Weaker first impression | Medium | Strong company narrative, a deliberate empty state, fast replies to inquiries |
| Unsupported claims creep into copy (suppliers, capabilities) | Reputational/legal exposure | Medium | Copy checklist in pull request review; supplier language limited to "exploring" and "interested in" |
| Form spam | Inbox noise | High without controls | Turnstile, honeypot, rate limit, length caps |
| Form email marked as spam | Missed leads | Medium | SPF/DKIM/DMARC alignment for the sending domain (DNS change needs approval) |
| Strict CSP breaks UI | Regressions | Medium | Move inline scripts and styles out; test in report-only mode on preview |
| Search ranking dip after the URL change | Short traffic dip | Low–Med | Redirects, unchanged titles, sitemap resubmission |
| Premature complexity (auth, DB, microservices) | Cost and maintenance | Medium | §1 guiding principle; ADRs required for new infrastructure |
| Vendor lock-in | Future migration cost | Low | Static output is portable; the form function is small and replaceable |

## 12. Future Enhancements [FUTURE]
Brand profile pages · individual brand websites (separate apps) · e-commerce (on brand domains) · customer accounts · partner collaboration tools · supplier management · CMS editing UI (a Git-based CMS such as Decap or TinaCMS fits this architecture) · per-category inboxes (config change only) · newsroom/press kit · careers · newsletter · multi-language.
Each one needs a business requirement and an ADR before work starts.

**Anonymity follow-up (outside the website build) [PROPOSED]:** set up replying *as* `contact@benjaire.com` so inquirers never see the private address. Options: Gmail "Send mail as" through an SMTP relay, or a low-cost business mailbox. Decide before launch traffic grows.

## 13. Approval

| Gate | Decision | Date |
|---|---|---|
| M0 Plan (this PRD and the ADRs) | ☑ Approved | 2026-10-13 |
| M1 Hosting decision | ☐ Approved ☐ Changes requested | |
| M2 Visual design | ☑ Approved as current direction (warm cream/beige/cocoa palette, design system v0.2); owner may revisit | 2026-10-13 |
| M6 Production cutover | ☐ Approved ☐ Changes requested | |

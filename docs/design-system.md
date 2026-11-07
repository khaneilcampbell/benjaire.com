# Benjaire Design System (v0.4, "Silver Blue")

- **Status:** Palette chosen by the owner 2026-11-07; in review on this branch, not yet live. Benjaire is Digital Solutions only from 2026-11-07 (Consumer Brands retired), slogan "Smarter systems. Better business." Supersedes v0.3 "The Pavilion" and the v1 product layer, which are kept below for history.
- **Direction:** Benjaire reads as a digital solutions company. Benjaire and Benjaire Flow share every token and component; Flow is set apart only by its product UI. Visuals are code-built: live product UI, a canvas "signal field" (lines that converge and land in a Flow owner alert), outcome cards and a four-stop "how it works" path. No stock or generated photos, robots, glowing brains, circuit boards or invented metrics.
- **Palette picker:** https://claude.ai/artifact/LK26bYHW3rZ68QZgCBp9sY · **Direction preview:** https://claude.ai/artifact/1KbaRypQ5SWvR5c2mhdHJR

## Tokens (`site/src/styles/global.css`)
Older token names are kept so components did not need renaming: `--cocoa` is now night, `--silver-ink` is a muted steel blue.

| Role | Token | Value | Use | Contrast |
|---|---|---|---|---|
| Ground | `--bg` | `#f4f6f8` | Page background (cool white) | |
| Band | `--bg-raised` | `#e6ebf0` | Alternating sections | |
| Surface | `--surface` | `#dde3ea` | Image wells, chip fills | |
| Panel | `--paper` | `#ffffff` | Cards, panels, product UI | |
| Ink | `--fg`, `--accent` | `#0b0d10` | Headings, primary buttons | 18:1 on ground |
| Body | `--fg-mid` | `#3d4651` | Body text | 8.8:1 |
| Labels | `--fg-low` | `#566170` | Labels, meta | 5.8:1 on ground, 5.2:1 on band |
| Steel | `--fg-faint` | `#7f8b99` | Icons, arrows, decoration only | 3.2:1 |
| Silver | `--silver` | `#c3ccd6` | Hairlines, decoration only | |
| Display accent | `--silver-ink` | `#456b96` | Second line of display headings | 5.1:1 |
| Blue | `--signal` | `#2e5a8c` | Links, focus rings, the one live highlight per view | 6.6:1; white on it 7.1:1 |
| Blue deep | `--signal-hi` | `#244a75` | Hover, text on tint | 7.9:1 on tint |
| Blue tint | `--signal-tint` | `#eaf0f7` | Selected chips, info panels | |
| Night | `--cocoa` | `#0b0d10` | Home hero, closing bands, code-drawn panels | |
| Night raised | `--cocoa-2` | `#12161c` | Raised surfaces on night | |
| On night | `--on-cocoa` | `#e8edf3` | Text on night | 16.5:1 |
| On night low | `--on-cocoa-low` | `#9aa7b6` | Secondary text on night | 7.4:1 on night-2 |
| Ice | `--ice` | `#8fb3dc` | Signal lines, accents and focus on night | 8.9:1 on night |
| Metal | `--metal` | gradient `#e8edf3 → #9fb1c6 → #5b7ea6` | Display highlight on night; never behind text | |
| Status | `--won`, `--waiting`, `--danger` | `#1d6b48`, `#8a5a12`, `#a3271a` | Always with a word | |

**Shape and depth:** `--radius-sm 8px`, `--radius-md 14px`, `--radius-lg 20px`, `--radius-pill 999px`; `--shadow-1` to `--shadow-3`, cool-tinted. **Motion:** `--dur-fast 150ms`, `--dur-base 300ms`, `--dur-slow 700ms`, easing `--ease`. No raw hex in components; the only exceptions are SVG stops in code-drawn art and the share-card script.

## Type
Archivo (width 112%, light) for display, Inter for UI and body, IBM Plex Mono uppercase for labels and data. One heading scale for Benjaire and Flow. Body at least 16px, at most about 70ch. Prices, times and counts use `tabular-nums`. Section labels are `<p class="eyebrow">`; the second line of a display heading is a `<span>` in `--silver-ink` (or `--metal` on night).

## Components
Buttons (primary ink, ghost outline, text link; 44px targets), chips and badges, cards, one glass panel per view (on `.night` panels, cards are solid white instead of frosted), section head (eyebrow, title, lead), stats, nav and footer identical on every page, FAQ accordion, price cards.

- **Product architecture:** Flow pages add `FlowSubnav.astro`, a sticky sub-nav with the "Benjaire **Flow**" lockup (the B plus the word in Archivo, never a separate logo).
- **Code-built visuals:** `OwnerAlert.astro` (sample owner alert), `ModelVisual.astro` (Build, Operate, Grow), `FlowHero.astro` (layered form, alert and phone), `FlowStory.astro` + `StoryScreen.astro` (one inquiry in four beats), `FlowPath.astro` (four-stop path; architecture image and an HTML trigger table behind "Technical detail"), `FlowOutcomes.astro` (reply ring, pipeline, Monday digest), `PageBand.astro` signal variant.
- **Sample data:** every sample name, number and inquiry is labelled "Sample" on screen.

## Imagery
No photographic renders remain: the Pavilion images were retired with Consumer Brands (2026-11-07), and About uses the signal band. Flow keeps `05-whats-included.png`, `06-setup-process.png` and, inside Technical detail, `02-workflow-architecture.png`. Share cards: `node scripts/build-og.mjs` writes `public/og/benjaire-og.png` and `flow-og.png`.

## Motion
- Home hero: `src/scripts/signal.ts` draws 18 lines on a canvas that converge, turn ice blue and land in the owner alert, which glows on arrival and cycles three samples. DPR capped at 2; pauses off screen and in hidden tabs.
- Flow: pointer depth on the hero layers, a pinned story on desktop, a path that fills on scroll, outcome cards that settle once (`src/scripts/flow.ts`).
- Animate only `transform` and `opacity`. Every animation has a complete still frame; under `prefers-reduced-motion: reduce` nothing pins, loops or sweeps. Pages are complete without JS.
- Budget: no runtime dependencies, no WebGL or video.

---

# Benjaire Design System (v0.3, "The Pavilion", superseded 2026-11)

- **Status:** Approved by owner 2026-10-14 and live. Supersedes v0.2 (cream, cocoa, bronze), which is kept below for history.
- **Direction:** architectural futurism, after the Kontra reference. An original abstract structure, three white shells on one base over still water, is Benjaire's recurring visual signature: canopy = Build, ribbed arch = Operate, ribbon = Grow.
- **Concept board:** https://claude.ai/artifact/4iLwix1zs6P36SJmLpvbZ7 · **Identity board:** https://claude.ai/artifact/3aEDZP3hzkkSwj2bhqN4UE

## v0.3 summary
| Area | Rule |
|---|---|
| Palette | Pearl ground `#f3f3f1`, pearl gray bands `#e4e5e3`, white panels, charcoal ink `#1f2124`, body `#565b62`, labels `#5f646b`, silver `#8e939a` (decorative only), large display silver `#6f747b`, matte black bands `#121315`. Tokens in `site/src/styles/global.css` with contrast notes. |
| Type | Variable Archivo at width 112% and weight 330 for display (tight negative tracking); Inter for body; IBM Plex Mono uppercase for labels and annotations. |
| Logo | **Primary mark: the v3 graphite "B"** (the app icon, `docs/design/logo/v3/png/benjaire-app-icon-light.png`). Gradient graphite on light grounds, pearl gradient on dark bands; flat charcoal `#1f2124` / white only for one-color uses (embroidery, engraving, tiny sizes). Formats: SVG on the site (nav monogram, footer lockup, band marks in `site/public/brand/`); Tab favicon is the bare B on transparent (`icons/favicon.svg` switches graphite to pearl in dark browser chrome, with 48/96 PNG and `/favicon.ico` fallbacks); the 180px touch icon and the 192/512 manifest icons stay pearl tiles; 1200x630 PNG for Open Graph (`scripts/build-og.mjs`). In lockups the B carries its own gradient so it matches the app icon. Transparent SVG + 512/1024/2048 PNG kit with usage rules: `docs/design/logo/kit/`. The flat v4 marks from `site/scripts/build-logos.mjs` are archive. |
| Imagery | Pre-rendered stills of the Pavilion (Gamma render), served as AVIF/WebP via Astro. The render is never rotated as if it were 3D; depth comes from moving interface layers. |
| Components | Pill buttons (charcoal), frosted glass panels (one per view), annotation pins, index lists with one active item, title-block footer, matte black partnership band. |
| Motion | Hero settle and staggered reveal, pointer parallax on interface layers, sticky Build/Operate/Grow crossfade, scroll-tinted statement. All disabled under reduced motion; content is complete without JS. |
| Homepage | `site/src/pages/index.astro` + `site/src/styles/home.css` + `site/src/scripts/home.ts`. |

## v1 product layer ("B on A", preview, 2026-10-18)
- **Status:** direction approved by the owner 2026-10-18; ships to production when PR #43 merges.
- **Rule:** brand pages (home hero, About, Brands) keep the Pavilion. Product pages lead with real interface states.
- **Tokens added to `global.css`:** `--canvas #f7f6f3`, `--signal #2f55c8` (one interactive highlight per view, product pages only; proposed), `--signal-hi #2443a3`, `--signal-tint #eef1fb`, `--won #1d6b48`, `--won-tint #e8f2ec`, `--waiting #8a5a12`. Status colors always travel with a word.
- **Type:** product headings use Archivo at width 100, weight 500.
- **Components:** `FlowDemo.astro` (interactive owner alert with sample data; outcomes listed as text without JS). Pages may pass their own `ogImage` to `Base.astro`; Flow uses `/og/flow-og.png`.

---

# Benjaire Design System (v0.2, retired 2026-10-14)

- **Status:** Approved by owner 2026-10-13 as the current direction (M2). Open to later refinement.
- **Approach:** refine and modernize the existing identity. Don't replace it.
- **Visual proposal:** [`docs/design/proposal/`](design/proposal/), with before/after screenshots at 1440px and 390px widths.

## 1. Principles
1. **Quiet confidence.** Neutral colors, generous space, and hairline structure instead of decoration.
2. **Company first.** The design speaks for Benjaire as an institution. No people, no hype.
3. **Honest content.** Nothing implies brands, partners, or capabilities that don't exist.
4. **Accessible by default.** WCAG 2.2 AA is the floor, not a target.

## 2. What's kept (recognizable identity)
| Element | Kept as is |
|---|---|
| Palette family | Warm neutrals with a single brown accent (now shifted warmer; see §4) |
| Type | Archivo (display, 500/700/800) and Inter (body, 400/500/600) |
| Logo | **Official logo (owner-supplied, 2026-10-13):** a copper geometric "B" monogram plus a wide-spaced geometric "BENJAIRE" wordmark. It replaces the typed Archivo wordmark in the nav and footer once vector files arrive. |
| Structure | Full-width hairline rules, flat surfaces, no shadows, no rounded corners |
| Labels | Wide-tracked uppercase eyebrows with a short accent rule |
| Motion | Gentle fade-and-rise reveal, disabled under `prefers-reduced-motion` |

## 3. What's refined (proposed changes)
| Change | Why |
|---|---|
| Fluid **type scale** (tokens below) | Consistent hierarchy from phone to desktop instead of one-off sizes |
| **Spacing scale** and a 1240px max content width | Better rhythm; lines stay readable on wide screens |
| Nav background uses the sand ground (was white) | One continuous surface; feels more premium |
| A **"Partner with us"** outlined button in the nav | Gives business visitors one clear primary action |
| Home gains "What we do", "Focus areas", the Brands section, and a "Work with Benjaire" band | Today the home page is only a hero and an empty heading |
| Beige bands (`--bg-raised`) alternate sections, and a **deep cocoa band** closes key pages | Hierarchy and a premium finish |
| **Warmer palette** (§4): cream, beige, latte, cocoa text, saddle-brown accent, caramel rules | Owner direction 2026-10-13 |
| A faint hairline grid behind the hero | A technology-forward hint that stays within the palette |
| Footer gains Legal links and a tagline | Trust and compliance |
| Form redesign: category chips, inline errors, consent, spam-protection slot | Meets PRD US-3 |
| No background texture: paper grain was reviewed and declined by the owner (2026-10-13); surfaces stay flat |
| `text-wrap: balance` on headings | Avoids awkward single-word last lines |
| **Remove `hero-bg.png` (6.3 MB) and `hero-bg.webp`** | Neither file is referenced anywhere |

## 4. Tokens

### Color (v0.2: cream, beige and cocoa palette, per owner direction 2026-10-13)
The palette shifts warmer and browner than the original near-black/umber. It's inspired by contemporary wellness and DTC brands, but every value is Benjaire's own.

| Token | Value | Use | Contrast on `--bg` |
|---|---|---|---|
| `--bg` | `#fdfaf5` | Cream page ground | — |
| `--bg-raised` | `#f4ebe0` | Beige bands, footer | — |
| `--surface` | `#e9dccb` | Latte tiles, logo wells | — |
| `--fg` | `#2a1d14` | Cocoa headings (replaces black) | 15.7:1 |
| `--fg-mid` | `#5a4637` | Body text | 8.5:1 |
| `--fg-low` | `#705b49` | Labels (≥ 4.7:1 on every surface) | 5.9:1 |
| `--fg-faint` | `#a08b77` | Decorative only, **never** text | 3.1:1 |
| `--accent` | `#6b4226` | Saddle brown: buttons, links, numbers | 8.3:1 (white on it: 8.6:1) |
| `--accent-hi` | `#8a5a36` | Hover | 5.6:1 |
| `--caramel` | `#b58357` | Decorative rules only, **never** text | 3.2:1 |
| `--cocoa` | `#2a1d14` | Dark closing band | Cream text on it: 15.7:1 |
| `--danger` | `#8f2716` | Form errors | 8.2:1 |

### Type scale (new)
| Token | Size | Use |
|---|---|---|
| `--t-h1` | `clamp(38px, 5vw + 14px, 76px)` | Page titles |
| `--t-h2` | `clamp(28px, 2.6vw + 16px, 44px)` | Section titles |
| `--t-h3` | `clamp(20px, 1vw + 16px, 26px)` | Card and pillar titles |
| `--t-lg` | `clamp(17px, .5vw + 15px, 20px)` | Lead paragraphs |
| `--t-base` | `clamp(15px, .3vw + 14px, 17px)` | Body |
| `--t-sm` | `13px` | Meta text |
| `--t-xs` | `11px` | Buttons, nav (uppercase, tracked) |

### Spacing (new)
`--s-1` 8 · `--s-2` 16 · `--s-3` 24 · `--s-4` 32 · `--s-5` 48 · `--s-6` 64 · `--s-7` 96 (px). Section padding: `clamp(72px, 10vw, 136px)`. Gutter: `clamp(20px, 5vw, 64px)`. Max width: `1240px`.

### Motion
Easing `cubic-bezier(.16, 1, .3, 1)`. Reveal: opacity plus a 20px rise over 0.9s. Hover transitions: 0.25s. Everything is disabled under reduced motion.

## 5. Components
| Component | Notes |
|---|---|
| **Nav** | Sticky, 72px, wordmark on the left, links plus a "Partner with us" outlined button. A hamburger appears below 900px (Escape closes it, focus returns to the toggle). |
| **Eyebrow** | 10px uppercase, 0.28em tracking, accent color, with a 32px rule before it |
| **Button / primary** | Umber fill, white text, at least 48px tall. Hover: lighter umber. |
| **Button / ghost** | Transparent with a hairline border. Hover: umber border and text. |
| **Pillar** | Number, title, and text, in three columns separated by hairlines |
| **Focus row** | Number, title, and description, with a hairline between rows |
| **Brand card** | Logo well, category and status, name, description, then "Visit site ↗" (live) or "Launching soon" |
| **Empty state** | Bordered panel with a status badge, heading, honest copy, and one call to action |
| **Fact list** | Label and value rows separated by hairlines (About, Contact) |
| **Form field** | Uppercase label, underline input, accent focus line, red error line plus a message tied to the field (`aria-describedby`) |
| **Category chips** | A radio group styled as chips; the selected one is filled umber |
| **Footer** | Four columns: Brand, Company, Contact, Legal |

## 6. Voice & copy rules
- Company voice ("Benjaire", "we"). Never an individual.
- Supplier copy uses only "exploring" and "interested in". No MOQs, no partner names, no capability claims.
- No invented brands. Sample cards exist only in proposal screenshots, clearly labelled.
- **All mockup copy is a draft for owner review.**

## 7. Proposal screenshots
| Page | Before | After |
|---|---|---|
| Home | `before-home-*` | `after-home-*` |
| About | `before-about-*` | `after-about-*` |
| Brands (launch, empty) | — (no page today) | `after-brands-*` |
| Brands (layout sample, never published) | — | `after-brands-sample-*` |
| Contact | `before-contact-*` | `after-contact-*` |

## 8. Logo usage
**Source:** the original vector files are lost, so the logo was **redrawn as SVG** from the owner's photo mockup (2026-10-13) and checked against an outline traced from the photo. **Approved 2026-10-13.**

**Approved color treatment (owner, 2026-10-13):** **C, brushed bronze** everywhere, and **D, bronze plus grain texture**, only where the logo appears large. The bronze gradient uses only site palette colors: `#5a3a22 → #8a5a36 → #b58357 → #8a5a36 → #5a3a22` (diagonal). The cream (`#fdfaf5`) versions go on the cocoa band.

| File (`docs/design/logo/`) | Use |
|---|---|
| `benjaire-lockup-horizontal.svg` (C) | Nav (about 28px tall) and footer |
| `benjaire-lockup-vertical.svg` (C) | Medium uses, social share images |
| `benjaire-lockup-vertical-textured.svg` / `benjaire-monogram-textured.svg` (D) | Large uses only: the home hero monogram (≥ 72px) and large About or print uses |
| `benjaire-monogram.svg` (C), `benjaire-wordmark.svg` (C) | Standalone marks |
| `*-cream.svg` | On the cocoa band |
| `favicon.svg` | Bronze monogram on a cream rounded square |

The earlier flat-copper `--copper` token was retired in favor of the bronze gradient.
- Nav: monogram plus wordmark, about 28px tall. Footer: the full lockup. Favicon: the monogram alone, on cream and in copper.
- Logo color: copper on cream or white. Cream version on the cocoa band.
- Minimum clear space: the height of the monogram's top notch on all sides.
- No dark mode, so no dark-theme logo variant is needed beyond the cocoa band.

### Logo v2 (2026-10-13, owner-approved)
- Generated by `site/scripts/build-logos.mjs` (run `node scripts/build-logos.mjs public/brand` in `site/`). Never hand-edit the SVGs.
- **No SVG filters or masks** in web assets: Safari/iOS rasterises them at low resolution inside `<img>`. The bronze gradient is applied directly to the baked geometry.
- Wordmark stroke 18 (was 15) and wordmark at 42% of monogram height in the horizontal lockup (was 36%). Nav and footer logo 32px tall.
- Softer bronze sweep: `#5e3d24 → #7f5232 → #a5764b → #7f5232 → #5e3d24`.
- The textured (grain) variant is retired from the web; the hero uses the plain bronze monogram.

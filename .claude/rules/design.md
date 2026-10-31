---
paths:
  - "site/src/styles/**/*"
  - "site/src/components/**/*"
  - "site/src/assets/**/*"
  - "site/public/brand/**/*"
  - "site/scripts/build-logos.mjs"
  - "site/scripts/build-og.mjs"
---

# Design rules

- Read `docs/design-system.md` before changing anything visual. v0.3 "The Pavilion" and the v1 product layer are current; the v0.2 section is history only.
- Use the tokens in `site/src/styles/global.css`; never hard code a color that already has a token. Silver is decorative only.
- Brand pages (home hero, About, Brands) keep the Pavilion. Product pages lead with real interface states and may use `--signal` once per view.
- The logo is flat and single color (charcoal on light, pearl on dark). Regenerate logo files with `build-logos.mjs`; never edit exported SVGs by hand.
- Motion must be disabled under `prefers-reduced-motion`, and every page must be complete without JavaScript.
- WCAG 2.2 AA is the floor. Status colors always travel with a word.
- Show the owner a preview before a visual change merges.

# Studio Viana Phase 3 — Collection design

Date: 2026-09-25  
Status: approved by the supplied Phase 3 brief  
Concept: `docs/superpowers/concepts/phase-3/collection-desktop.png`

## Intent

Phase 3 replaces only the Collection shell. It preserves the cinematic intro and Phase 2 story, then turns the catalogue into a slow luxury gallery walk: an editorial contents page, a pinned horizontal exhibition for eight products, a shareable full-screen product configurator, and a dark Grand Bouquet finale.

## Experience contract

- The canonical data source contains eight orderable products and one Corporate & Bulk CTA record. Every product exposes stable pricing, descriptive details, occasions, theme, accent, hero/gallery media and typed variants.
- Desktop/tablet at 768px and above receive one GSAP-owned horizontal track. Vertical distance equals the horizontal overflow; a single ScrollTrigger pins the viewport, scrubs the track, updates progress, and supplies `containerAnimation` to panel entrance/parallax triggers.
- Mobile, coarse-pointer reduced-density contexts, and all reduced-motion users receive the same content as a semantic vertical stack. Reduced motion never pins or continuously animates.
- The Collection index defaults to scrolling to the selected panel by mapping panel position into the gallery trigger's vertical scroll range. A configurable direct-detail mode remains available.
- Variant selection swaps the main product image and order context. Keyboard arrows change focused gallery panels; all selectors are true buttons/inputs with visible focus.
- Detail state is URL-owned by `?product=<slug>`. Opening pushes history; Back closes; direct shared URLs open after hydration; Escape, backdrop and Close also close and return focus.
- The detail dialog stops Lenis, traps focus, scrolls internally, exposes native form controls, validates the 120-character message, and builds the exact WhatsApp order summary from the selected configuration.
- The featured Grand Bouquet section uses the same product record and detail route, is dark-themed for the navbar, and removes particles/zoom/parallax for touch and reduced-motion users.
- Cursor-state preparation is dependency-free: a small external store plus `data-cursor` attributes publishes `default`, `view`, `drag`, and `zoom` without rendering a custom cursor.

## Visual system

- Warm cream paper remains the dominant canvas, with charcoal copy, antique-gold hairlines and subtle product-derived accent washes.
- Collection intro uses a two-column 12-column grid, a large Lora heading, measured Poppins copy, and a full-width indexed contents list.
- Product panels are approximately 75vw desktop / 85vw tablet with a 6vw gap. Image and text stay close to a 60/40 split, with an offset gold frame and outlined category number.
- The product detail view is a 55/45 split with sticky media on desktop and a snap carousel on mobile.
- Grand Bouquet is full-bleed forest, framed at 32px desktop / 16px mobile, with restrained pearl points and bottom-centred copy.

## Asset contract

Phase 3 expects the following local files under `public/images/products/`; tasteful generated Phase 2 photography may be duplicated as development placeholders until final retouching arrives.

| File                              | Intended size     |
| --------------------------------- | ----------------- |
| `flower-cards-hero.jpg`           | 1600×2000         |
| `flower-cards-lily-bookmarks.jpg` | 1200×1500         |
| `single-stem-hero.jpg`            | 1600×2000         |
| `small-bouquets-hero.jpg`         | 1600×2000         |
| `small-bouquets-noir-orchid.jpg`  | 1200×1500         |
| `medium-bouquets-hero.jpg`        | 1600×2000         |
| `medium-tulip-lily.jpg`           | 1200×1500         |
| `medium-noir-wrap.jpg`            | 1200×1500         |
| `medium-violet-edit.jpg`          | 1200×1500         |
| `mini-bouquets-hero.jpg`          | 1600×2000         |
| `mini-rose-duet.jpg`              | 1200×1500         |
| `large-hero.jpg`                  | 1600×2000         |
| `large-blush-lily.jpg`            | 1200×1500         |
| `large-anniversary.jpg`           | 1200×1500         |
| `large-birthday-edit.jpg`         | 1200×1500         |
| `grand-bouquet-hero.jpg`          | 2560×1440 minimum |
| `grand-bouquet-mobile.jpg`        | 1440×2560         |
| `hamper-hero.jpg`                 | 1600×2000         |
| `hamper-lilac-edition.jpg`        | 1200×1500         |

## Performance and failure behavior

- Static imports provide dimensions and blur placeholders. First panel is eager; the next two use eager browser loading after Collection approaches; remaining media stays lazy.
- Detail code is loaded with `next/dynamic` and its chunk is warmed on detail-control hover/focus.
- Resize destroys and rebuilds the horizontal context through `gsap.matchMedia`; image completion and detail close refresh ScrollTrigger.
- Scrub paths mutate transforms, opacity, clip-path, saturation and CSS variables only. React state changes only when the active panel actually changes.
- Missing/invalid product query parameters close safely without replacing unrelated query params. Missing optional variant media falls back to the product hero.
- Without JavaScript, all product names, prices and contact actions remain readable in the vertical document flow.

## Accessibility

- One `h2` owns the Collection section. Each panel/card uses an `h3`; the detail dialog owns a separate `h2`.
- Index rows and product images are keyboard operable. Gallery keyboard navigation never traps focus.
- The dialog has `role="dialog"`, `aria-modal`, a stable accessible name, an in-dialog close control, a focus trap and trigger restoration.
- Live regions announce the gallery counter and computed total without chattering during scrub.
- Meaningful product images name the product, treatment and chenille material; decorative thumbnails reuse useful alt text or empty alt only when adjacent text fully names them.

## Tweakable values

- Desktop panel width `75vw`; tablet `85vw`; gap `6vw`; pin scrub `1`.
- Image parallax `-12 → 12 xPercent`; panel scale `0.9 → 1 → 0.9`.
- Detail lens zoom `2.2`; lens diameter `176px`.
- Pearl count `18`; particle duration `14–24s`.
- Small Bouquet price mapping: one bloom `150`, two blooms `250`.

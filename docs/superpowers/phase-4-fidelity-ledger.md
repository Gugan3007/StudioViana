# Phase 4 fidelity ledger

Date: 2026-09-25  
Branch: `feature/phase-4`

## Accepted references

- `docs/superpowers/concepts/phase-4/up-close-desktop.png`
- `docs/superpowers/concepts/phase-4/process-desktop.png`
- `docs/superpowers/concepts/phase-4/gallery-desktop.png`
- `docs/superpowers/concepts/phase-4/testimonials-desktop.png`
- `docs/superpowers/concepts/phase-4/instagram-marquee-desktop.png`

## Production evidence

- `/tmp/studio-viana-phase-4-up-close.png`
- `/tmp/studio-viana-phase-4-process.png`
- `/tmp/studio-viana-phase-4-gallery.png`
- `/tmp/studio-viana-phase-4-testimonials.png`
- `/tmp/studio-viana-phase-4-instagram.png`
- `/tmp/studio-viana-phase-4-mobile.png`

All captures were made in Chromium at their native viewport sizes. The five
desktop captures use 1280px or 1440px wide viewports; the touch lightbox capture
uses a native 320×780 viewport. The implementation images were inspected with
`view_image` beside their matching accepted concept rather than judged from DOM
structure alone.

## Side-by-side comparison

1. **Colour and material language:** the implementation retains the concepts'
   forest, warm cream, blush, lilac and antique-gold system. Hairline frames,
   low-opacity grain and restrained rules keep the result tactile without adding
   the heavy shadows or glass effects absent from the references.
2. **Editorial hierarchy:** the large Lora statements, widely tracked Poppins
   labels and quiet supporting copy preserve the concept hierarchy. “Every
   fibre, shaped by hand.”, “From Stem to Story”, “Crafted by Hand”, the Kind
   Words heading and `@studio_viana.in` all remain the dominant visual anchors.
3. **Up Close composition:** the accepted left-copy / framed-flower / callout
   relationship is preserved as a scroll narrative. Production intentionally
   uses one central frame with a true source-to-macro crossfade instead of the
   concept's permanently visible second crop; this makes the camera-dive idea
   legible and matches the approved Phase 4 interaction brief.
4. **Process rhythm:** the implementation keeps the cream field, alternating
   text and 4:5 imagery, outlined gold numbers, line icons and one continuous
   stem. It is more spacious than the static concept so each node can activate
   independently during scroll and remain readable from 320px through 1920px.
5. **Gallery density:** four editorial columns, mixed ratios, slim gutters and
   warm imagery match the gallery concept. Production mounts twelve pieces
   first and reports the complete matching inventory, then expands to eighteen;
   the concept depicts the already-expanded state.
6. **Testimonial proof:** the oversized faint quote mark, centred italic review,
   small product portrait, minimal arrows/progress and four-part trust band all
   map directly to the reference. Production uses the specified placeholder
   review copy and editable data rather than the illustrative concept quote.
7. **Social finale:** the linked handle, square moving strip, hover Instagram
   treatment and centred outline action retain the concept structure. The
   closing forest band is a separate velocity-reactive chapter below it so its
   two opposing rows have enough room to read at speed.
8. **Mobile lightbox:** the native 320×780 capture keeps the contained image,
   title, `02 / 12` counter and primary product action visible together. The
   arrows sit on the image plane, clear of metadata, and preserve 48px targets.

## Copy comparison

The user-supplied Phase 4 copy is the production authority. ImageGen concepts
were treated as layout and art-direction references, so their illustrative copy
(including alternate process descriptions and testimonial names) was not
transcribed. All headings, descriptions, labels, WhatsApp text and calls to
action match the Phase 4 brief and the typed data files.

## Intentional deviations and dependencies

- Development photography is deliberately reused and recropped behind the exact
  final filenames. Unique final craft, process, gallery and Instagram art remains
  a content dependency; the replacement boundary is documented in
  `docs/phase-4-craft-gallery.md`.
- The process concept compresses all five steps into one poster-like viewport.
  Production gives the sequence scroll depth for the measured live SVG path,
  node activation and image parallax.
- The gallery count describes the full matching inventory while only twelve
  pieces are initially mounted. This preserves the brief's exact “Showing 18
  pieces” proof line and its separate load-more behaviour.
- Lighthouse is intentionally deferred until final photography is supplied;
  placeholder duplication would make that score poor evidence for the final art
  payload. The stricter runtime gate currently has no console, page, hydration or
  same-origin HTTP errors and no measured Phase 4 main-thread task at or above
  50ms.

## Verification and signoff

- `npm run check`: passed (format, ESLint, TypeScript, 30 test files / 123 tests,
  optimized Next.js build).
- `PLAYWRIGHT_PRODUCTION=true npx playwright test`: passed, 40/40 Chromium
  scenarios, including reduced motion, no JavaScript, 320px touch and the Phase 4
  performance trace.
- Targeted 320px lightbox regression: passed after proving and removing metadata
  overlap and keeping the primary action inside the viewport.

Agency-grade fidelity signoff: the implementation is approved against all five
accepted concept paths. Its remaining visual dependency is final photography,
not layout, motion, interaction or responsive behaviour.

## Decision ledger

Ruling: the gallery count reports the complete matching inventory (18 for All)
while only 12 are mounted before “View more pieces,” preserving the brief's exact
“Showing 18 pieces” proof line — cost if wrong: a visitor may read “showing” as
the number currently mounted rather than available.

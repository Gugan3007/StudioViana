# Phase 3 fidelity ledger

Date: 2026-09-25  
Branch: `feature/phase-3`

## Evidence

Approved concept:

- `docs/superpowers/concepts/phase-3/collection-desktop.png`

Final production renders:

- `/tmp/studio-viana-phase-3-index.png`
- `/tmp/studio-viana-phase-3-desktop-gallery.png`
- `/tmp/studio-viana-phase-3-mobile.png`
- `/tmp/studio-viana-phase-3-product-detail.png`
- `/tmp/studio-viana-phase-3-grand-showcase.png`

The concept and all five production renders were inspected together at original detail after the complete production suite passed.

## Collection intro and index

1. The live intro keeps the concept's cream paper, gold overline, oversized Lora heading, measured Poppins paragraph and `08 Pieces · From ₹120` utility line.
2. Character animation still owns individual glyphs, but glyphs are grouped into unbreakable words; this corrected the observed mid-word wraps in “Collection” and “Grand.”
3. The live index uses eight full-width ruled rows rather than the concept's compressed thumbnail strip. This follows the approved Phase 3 specification and creates a slower editorial contents moment before the gallery.
4. Desktop rows retain product number, exact name, price and arrow. Mobile adds a static thumbnail; fine pointers receive one floating preview without adding a second content owner.
5. Gold hairlines, generous vertical rhythm and the restrained type hierarchy remain materially aligned with the reference even though the index composition is deliberately expanded.

## Horizontal gallery

1. The 1440px render shows Medium Bouquets as a 75vw exhibition panel, with both neighbouring panels visible at the edges as the concept implies.
2. The product image remains dominant at roughly 58% of the panel, has an offset gold frame, and uses the same warm, low-contrast photographic treatment as the concept.
3. The outlined `04`, category label, two-line display name, pill, italic gold tagline, body copy, occasions, variants, price and actions form a faithful editorial reading order.
4. The fixed `04 / 08` counter and gold progress rule echo the concept's bottom navigation while avoiding redundant arrow controls; keyboard arrows operate the same panel mapping.
5. Removing anticipatory pinning and prioritising the upstream intro refresh fixed a real overlap found in production: index rows now remain clickable and the gallery begins only at its measured boundary.

## Product detail

1. The mobile evidence resolves to one opaque cream sheet after the shared-image transition; the underlying card is not visible in the settled state.
2. The primary image remains dominant, Close is visually isolated in a circular control, and thumbnail media precedes breadcrumb/category/product copy.
3. The detail maintains the gallery's Lora/Poppins/gold hierarchy while creating enough room for native size, quantity, palette, occasion and message controls below the captured fold.
4. Desktop retains the specified sticky 55/45 split and a 176px fine-pointer lens; mobile and reduced motion use tap/static behavior without a moving lens.
5. A 20px desktop edge exposes a true backdrop target. Escape, edge click, Close, browser Back and direct URLs were all verified with focus and query synchronization.

## Mobile collection

1. The 390px card makes the image full-width, adds a sticky product number/name context bar and keeps one-column reading order without horizontal overflow.
2. Flower Cards preserves the concept's warm crop, gold category label, large display name, outlined handmade pill, italic tagline and concise body measure.
3. Variant thumbnails remain touch-sized and horizontally scrollable; price and detail actions follow content instead of overlaying the photograph.
4. All eight products plus the Corporate panel remain in the DOM and in semantic order. No desktop pin, cursor preview, lens or pearl loop is required for reduced motion.
5. The same `Product` records render desktop, mobile, detail and finale views, preventing copy or price drift between layouts.

## Grand Bouquet showcase

1. The final mobile render uses the portrait source edge-to-edge, a forest veil and a 16px antique-gold frame, closely matching the concept's dark signature transition.
2. “The Grand Bouquet” wraps only between words and remains centred over the floral focal point; the signature label, exact description and ₹1,250 price form one coherent block.
3. Detail and WhatsApp actions remain visible without obscuring the bouquet. The lower gradient preserves cream-text contrast over the stems and wrap.
4. Desktop uses the matching landscape source and 32px frame. The image scale and veil scrub are transform/opacity-only and do not become content state.
5. Eighteen fine-pointer pearls add restrained motion and pause off-screen; their DOM is absent for touch and reduced motion.

## Runtime and responsive evidence

- 110/110 unit tests passed with clean formatting, ESLint, TypeScript and optimized Next.js build.
- 34/34 production Chromium tests passed serially across all Phase 1–3 files.
- Responsive coverage includes 360, 390, 768, 1024, 1440 and 1920px, active-gallery resize and direct product URLs.
- Asset traversal produced no failed same-origin response; removing below-fold priority eliminated unused-preload warnings on mobile.
- Production Chrome traces for the intro, Home/About/Craft and Collection contained no main-thread task at or above 50ms.

## Remaining production-art dependency

The 19 Phase 3 filenames are present, but several intentionally duplicate generated Phase 2 photographs and do not yet match their final target crops. This is not a runtime placeholder or missing route; it is the remaining photography/retouching dependency. The exact current and target dimensions are recorded in `docs/phase-3-collection.md`.

## Final review disposition

- Final: fixed related-product switching now preserves one dialog, one scroll-lock owner and the original opener until the experience closes — product-detail lifecycle tests and production focus restoration RED→GREEN; complete suites 110/110 unit and 34/34 browser.
- Final: fixed clipped tablet controls by reserving the pinned exhibition layout for viewports at least 1200px wide and 800px tall, with the complete vertical catalogue elsewhere — 1024×768 action-reachability test RED→GREEN; complete suites 110/110 unit and 34/34 browser.
- Final: fixed first-visit and reduced-motion scroll leakage with a shared reference-counted native/Lenis lock used by the preloader, detail and mobile menu — direct-load and wheel-chain tests RED→GREEN; complete suites 110/110 unit and 34/34 browser.
- Final: fixed desktop no-JavaScript access by making the vertical catalogue the default and enhancing to horizontal only after client initialization — no-JavaScript reachability test RED→GREEN; complete suites 110/110 unit and 34/34 browser.
- Final: fixed normal-motion mobile sticky context with observer plus reading-line scroll sampling — mobile Medium Bouquets context test RED→GREEN; complete suites 110/110 unit and 34/34 browser.
- Final: fixed the lens so its background dimensions and crop offsets derive from the rendered object-cover image at 2.2× zoom — rendered-dimension magnification test RED→GREEN; complete suites 110/110 unit and 34/34 browser.
- Final: fixed touch showcase zoom by limiting the Grand Bouquet scrub timeline to fine pointers — coarse-pointer animation test RED→GREEN; complete suites 110/110 unit and 34/34 browser.
- Final: fixed keyboard visibility for size and palette radios with focus-visible rings on their represented controls — radio focus-style test RED→GREEN; complete suites 110/110 unit and 34/34 browser.
- Final: minor (deferred): staged first/next image loading is not yet implemented in the horizontal product panels; all panel media remains lazy because changing the loading policy is a performance-tuning follow-up, not a correctness blocker.
- Final: minor (deferred): the desktop hint still says “Drag or scroll →” although direct pointer dragging is not implemented; wheel, trackpad, index and keyboard navigation remain available.
- Final: Ruling: final photography uniqueness and target crop fidelity remain an art-production dependency, consistent with the approved 19-file placeholder inventory — cost if wrong: the catalogue remains visually repetitive and its crops are not final until the supplied photography is replaced.

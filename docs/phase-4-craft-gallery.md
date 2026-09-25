# Phase 4 — Craft & Gallery operations guide

Phase 4 follows the Grand Bouquet showcase with five chapters: the tactile Up Close reveal, a five-step making process, the filterable Crafted by Hand gallery and lightbox, Kind Words, and the Follow the Bloom social finale. Pricing and Contact remain Phase 5 shells.

## Run and verify

```bash
npm run dev
npm run check
PLAYWRIGHT_PRODUCTION=true npx playwright test
```

Production browser files run serially because the animation and Chrome trace budgets must not compete for the same CPU.

## Runtime ownership

- `lib/data/process.ts`, `gallery.ts`, `testimonials.ts`, and `instagram.ts` are the editable Phase 4 content authorities.
- `UpClose.tsx` owns the desktop pin and macro crossfade. Mobile receives an unpinned reading order; reduced motion receives the complete macro and annotation list statically.
- `StemPath.tsx` measures the five process nodes relative to their timeline, joins them with cubic curves, and recalculates after a 120 ms debounced resize.
- `GallerySection.tsx` owns filtering, the 12→18 item limit, Flip state and the one selected lightbox record. `Lightbox.tsx` owns focus, swipe, zoom, adjacent preloading and scroll lock.
- `Testimonials.tsx` owns the visible/intersecting/hover state for one six-second timer. Its screen-reader copy changes immediately even while the decorative word transition completes.
- `InstagramStrip.tsx` and `Marquee.tsx` retain one loop each, pause off-screen/hovered and map scroll velocity into a clamped time scale. Reduced motion leaves static, horizontally reachable content.

## Tweakable values

| Experience                     |                       Value | Location                                             |
| ------------------------------ | --------------------------: | ---------------------------------------------------- |
| Up Close pin distance          |                     `200vh` | `craftMotion.pinDistanceVh`                          |
| Up Close scrub                 |                         `1` | `craftMotion.scrub`                                  |
| Desktop macro zoom / release   |               `1.65 / 1.48` | `craftMotion.desktopMediaZoom`, `desktopReleaseZoom` |
| Mobile image zoom              |                       `1.4` | `craftMotion.mobileMediaZoom`                        |
| Callout stagger                |                     `0.09s` | `craftMotion.calloutStagger`                         |
| Process resize debounce        |                     `120ms` | `craftMotion.resizeDebounceMs`                       |
| Process image parallax         |                      `0.35` | `craftMotion.processParallax`                        |
| Gallery column travel          |                       `±8%` | `MasonryGrid.tsx`                                    |
| Gallery initial / next batch   |                    `12 / 6` | `GallerySection.tsx`                                 |
| Gallery reveal                 |                      `0.9s` | `MasonryGrid.tsx`                                    |
| Lightbox swipe threshold       |                      `48px` | `Lightbox.tsx`                                       |
| Testimonial autoplay           |                    `6000ms` | `Testimonials.tsx`                                   |
| Testimonial swipe threshold    |                      `48px` | `Testimonials.tsx`                                   |
| Instagram loop                 | `34s desktop / 48s compact` | `InstagramStrip.tsx`                                 |
| Instagram velocity ceiling     |                        `3×` | `InstagramStrip.tsx`                                 |
| Closing marquee rows           |                 `26s / 34s` | `VelocityMarquee.tsx`                                |
| Closing velocity factor / skew |                   `1 / ±8°` | `Marquee.tsx`                                        |

## Exact image inventory

The current files are tasteful development placeholders duplicated and cropped from existing Studio Viana photography. Replace them in place and preserve every filename and import.

- Craft: `public/images/craft/closeup-flower.jpg` (1600×2000) and `closeup-macro.jpg` (at least 3000px on the long side).
- Process: `public/images/process/step-01.jpg`, `step-02.jpg`, `step-03.jpg`, `step-04.jpg`, `step-05.jpg` (1200×1500 each).
- Gallery: `public/images/gallery/gallery-01.jpg`, `gallery-02.jpg`, `gallery-03.jpg`, `gallery-04.jpg`, `gallery-05.jpg`, `gallery-06.jpg`, `gallery-07.jpg`, `gallery-08.jpg`, `gallery-09.jpg`, `gallery-10.jpg`, `gallery-11.jpg`, `gallery-12.jpg`, `gallery-13.jpg`, `gallery-14.jpg`, `gallery-15.jpg`, `gallery-16.jpg`, `gallery-17.jpg`, `gallery-18.jpg` (at least 1200px on the long side in final art).
- Instagram: `public/images/instagram/ig-01.jpg`, `ig-02.jpg`, `ig-03.jpg`, `ig-04.jpg`, `ig-05.jpg`, `ig-06.jpg`, `ig-07.jpg`, `ig-08.jpg`, `ig-09.jpg`, `ig-10.jpg` (1080×1080 each).

All new images use static imports, intrinsic dimensions, meaningful alt text, responsive `sizes`, lazy defaults and blur placeholders. Final exports should be sRGB JPEGs with no embedded text, watermark or border.

## Five process-photo generation prompts

Use the same seed, lens character and soft afternoon window direction across all five images so they read as one studio visit.

### 01 — Share your moment

```text
Editorial overhead photograph inside a small luxury Indian craft studio: a warm cream notebook with handwritten occasion notes beside a phone showing an abstract, unreadable chat layout, one blush chenille flower card and a forest-green pencil. Soft natural window light, tactile paper grain, restrained antique-gold accents, blush pink and lilac palette, calm intimate composition, real handcrafted imperfections, shallow shadows, 4:5 portrait, 1200×1500, photoreal, no legible text, no logo, no watermark.
```

### 02 — Choose your palette

```text
Luxury editorial still life of chenille stems and tiny material swatches being selected on a warm cream worktable: blush pink, soft lilac, ivory and forest green arranged in a quiet colour story with one slim antique-gold tool. Natural side light, subtle fibre detail, generous negative space, Indian boutique craft-studio atmosphere, sophisticated rather than colourful or commercial, 4:5 portrait, 1200×1500, photoreal, no text, no logo, no watermark.
```

### 03 — Handcrafted stem by stem

```text
Close documentary photograph of artisan hands gently twisting blush chenille around a floral wire and shaping one lilac petal, every fuzzy fibre sharply visible at the working point. Warm natural window light, cream linen surface, forest-green apron softly out of focus, tiny pearl pieces nearby, intimate premium editorial mood, believable handcraft and natural asymmetry, 4:5 portrait, 1200×1500, photoreal, no face, no text, no logo, no watermark.
```

### 04 — Wrapped with care

```text
Editorial close view of hands finishing a handcrafted chenille bouquet in coordinated warm-cream paper and tying a sheer blush ribbon, with a restrained antique-gold thread and soft lilac blooms. Forest-green studio background, natural side light, delicate paper folds, shallow depth of field, quiet luxury Indian gifting aesthetic, precise yet human craft, 4:5 portrait, 1200×1500, photoreal, no text, no logo, no watermark.
```

### 05 — Delivered to last forever

```text
Warm lifestyle photograph of a finished Studio Viana chenille bouquet being passed from an artisan's hands to a recipient at a softly lit doorway, focus on the lasting blush, lilac and ivory blooms with pearl details and forest-green wrap. Gentle natural afternoon light, emotional but understated, premium editorial crop, subtle gold accent, authentic Indian home atmosphere, 4:5 portrait, 1200×1500, photoreal, no visible faces, no text, no logo, no watermark.
```

## Testing checklist

- [x] Desktop Up Close pins for the full sequence; copy, macro crossfade, callout lines and release reverse cleanly.
- [x] Mobile Up Close does not pin; the zoom stays inside its frame and all three annotations remain readable.
- [x] Reduced motion shows complete macro/copy/callouts with no pin, scrub or hidden initial state.
- [x] Process line draws forward and backward through all five measured nodes and recalculates after resize.
- [x] All filters expose only matching items; Flip has no layout jump; All reports 18; View more mounts all 18.
- [x] Lightbox supports click, focus trap, arrows, Escape, backdrop, swipe, zoom and focus restoration.
- [x] “View this piece” closes the lightbox before one Phase 3 product dialog takes focus and scroll lock.
- [x] Testimonial controls and swipe reset progress; autoplay runs only while visible/unhovered and is absent for reduced motion.
- [x] Instagram exposes exactly ten profile links; its loop pauses off-screen/hovered; reduced motion is horizontally scrollable.
- [x] Closing rows run oppositely, react to velocity/direction and remain static for reduced motion with one accessible alternative.
- [x] Navbar targets Craft and Gallery correctly and switches between dark/light themes.
- [x] 320, 390, 768, 1024, 1440 and 1920px have no horizontal document overflow.
- [x] No-JavaScript output retains all copy, twelve gallery items, one testimonial and Instagram links.
- [x] Production has no same-origin 4xx/5xx, console/page/hydration errors or main-thread task at or above 50ms in the measured Phase 4 path.
- [ ] Re-run Lighthouse desktop after final photography replacement; target performance 90+ and confirm no CLS.

## Art replacement boundary

The implementation, filenames and responsive crops are production-ready, but photography uniqueness is not final. Replacing a placeholder can change intrinsic crop, decode cost and ScrollTrigger measurements, so run the complete production browser gate after every art batch.

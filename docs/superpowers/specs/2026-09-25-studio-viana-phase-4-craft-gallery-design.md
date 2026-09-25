# Studio Viana Phase 4 — Craft & Gallery Design

Date: 2026-09-25  
Branch: `feature/phase-4`  
Authority: the user-supplied Phase 4 brief plus the five generated section references in `docs/superpowers/concepts/phase-4/`

## Intent and success criteria

Phase 4 begins immediately after the Phase 3 Grand Bouquet showcase and makes the handcrafted value legible. The experience should feel like entering Studio Viana: fibres become visible, the making process becomes understandable, the catalogue becomes browsable, social proof becomes credible, and Instagram provides a living closing rhythm.

Success means the complete five-part sequence is present, functional and keyboard-accessible; mobile and reduced-motion users receive complete non-pinned alternatives; imagery is stable and lazy-loaded; animation work pauses off-screen; and the existing phases remain unchanged apart from page composition, the expanded navigation and the reusable marquee API.

## Accepted visual references

- `docs/superpowers/concepts/phase-4/up-close-desktop.png`
- `docs/superpowers/concepts/phase-4/process-desktop.png`
- `docs/superpowers/concepts/phase-4/gallery-desktop.png`
- `docs/superpowers/concepts/phase-4/testimonials-desktop.png`
- `docs/superpowers/concepts/phase-4/instagram-marquee-desktop.png`

The generated concepts establish composition, whitespace, typography relationships, photographic warmth and the forest/cream/gold rhythm. The exact user-authored copy in this specification overrides any different or invented text visible in a generated concept.

## Design system lock

- Backgrounds: existing `cream`, `cream-soft`, `forest` and `forest-deep` tokens only.
- Typography: existing Lora display and Poppins body stacks; no additional font dependency.
- Lines and controls: antique-gold hairlines, squared editorial controls and existing Button variants.
- Photography: warm natural light, blush/lilac/ivory blooms, forest-green accents and restrained gold details. Phase 4 files are tasteful duplicates of existing Studio Viana photography until final art is supplied.
- Containers: open full-width sections and rails, not rounded card grids.
- Section transitions: one consistent 96px soft gradient divider between dark and light surfaces.
- Motion: transforms, opacity and clip-path only during scrub; brief testimonial blur is allowed only during discrete slide transitions.

## Page composition

The order is fixed:

1. Existing Grand Bouquet showcase
2. `#craft-closeup` Up Close, dark
3. light transition divider
4. `#process` From Stem to Story, cream
5. `#gallery` Crafted by Hand, cream-soft
6. `#testimonials` Kind Words, cream
7. `#instagram` Follow the Bloom, cream
8. velocity marquee, dark
9. existing `#pricing` and `#contact` Phase 5 shells

Every section declares `data-theme`. Navbar adds Gallery between Craft and Pricing. Craft targets `#craft-closeup`; Gallery targets `#gallery`.

## A. Up Close

Desktop uses a 200vh trigger with a pinned 100svh stage and `scrub: 1`. The exact sequence is: copy reveals; the framed flower scales from 1 to 1.65; the macro source crossfades from 0 to 1 while scaling from 1.12 to 1; the three callout SVG lines draw and labels appear sequentially; the media settles to 1.48 before release. The section uses a dark forest surface, one gold outer frame and the exact heading/body from the supplied brief.

Mobile never pins. The flower image reveals normally, its inner image scrubs from 1 to 1.4, and the annotations become a numbered list below the frame. Reduced motion shows the macro, full copy and complete list statically.

## B. From Stem to Story

Typed process data supplies the five exact steps, image, icon type and number. A `StemPath` reads the centres of five node elements relative to the section container, generates a smooth cubic path and recalculates it through a debounced resize observer. One SVG path spans the sequence and draws with scroll progress; reduced motion renders it fully drawn.

Desktop alternates copy and 4:5 media across the central line. Mobile places a straight/softly curving line at the left with all content to the right. Each node fills when its step enters, icons draw once, text reveals and images use the existing `ImageReveal` component. The line terminates in a drawn flower and the exact WhatsApp order CTA.

## C. Crafted by Hand

Gallery data contains 18 typed entries across Bouquets, Hampers, Flower Cards, Single Stems and Occasions. Six keyboard-operable filter pills include All. Twelve visible items load initially; the next batch exposes the remaining six.

The grid uses responsive CSS columns: four desktop, three tablet and two mobile. Mixed source dimensions produce the editorial rhythm. On fine pointers, column wrappers receive alternating `yPercent` travel of -8/+8, items reveal once, hovered media scales and sibling items dim. Reduced motion disables all continuous or scrubbed motion.

Filtering captures GSAP Flip state immediately before the React update and plays from that state after layout. Removed entries fade/scale out and entering entries reveal without a container jump. Each completed filter/load change refreshes ScrollTrigger.

The lightbox is dynamically imported and preloaded on first item hover/focus. One stable dialog owns focus, Lenis/native scroll lock and the trigger reference. It supports X/Escape/backdrop close, focus trap, left/right keyboard controls, touch swipe, double-tap/click zoom, title/category/counter, adjacent image preloading, an optional product-detail event, and WhatsApp ordering. Framer Motion `layoutId` links grid and dialog media.

## D. Kind Words

Five clearly marked placeholder testimonials live in data. One centred slide is exposed through an `aria-live="polite"` region. Word spans animate out/in with short opacity/filter/y transitions. Previous/next controls, touch swipe and a six-second progress bar share the same index state.

Autoplay runs only when the slider is intersecting, not hovered and motion is allowed. It resets after manual navigation and is fully absent for reduced motion. Four editable trust statistics render beneath with gold dividers; finite numeric values count up once while symbolic values remain static.

## E. Follow the Bloom and velocity marquee

Ten square static Instagram images form a duplicated seamless rail linking only to the configured Instagram profile. The loop pauses off-screen and on hover. Scroll velocity temporarily changes direction and time scale before easing to the configured base. Reduced motion renders a static horizontally scrollable rail.

The existing Marquee API gains `velocityFactor`, `skew` and `reverse`. Its single retained timeline changes `timeScale` from ScrollTrigger velocity while `gsap.quickTo` smooths wrapper skew to a maximum of eight degrees. The closing component composes two opposite rows, is visually `aria-hidden`, and includes one screen-reader alternative.

## Data and assets

- `lib/data/process.ts`: five steps and tweakable craft motion constants.
- `lib/data/gallery.ts`: 18 gallery entries and `GalleryCategory`.
- `lib/data/testimonials.ts`: five placeholder reviews and four editable trust stats.
- `lib/data/instagram.ts`: ten static items and the profile URL.
- Exact media directories: `public/images/craft`, `process`, `gallery`, and `instagram`.

All new `next/image` instances use stable aspect containers, meaningful alt text, `sizes`, lazy defaults and static imports with blur metadata. Next already emits AVIF/WebP through the project configuration.

## Accessibility and resilience

- All filters, items, arrows and close controls use semantic buttons with visible gold focus states.
- Dialogs trap focus and restore the originating gallery trigger.
- The testimonial live region announces only the active testimonial.
- No-JavaScript output keeps all section copy, the first 12 gallery items, testimonial copy and Instagram links readable; filtering/lightbox/autoplay become optional enhancement.
- Reduced motion disables pins, zoom scrubs, parallax, velocity effects and autoplay; paths are fully drawn and content is visible.
- Touch has no cursor-only motion and uses swipe/double-tap affordances.

## Performance boundaries

- Lightbox is a client-only dynamic chunk preloaded on intent.
- Continuous timelines are one-per-component and pause through IntersectionObserver.
- Scroll handlers are passive or owned by ScrollTrigger; transient velocity lives in refs/tweens rather than React state.
- Filtering and loading refresh layout once after each committed change.
- The complete production browser run retains the existing no-50ms-main-thread-task gates and adds Phase 4 interaction coverage.

## Tweakable values

- Up Close pin distance: 200vh; scrub: 1; flower zoom: 1.65; release zoom: 1.48; mobile zoom: 1.4.
- Process path resize debounce: 120ms; image parallax: 0.35; node activation threshold: 70% viewport.
- Gallery parallax: ±8%; items per load: 12 then 6; reveal duration: 0.9s.
- Testimonial autoplay: 6000ms; transition: 650ms; swipe threshold: 48px.
- Instagram base loop: 34s desktop / 48s compact; maximum velocity multiplier: 3.
- Closing marquees: 26s and 34s; velocity factor: 1; maximum skew: 8 degrees.

## Intentional placeholder boundary

The code and exact files are production-ready, but the supplied brief explicitly permits tasteful placeholder photography. Existing Studio Viana photos will be duplicated/cropped into the Phase 4 inventory and clearly documented. Final shoot uniqueness, process accuracy and exact crop direction remain an art-production dependency, not a missing implementation.

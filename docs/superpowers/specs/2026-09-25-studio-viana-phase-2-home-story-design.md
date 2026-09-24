# Studio Viana Phase 2 Home Story Design

## Intent

Phase 2 replaces the Phase 1 Home placeholder with the first editorial chapter of the Studio Viana site: a seamless cream hand-off from the cinematic intro, a responsive navigation system, a product-led Home hero, the founder-led About story, and the image-led What We Do section. The experience is for customers choosing handcrafted chenille florals for gifts, celebrations, and events in Tamil Nadu. It must feel calm, tactile, airy, and luxurious while remaining easy to navigate, keyboard accessible, and performant on touch devices.

## Approved visual references

- `docs/superpowers/concepts/phase-2/home-desktop.jpg` — desktop navigation and Home hero.
- `docs/superpowers/concepts/phase-2/home-mobile.jpg` — mobile navigation and stacked Home hero.
- `docs/superpowers/concepts/phase-2/about-desktop.jpg` — About split and values strip.
- `docs/superpowers/concepts/phase-2/craft-desktop.jpg` — expanding image band, services, and marquee.

These images are layout references. Navigation, text, controls, and decorative vectors remain code-native. The product photos are separate production assets under `public/images/products/`.

## Design system extraction

### Palette and surfaces

- Exact intro/hero hand-off: cream `#F7F0E6`.
- Alternate editorial surface: cream-soft `#FBF7F1`.
- Primary dark surface: forest `#1F3326`; deep hover/overlay forest `#16241B`.
- Display/body text: charcoal `#2A2A26`; body-muted `#6B665E`.
- Accent and rules: gold `#B8925A`; light gold `#D6B98A`.
- Hero glow: blush `#E9C9C9` at approximately 25% opacity.
- Paper grain is a non-interactive texture at 2–3% opacity and never alters text contrast.
- Product imagery is untinted. A natural edge shadow may improve overlay legibility on the image band, but no flat color wash may cover the photos.

### Typography

- Display and editorial titles: Lora, normal and italic, with tight negative tracking at large sizes.
- Body, labels, controls, and navigation: Poppins 300–500.
- Desktop Home heading: `clamp(3rem, 7vw, 6.5rem)`, line-height approximately `1.02`.
- Section headings use the existing `SplitTextReveal`; body text uses the existing `Reveal` except for the requested scrubbed About paragraphs.
- Labels and navigation use uppercase Poppins with generous letter-spacing. Body copy remains at least 16px where space permits and keeps 4.5:1 contrast.

### Layout and components

- Shared content width and gutters come from `Container`; desktop compositions use the existing 12-column grid.
- Open editorial layouts are preferred over cards. Fine gold hairlines, image frames, deliberate overlap, and whitespace provide structure.
- Buttons reuse the existing solid-forest and outline-gold variants with at least 44px touch targets and visible gold focus rings.
- The navbar is 84px on desktop and 72px on mobile. It is transparent at the top and becomes a blurred 85%-opaque surface after 80px.
- Hero imagery uses stable aspect-ratio frames so no layout shift occurs.

## Information architecture

The rendered page order is:

1. `IntroSection`
2. `HomeHero` (`#home`)
3. `AboutStudio` (`#about`)
4. `WhatWeDo` (`#craft`), including the image band, services, and dark marquee
5. Empty Phase 3–5 shells for `#collection`, `#pricing`, and `#contact`

The root layout owns `IntroProvider`, `SmoothScrollProvider`, and `Navbar`. The page remains a Server Component that composes client islands for interactive sections.

## Intro hand-off contract

`IntroContext` exposes:

```ts
interface IntroContextValue {
  introComplete: boolean;
  markIntroComplete: () => void;
  markIntroActive: () => void;
}
```

The provider initializes from `document.documentElement.dataset.introComplete` and the current scroll position after mount. `IntroSection` calls `markIntroComplete` when its ScrollTrigger leaves forward, after Skip lands on Home, and in reduced-motion/static mode. It calls `markIntroActive` when the user reverses into the intro. `markIntroComplete` also dispatches `studio-viana:intro-complete` for decoupled listeners and preserves the existing `data-intro-complete` HTML contract.

`HomeHero` runs its controlled 2.2-second entrance once when the context becomes complete and the hero is within the first viewport. On a reload below the intro, the provider marks completion and the hero renders at its final state immediately. With reduced motion, all content is visible without parallax, floating, scrubbed words, or clip-path animation.

Fonts and hero images call `refreshScrollTrigger()` after loading. The intro refreshes again when its pin is released.

## Navigation

### Desktop

The fixed `header` contains the Studio Viana wordmark and a custom mandala SVG on the left; Collection, About, Craft, Pricing, and Contact links in the centre; and an outline-gold WhatsApp action on the right. The WhatsApp URL uses `whatsappLink()` with a friendly default Studio Viana enquiry.

After 80px, the header gains a cream or forest background at 85% opacity, `backdrop-filter: blur(12px)`, and a 40%-gold bottom hairline. Lenis scroll direction hides the header while moving down and reveals it while moving up. The header remains visible while the mobile menu is open or when focus is inside it.

Each link calls `lenis.scrollTo(target, { offset: -84, duration: 1.4 })`, falling back to native `scrollIntoView` for reduced motion or before Lenis mounts. ScrollTrigger instances set the active section underline. `useNavTheme` samples the section beneath the header; a section with `data-theme="dark"` switches wordmark, links, hamburger, and focus treatment to cream.

### Mobile menu

Below 1024px the centre links and WhatsApp button are replaced by a two-line hamburger. Opening it expands a forest overlay with `clip-path: circle(...)` from the trigger corner. The hamburger morphs into an X. The overlay contains numbered large Lora navigation links, contact details, Instagram, and a gold inset frame.

Opening the menu stops Lenis, stores the previously focused element, moves focus to the close/navigation surface, and traps Tab/Shift+Tab. Escape, a link selection, or the close control closes the menu, restarts Lenis, and returns focus. The overlay uses `role="dialog"`, `aria-modal="true"`, an accessible name, `aria-expanded`, and `aria-controls`.

## Home hero

The full-height cream hero starts directly after the intro. `PaperGrain` and a soft blush radial glow sit behind content with `pointer-events: none`.

Desktop uses columns 1–6 for the supplied label, three-line heading, divider, body, two actions, and trust row. Columns 7–12 contain `HeroCollage`: the Grand Bouquet in a gold offset frame, plus Blush Lily, Just For You Hamper, and Flower Card at asymmetric sizes. Each frame uses a static import with `placeholder="blur"`, correct `sizes`, useful alt text, and a stable aspect ratio. Only above-the-fold hero images use `priority`.

`Float` gains explicit duration/amplitude/delay values and pauses via `IntersectionObserver`. On fine pointers, each collage item uses `gsap.quickTo` for independent x/y cursor depth from 8–30px. ScrollTrigger moves items upward from -10 to -40 yPercent as the hero leaves. Touch and reduced-motion environments disable cursor motion and use gentler or static floating.

`RotatingBadge` uses an SVG text path and mandala. It rotates slowly while visible, pauses off-screen, and briefly increases timeScale from scroll velocity. The bottom rail contains the animated Scroll cue and `2026–27 Collection`.

The controlled entrance order is label, split headline lines, divider/body/actions, staggered image clip reveals, badge, then navbar. It runs once and leaves deterministic final styles.

On mobile the content stacks before a three-image collage. Buttons become full-width, the headline never exceeds the viewport, mouse parallax is absent, and image overlap remains controlled within the section.

## About the Studio

`AboutStudio` is a 45/55 split on desktop and a stacked layout on mobile. The left panel uses the lilac pearl dome asset within a top-to-bottom `ImageReveal` and a slower inner `ParallaxImage` treatment. The caption chip is code-native.

The right panel contains the decorative quote mark, supplied label, heading, divider, exact two paragraphs, Dr. Sadhana signature, founder label, and `MagnoliaLineArt`. `WordScrubText` tokenizes accessible paragraph text into decorative `aria-hidden` word spans plus one screen-reader string. ScrollTrigger scrubs each word from 0.15 to 1 opacity in reading order; reduced motion renders a normal paragraph.

The magnolia SVG draws its paths with stroke-dashoffset when the lower text enters. The values strip uses four open columns divided by gold hairlines. `100%` counts from 0 to 100 once; the remaining value words fade up with a stagger. Mobile places the 70svh image first and uses a lighter non-scrub reveal where required for performance.

## What We Do

`ExpandingImageBand` starts at `clip-path: inset(10% 12% round 4px)` with its inner image at 1.2 scale. A scrubbed ScrollTrigger expands it to full bleed and scale 1 as it enters. The exact cream headline fades upward during the final third. Reduced motion shows the expanded static image and headline.

The centred section label and heading lead into four `ServiceColumn` instances sourced from `services`. The description for Hampers is updated to include “dressed for birthdays, anniversaries and thank-you gestures.” Each column shows its number, divider, title, description, and a Discover link to `#collection`.

On desktop fine pointers, entering a column lifts it 6px, extends the divider, and reveals `CursorImageFollow`; x/y motion uses `gsap.quickTo` within the column. It disappears on leave and is never mounted as an interactive surface. Touch and reduced-motion layouts omit the preview. The service grid changes from 4 columns to 2×2 to a stack.

The ending `Marquee` is a forest dark-theme band. Its loop pauses outside the viewport and reacts to ScrollTrigger velocity by changing timeScale and momentary direction without recreating tweens. The supplied text repeats seamlessly.

## Static shells

`#collection`, `#pricing`, and `#contact` are semantic, labelled empty sections with enough minimum height to allow navigation and active-link validation. They contain only a small phase label and restrained heading, not fabricated Phase 3–5 content.

## Product asset inventory

| File | Product/use | Native aspect | Recommended source size |
| --- | --- | --- | --- |
| `grand-bouquet.jpg` | Main Home collage / Bouquets preview | 4:5 | 1600×2000 |
| `blush-lily.jpg` | Home side image | 1:1 | 1600×1600 |
| `just-for-you-hamper.jpg` | Home collage / Hampers preview | 4:3 | 1600×1200 |
| `flower-card.jpg` | Home collage / Return Gifts preview | 4:5 | 1200×1500 |
| `lilac-pearl-dome.jpg` | About panel / Corporate preview | 3:4 | 1800×2400 |
| `i-love-you-lily-band.jpg` | Expanding image band | 3:2 | 2400×1600 |

All six files are included in `public/images/products/`. Their generated dimensions retain the required aspect ratios, and Next Image produces responsive derivatives.

## Tweakable motion values

- Hero float amplitudes: 7, 10, 13, and 16px; durations: 4.8–7.2s; delays: 0–1.1s.
- Cursor parallax depths: 8, 14, 22, and 30px.
- Hero scroll parallax: -10, -18, -28, and -40 yPercent.
- About inner parallax speed: 0.15.
- Word scrub: start `top 82%`, end `bottom 58%`, opacity 0.15→1.
- Image band scrub: 1.0, start `top 92%`, end `top 15%`.
- Service stagger: 0.12s; hover lift: 6px.
- Marquee base duration: 24s; velocity scale clamp: 0.6–3.0.
- Navigation movement: 0.5s with `power3.out`; smooth-scroll duration: 1.4s and -84px offset.

## Accessibility and failure behavior

- The document uses `header`, `nav`, `main`, and labelled `section` elements.
- Decorative grain, line art, hairlines, and repeated marquee copies are hidden from assistive technology.
- Focus is never hidden behind the navbar; menu focus is trapped; Escape and link activation close it.
- Every image has specific alt text. Decorative previews use empty alt text.
- If JS, Lenis, GSAP, font loading, storage, or IntersectionObserver is unavailable, the page remains visible and anchor links still work.
- Reduced-motion users get static content with simple opacity transitions only.
- Body text and controls meet at least 4.5:1 contrast; focus outlines remain visible on cream and forest.

## Performance contract

- Only transform, opacity, and clip-path are animated.
- Pointer handlers use `gsap.quickTo`; no new tween is created per pointer event.
- Float, rotating badge, cursor preview, and marquee work stop while off-screen.
- Only hero assets are eager/priority. Every lower image is lazy-loaded by Next Image.
- Fixed ratios prevent CLS. Effects are scoped and reverted through `gsap.context()` and `gsap.matchMedia()`.
- ScrollTrigger refresh runs after fonts/images load and after intro pin release.

## Verification matrix

- Intro completion, reverse scroll, Skip Intro, reload mid-intro, and reload below Home.
- Navbar initial entrance, >80px surface, hide/show direction, active link, dark-theme color, and all smooth-scroll targets.
- Mobile menu animation, Escape, focus trap, focus return, link close, and Lenis stop/start.
- Hero entrance ordering, desktop pointer depth, touch fallback, scroll parallax, and badge response.
- About image reveal, word scrub, signature/magnolia, values count, and mobile stack.
- Expanding band, services entrance/count, cursor preview, Discover links, and marquee pause/velocity response.
- Reduced motion, keyboard-only use, no horizontal overflow, no missing images, and no console/hydration errors.
- Layout screenshots at 360, 390, 768, 1024, 1440, and 1920px.
- Format, lint, TypeScript, unit tests, production build, Playwright functional tests, Lighthouse-style accessibility/performance checks, and a Chrome trace with no scroll long task at or above 50ms.


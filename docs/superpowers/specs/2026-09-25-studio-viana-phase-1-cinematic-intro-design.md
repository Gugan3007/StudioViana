# Studio Viana Phase 1 Cinematic Intro Design

Date: 2026-09-25
Status: Approved for implementation

## 1. Objective

Replace the temporary Phase 0 showcase with Studio Viana's cinematic first impression: a reversible, scroll-scrubbed journey from a forest-green brand moment through the heart of a handcrafted chenille flower into a seamless cream Home hero placeholder.

Phase 1 adds the intro system only. The full Home hero, navigation, About, and What We Do sections remain Phase 2 work. Phase 0 tokens, UI primitives, data, GSAP registration, Lenis provider, reduced-motion hook, and split-text component remain the foundation and must be extended rather than rebuilt.

## 2. Approved Experience

The normal-motion experience contains one pinned section controlled by one GSAP master timeline. Its normalized time runs from 0 to 100 so scene labels map directly to the approved scroll ranges:

- `brand` at 0: Scene 1 occupies 0–15.
- `flower` at 15: the circular flower reveal occupies 15–35.
- `dive` at 35: the camera dive and poetic lines occupy 35–80.
- `light` at 80: the cream light transition occupies 80–100.
- `complete` at 100: the pin releases into the cream Home hero.

The three poetic lines are enabled by default:

1. “Shaped stem by stem…”
2. “petal by petal…”
3. “made to last forever.”

Each line receives a word-by-word blur-and-opacity entrance, a short readable hold, and a reversible exit. Text remains decorative to the visual journey but readable by assistive technology as one ordered quotation.

## 3. Architecture

### 3.1 Master ownership

`IntroSection` is the only owner of the pinned ScrollTrigger and master GSAP timeline. It renders the scene components as semantic markup and targets their stable `data-intro-*` attributes inside a scoped `gsap.context()`. React does not receive progress updates during scroll, avoiding component rerenders on the animation hot path.

The master timeline is created through `gsap.matchMedia()` with three normal-motion variants:

- Desktop, at least 1024px: 400vh scroll distance, all layers, dive scale 6.
- Tablet, 768–1023px: 300vh, reduced particles, dive scale 4.
- Mobile, below 768px: 220vh, portrait flower asset, one petal layer, no blurred duplicate, dive scale 3.

Each match-media branch builds and returns cleanup for its own timeline. `gsap.context().revert()` and `gsap.matchMedia().revert()` remove animations, ScrollTriggers, inline styles, and media listeners during Strict Mode remounts and component teardown.

### 3.2 Scene components

The scene files remain presentational and focused:

- `Preloader` renders the wordmark, real progress, counter, and viewport frame.
- `BrandMoment` renders the wordmark lockup, catalogue frame, location/collection labels, tagline, scroll cue, and ambient particles.
- `FlowerDive` renders the masked poster, ring, blurred middle layer, petal depth layers, vignette, and poem.
- `FlowerSequence` owns the responsive canvas, DPR-aware cover drawing, and an imperative frame-render handle used by the master timeline.
- `LightTransition` renders the radial cream-gold bloom.
- `AmbientParticles`, `ScrollCue`, and `SkipIntro` isolate their animation and interaction concerns.
- `HomeHeroPlaceholder` provides the cream landing surface and headline while preserving the Phase 2 boundary.

### 3.3 Configuration

`intro.config.ts` is the only tuning surface for:

- `INTRO_MODE`: `"layers"` or `"sequence"`, defaulting to `"layers"`.
- desktop/mobile flower paths and petal paths.
- sequence directory, filename prefix, padding, extension, and frame count.
- focal point percentages.
- breakpoint-specific pin distances, maximum dive scale, particle counts, and layer flags.
- scrub value, preload timeouts, session repeat duration, poem lines, and timeline labels.

The focal point is represented as numeric percentages and applied consistently to `object-position` and `transform-origin`.

## 4. Loading and Scroll Lifecycle

### 4.1 Asset manifest

The default layered manifest contains the responsive poster and the active petal layers. Sequence mode contains all configured frame URLs, while the first frame is also treated as the poster. Fonts are awaited separately through `document.fonts.ready`.

`preloadImages()`:

- accepts an ordered list of URLs, a progress callback, and an optional timeout signal;
- loads and calls `decode()` when available;
- reports settled assets so one corrupt optional layer cannot deadlock the intro;
- uses sequence priority order: frame 1, every tenth frame, then all remaining frames without duplicates;
- caps concurrent requests to avoid a 150-request burst;
- returns loaded and failed URL lists for diagnostics.

### 4.2 Preloader state machine

The preloader has `loading`, `exiting`, and `complete` states. On initial mount it stops Lenis as soon as the instance exists and applies a document-level scroll lock immediately so native scrolling cannot slip through while Lenis initializes.

Progress represents real settled/decode progress. Completion waits for the later of asset completion and the minimum display duration: 1.8 seconds on the first visit and 0.8 seconds after `sessionStorage["studio-viana:intro-seen"]` is set. A six-second watchdog completes with available assets. The line first fills horizontally; after completion it becomes the four-sided inset gold frame, then the preloader fades away.

Cleanup always clears timers, unlocks native scrolling, and restarts Lenis if the preloader stopped it. Completion refreshes ScrollTrigger after fonts and images settle.

### 4.3 Reload and restoration

The intro never forces the viewport to zero. A per-path session value is written on `pagehide` and read only when the Navigation Timing entry identifies a reload. This supplements native restoration because the browser can clamp a post-intro scroll position before ScrollTrigger recreates its pin spacer. After preload and font completion, ScrollTrigger refreshes, Lenis recalculates its limit, and the reload position is restored immediately; fresh navigations are never repositioned. A repeat session shortens only the preloader; it does not silently skip the visual story.

## 5. Render Modes

### 5.1 Layered mode

The poster begins behind a circular `clip-path`, settles from scale 1.3 to 1.1, and then dives to the breakpoint's configured scale. A matching SVG circle animates its dash offset and expansion before fading.

The blurred duplicate is desktop/tablet only and peaks at low opacity. Transparent petal layers enter from opposing edges, then scale past the camera with stronger translation and limited blur. The vignette strengthens during the deepest portion. Rotation peaks at eight degrees on desktop and is reduced at smaller breakpoints.

The primary poster is a priority `next/image` with explicit responsive `sizes`, a stable full-viewport frame, and a local blur data URL. Animated layers use GPU-friendly transforms; blur is restricted to the petal layers and middle copy.

### 5.2 Sequence mode

The canvas renderer preloads frames in the configured priority order and retains successfully decoded `HTMLImageElement` objects. The canvas backing size follows viewport dimensions times `min(devicePixelRatio, 2)`, while CSS sizing remains viewport-based. Resize work is debounced to an animation frame.

The master timeline tweens a plain `{ frame }` object with snapping. `onUpdate` requests the nearest loaded frame from `FlowerSequence`; if a requested frame is still unavailable, the nearest previously loaded frame remains visible. Drawing uses cover geometry centered on the configured focal point.

The overlay choreography, poem, vignette, skip button, preload exit, and light bloom are identical in both modes. Missing or failed sequence frames do not crash the page; the canvas retains the poster/fallback while the loader exposes failed URLs through its result.

## 6. Navigation and Intro Controls

The skip control appears after the preloader and remains fixed at the safe-area-aware bottom-right corner. It is a real button with visible focus and an animated underline. Activation calls `lenis.scrollTo(homeHero, { duration: 1.6 })`; native `scrollIntoView()` is the fallback when Lenis is unavailable or reduced motion is active.

The control sets a transient skipping state to prevent repeat activation. The Home hero carries the stable `#home` destination. No production navigation bar is created in Phase 1; an explicit `data-intro-complete` document state and callback contract are provided so the Phase 2 nav can fade in at the boundary without changing intro internals.

## 7. Reduced Motion and Accessibility

Reduced motion creates no pin, master scrub, ambient loops, canvas sequence, parallax, scale dive, or automatic blur. The section becomes a static, naturally sized forest hero with the brand lockup and flower poster, followed by the normal cream Home hero. The preloader becomes a short functional loading surface without letter motion or expanding-frame animation.

All visible brand and poem copy exists in the DOM. Decorative duplicate images, petals, grain, bokeh, rings, and canvas are hidden from assistive technology. The sequence canvas has an accessible text alternative nearby. Focus order contains only the skip button before the Home hero. High-contrast focus treatment comes from Phase 0.

The intro uses `100svh` as its stable base and `100dvh` only as a progressive enhancement where appropriate. Safe-area insets protect mobile controls. Content remains legible at 320px without horizontal overflow.

## 8. Performance Strategy

- Scroll work stays inside GSAP/ScrollTrigger; React state is limited to preload lifecycle and sequence readiness.
- Animated transforms and opacity are the default. Clip-path is limited to the poster mask; filter blur is limited to small petals and the optional middle copy.
- `will-change` is enabled only while the pinned intro is active and is cleared on leave/cleanup.
- All full-viewport layers use absolute positioning and stable dimensions, keeping intro CLS at zero.
- Particle count is capped per breakpoint. Their CSS/GSAP loop is paused by IntersectionObserver when the intro is outside the viewport.
- ScrollTrigger refresh occurs after preload/font completion and responsive image load.
- Sequence loading is concurrency-limited and frame drawing is coalesced through `requestAnimationFrame`.

The browser suite asserts the absence of runtime errors and overflow. A production-server Chromium probe also records Long Tasks while scrubbing the entire intro and fails if any are observed. A manual Chrome Performance recording remains required for the final device-specific 60fps judgment because CI timing is not a substitute for target hardware.

## 9. Placeholder and Final Asset Contract

Phase 1 ships original local placeholder artwork so the complete layered experience works without external files. Final replacements belong at:

- `/public/images/hero/flower-macro.jpg` — 3840×2160 minimum, high-quality JPEG, sRGB, clear flower center, ideally under 1.5 MB after optimization.
- `/public/images/hero/flower-macro-mobile.jpg` — 1440×2560, high-quality JPEG, portrait crop, ideally under 900 KB.
- `/public/images/hero/petal-layer-1.png` — transparent PNG, 2400×1600 recommended, isolated edge petals, ideally under 1 MB.
- `/public/images/hero/petal-layer-2.png` — transparent PNG, 2400×1600 recommended, distinct depth arrangement, ideally under 1 MB.
- `/public/brand/logo.svg` — outlined/vector Studio Viana wordmark plus ornamental mandala, cropped viewBox, no linked fonts or raster images.

Placeholder filenames are separate and centralized in config, so final files can be activated by changing paths without changing component code. The temporary logo is a semantic typographic lockup and ornamental SVG mark; it does not pretend to be the final production logo.

Sequence frames belong at `/public/sequence/flower_0001.webp` through `/public/sequence/flower_0150.webp`. The documentation includes an exact `ffmpeg` conversion command and the single config change required to enable them.

## 10. Error Handling

- Asset failures count toward preload completion and are returned for diagnostics.
- The six-second watchdog prevents a permanent loading trap.
- Layered mode keeps a CSS gradient behind imagery, so a missing poster never exposes an empty screen.
- Sequence mode keeps its last successfully drawn frame and provides an accessible poster fallback.
- Session storage access is guarded for privacy/security modes that can throw.
- All timers, image listeners, observers, RAF callbacks, GSAP contexts, and media-query handlers are removed on cleanup.

## 11. Testing and Verification

Unit and component tests cover:

- unique sequence preload order and progress reporting;
- decode failures and timeout completion;
- config invariants and scene label ordering;
- preloader first/repeat-session timing behavior;
- Lenis stop/start and native scroll-lock cleanup;
- skip behavior with Lenis and native fallback;
- sequence canvas cover math, DPR cap, and nearest-frame behavior;
- semantic static output under reduced motion;
- one scoped master timeline and teardown contracts.

Browser verification covers:

- desktop, tablet, and 320px mobile layouts;
- no horizontal overflow, broken assets, hydration warnings, or console errors;
- real preloader progress and release;
- reversible forward/back scroll states;
- skip-to-Home behavior;
- reload at restored mid-intro and post-intro positions;
- reduced-motion static flow without pinning or persistent animation;
- both `layers` and a small fixture-backed `sequence` mode where practical;
- visual screenshots at the brand, flower, dive, light, and Home states.

The complete gate remains formatting, ESLint, TypeScript, Vitest, production build, and Playwright. Phase 1 is complete only after these checks pass from a clean worktree.

## 12. Deliverables

- All new source, tests, placeholder assets, and documentation committed on `feature/phase-1`.
- Inline master-timeline comments label the 0–15, 15–35, 35–80, and 80–100 ranges.
- README documents tunable values, mode switching, final asset specifications, AI-generation prompts, the exact `ffmpeg` command, and the manual test/performance checklist.
- A concise completion handoff identifies automated evidence and any manual final-asset work remaining for the user.

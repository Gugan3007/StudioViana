# Studio Viana Phase 1 Cinematic Intro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reversible, responsive, asset-aware cinematic flower dive that moves from Studio Viana's forest brand moment into a seamless cream Home hero.

**Architecture:** `IntroSection` owns one scoped, labeled GSAP master timeline and selects breakpoint parameters through `gsap.matchMedia()`. Presentational scene components expose stable data attributes, the layered and canvas renderers share the same overlay choreography, and React state is kept off the scroll hot path.

**Tech Stack:** Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 3, GSAP/ScrollTrigger, Lenis, `next/image`, Vitest/Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-25-studio-viana-phase-1-cinematic-intro-design.md`

## Global Constraints

- Reuse the Phase 0 tokens, primitives, GSAP registration, Lenis provider, reduced-motion hook, and animation utilities; do not reinstall or replace the foundation.
- `IntroSection` owns exactly one pinned ScrollTrigger and one master timeline per active match-media branch.
- Timeline labels are `brand: 0`, `flower: 15`, `dive: 35`, `light: 80`, and `complete: 100`.
- Default `INTRO_MODE` is `"layers"`; `"sequence"` is switchable from `intro.config.ts`.
- Desktop is at least 1024px with 400vh and scale 6; tablet is 768–1023px with 300vh and scale 4; mobile is below 768px with 220vh and scale 3.
- Normal motion uses `scrub: 1.2`; reduced motion creates no pin, scrub, sequence canvas, ambient loop, blur dive, or forced scrolling.
- First-session preload lasts at least 1.8 seconds; repeat-session preload lasts at least 0.8 seconds; both have a six-second maximum.
- Real image settlement/decode drives progress. Failures advance progress and never trap the visitor.
- The three poem lines remain enabled and in the approved order.
- Animate only transforms, opacity, clip-path, and tightly scoped filters; remove temporary `will-change` after the intro.
- Do not create the production navigation, full Home hero, About, What We Do, or any Phase 2 content.
- No `any`, hydration errors, console errors, horizontal overflow at 320px, or layout shift in the intro.

## Review Focus

- Lenis becomes available after preload begins: the active instance must still be stopped, restarted exactly once, and never left stopped after unmount.
- One image rejects or `decode()` throws: progress reaches 100%, the failure is reported, and the six-second watchdog cannot fire completion twice.
- Sequence frames load out of order or have gaps: frame drawing retains the last good frame and never dereferences an absent image.
- Strict Mode mounts, unmounts, and remounts the intro: only one ScrollTrigger, observer, timer set, and RAF callback survive.
- A page restores to the middle or below the intro: no forced scroll-to-top occurs, and refresh resolves the visual state to restored scroll progress.

---

## Planned File Map

### Intro configuration and loading

- `components/intro/intro.config.ts` — immutable mode, asset, timing, focal-point, sequence, and breakpoint values.
- `lib/animations/preloadImages.ts` — concurrency-limited ordered image decode with progress and failure reporting.
- `tests/intro-config.test.ts` — configuration invariants and sequence URL/load-order checks.
- `tests/preload-images.test.ts` — loader success, failure, progress, concurrency, and timeout behavior.

### Scene components

- `components/intro/Preloader.tsx` — loading state machine and visual preload overlay.
- `components/intro/BrandMoment.tsx` — logo lockup, catalogue frame, corner copy, tagline, particles, and scroll cue.
- `components/intro/FlowerDive.tsx` — poster, mask, ring, depth layers, vignette, and poem markup.
- `components/intro/FlowerSequence.tsx` — canvas renderer with imperative frame access.
- `components/intro/LightTransition.tsx` — cream-gold bloom layer.
- `components/intro/AmbientParticles.tsx` — deterministic low-count decorative particles and pause observer.
- `components/intro/ScrollCue.tsx` — decorative scroll label and drop line.
- `components/intro/SkipIntro.tsx` — accessible Lenis/native skip control.
- `components/intro/IntroSection.tsx` — preload integration and the single master timeline.
- `components/intro/sequenceCanvas.ts` — pure canvas cover geometry and nearest-loaded-frame helpers.
- `tests/intro-components.test.tsx` — semantics, reduced-motion states, session timing, scroll control, and cleanup.
- `tests/sequence-canvas.test.ts` — pure geometry and fallback-frame behavior.
- `tests/intro-timeline.test.tsx` — timeline labels, media branches, pin options, reduced motion, and teardown.

### Page composition and assets

- `components/sections/HomeHeroPlaceholder.tsx` — cream Phase 2 boundary with controlled split-line headline.
- `components/animations/SplitTextReveal.tsx` — adds a controlled mode for master-timeline ownership.
- `app/page.tsx` — replaces the specimen sheet with intro, Home placeholder, and neutral test spacers.
- `app/globals.css` — intro-only grain, viewport, layer, safe-area, and reduced-motion rules.
- `public/brand/logo-placeholder.svg` — temporary local ornamental lockup.
- `public/images/hero/flower-macro-placeholder.svg` — landscape chenille macro fixture.
- `public/images/hero/flower-macro-mobile-placeholder.svg` — portrait chenille macro fixture.
- `public/images/hero/petal-layer-1-placeholder.svg` — transparent near-petal fixture.
- `public/images/hero/petal-layer-2-placeholder.svg` — transparent far-petal fixture.
- `README.md` — operating instructions, asset contract, AI prompts, ffmpeg command, and verification checklist.
- `tests/browser/intro.spec.ts` — responsive, interaction, restoration, reduced-motion, and console assertions.

---

### Task 1: Lock Configuration and Sequence Ordering

**Files:**
- Create: `components/intro/intro.config.ts`
- Create: `tests/intro-config.test.ts`

**Interfaces:**
- Consumes: no new runtime modules.
- Produces: `IntroMode`, `IntroBreakpoint`, `introConfig`, `getSequenceFrameUrl(index: number): string`, `getSequenceFrameUrls(): string[]`, and `getSequenceLoadOrder(urls?: readonly string[]): string[]`.

- [ ] **Step 1: Write failing configuration tests**

```ts
import { describe, expect, it } from "vitest";

import {
  getSequenceFrameUrl,
  getSequenceFrameUrls,
  getSequenceLoadOrder,
  introConfig,
} from "@/components/intro/intro.config";

describe("introConfig", () => {
  it("keeps the approved scene labels and breakpoint choreography", () => {
    expect(introConfig.timeline).toEqual({
      brand: 0,
      flower: 15,
      dive: 35,
      light: 80,
      complete: 100,
    });
    expect(introConfig.breakpoints.desktop).toMatchObject({ pinVh: 400, diveScale: 6 });
    expect(introConfig.breakpoints.tablet).toMatchObject({ pinVh: 300, diveScale: 4 });
    expect(introConfig.breakpoints.mobile).toMatchObject({
      pinVh: 220,
      diveScale: 3,
      showMiddleLayer: false,
      petalLayers: 1,
    });
  });

  it("formats all frame URLs and prioritizes frame one then every tenth frame", () => {
    expect(getSequenceFrameUrl(1)).toBe("/sequence/flower_0001.webp");
    expect(getSequenceFrameUrl(150)).toBe("/sequence/flower_0150.webp");
    const urls = getSequenceFrameUrls();
    const ordered = getSequenceLoadOrder(urls);
    expect(ordered).toHaveLength(150);
    expect(new Set(ordered).size).toBe(150);
    expect(ordered.slice(0, 4)).toEqual([
      "/sequence/flower_0001.webp",
      "/sequence/flower_0010.webp",
      "/sequence/flower_0020.webp",
      "/sequence/flower_0030.webp",
    ]);
  });
});
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `npm test -- tests/intro-config.test.ts`

Expected: FAIL because `components/intro/intro.config.ts` does not exist.

- [ ] **Step 3: Implement immutable configuration and URL helpers**

Define `introConfig` with `as const satisfies IntroConfig`. Include:

```ts
export type IntroMode = "layers" | "sequence";
export type IntroBreakpoint = "desktop" | "tablet" | "mobile";

export const INTRO_MODE: IntroMode = "layers";

export const introConfig = {
  mode: INTRO_MODE,
  focalPoint: { x: 50, y: 48 },
  scrub: 1.2,
  preload: { firstVisitMs: 1800, repeatVisitMs: 800, maximumMs: 6000 },
  timeline: { brand: 0, flower: 15, dive: 35, light: 80, complete: 100 },
  poem: [
    "Shaped stem by stem…",
    "petal by petal…",
    "made to last forever.",
  ],
  assets: {
    desktopFlower: "/images/hero/flower-macro-placeholder.svg",
    mobileFlower: "/images/hero/flower-macro-mobile-placeholder.svg",
    petals: [
      "/images/hero/petal-layer-1-placeholder.svg",
      "/images/hero/petal-layer-2-placeholder.svg",
    ],
    logo: "/brand/logo-placeholder.svg",
  },
  sequence: {
    directory: "/sequence",
    prefix: "flower_",
    extension: "webp",
    padding: 4,
    frameCount: 150,
  },
  breakpoints: {
    desktop: { pinVh: 400, diveScale: 6, particles: 9, petalLayers: 2, showMiddleLayer: true },
    tablet: { pinVh: 300, diveScale: 4, particles: 6, petalLayers: 2, showMiddleLayer: true },
    mobile: { pinVh: 220, diveScale: 3, particles: 4, petalLayers: 1, showMiddleLayer: false },
  },
} as const;
```

`getSequenceLoadOrder()` must keep frame one first, select URLs whose one-based frame index is divisible by ten, and append every other URL without duplicates.

- [ ] **Step 4: Run tests and static checks**

Run: `npm test -- tests/intro-config.test.ts && npm run typecheck && npm run lint`

Expected: PASS.

- [ ] **Step 5: Commit configuration**

```bash
git add components/intro/intro.config.ts tests/intro-config.test.ts
git commit -m "feat: configure cinematic intro"
```

### Task 2: Build the Asset Decode Pipeline

**Files:**
- Create: `lib/animations/preloadImages.ts`
- Create: `tests/preload-images.test.ts`

**Interfaces:**
- Consumes: ordered image URL arrays from Task 1.
- Produces: `PreloadProgress`, `PreloadResult`, `PreloadOptions`, and `preloadImages(urls, onProgress?, options?): Promise<PreloadResult>`.

- [ ] **Step 1: Write failing loader tests with an injected image factory**

Test these contracts:

```ts
const progress: number[] = [];
const result = await preloadImages(["/one.webp", "/two.webp"],
  (value) => progress.push(value.percent),
  { createImage: makeSuccessfulImages(), concurrency: 1 },
);
expect(progress).toEqual([0, 50, 100]);
expect(result).toEqual({ loaded: ["/one.webp", "/two.webp"], failed: [], timedOut: false });
```

Add cases where `decode()` rejects and where a controlled timeout resolves pending URLs into `failed` exactly once. Track the injected factory's active request count and assert it never exceeds the configured concurrency.

- [ ] **Step 2: Run the test and confirm RED**

Run: `npm test -- tests/preload-images.test.ts`

Expected: FAIL because the loader module does not exist.

- [ ] **Step 3: Implement the loader**

Use these public shapes:

```ts
export interface PreloadProgress {
  completed: number;
  total: number;
  percent: number;
  url?: string;
}

export interface PreloadResult {
  loaded: string[];
  failed: string[];
  timedOut: boolean;
}

export interface PreloadOptions {
  concurrency?: number;
  timeoutMs?: number;
  createImage?: () => HTMLImageElement;
}
```

Deduplicate URLs while preserving order. Emit zero before work. Set `image.decoding = "async"`, attach `load` and `error` listeners before assigning `src`, call `decode()` after load when available, and settle the URL whether decode resolves or rejects. Use a worker-pool cursor rather than `Promise.all` over every URL. A single `finish()` guard must prevent timeout and final worker completion from resolving twice.

- [ ] **Step 4: Verify loader behavior**

Run: `npm test -- tests/preload-images.test.ts && npm run typecheck && npm run lint`

Expected: all loader tests pass, including failure and timeout cases.

- [ ] **Step 5: Commit the preload utility**

```bash
git add lib/animations/preloadImages.ts tests/preload-images.test.ts
git commit -m "feat: preload cinematic intro assets"
```

### Task 3: Add Testable Local Artwork and Presentational Scenes

**Files:**
- Create: `public/brand/logo-placeholder.svg`
- Create: `public/images/hero/flower-macro-placeholder.svg`
- Create: `public/images/hero/flower-macro-mobile-placeholder.svg`
- Create: `public/images/hero/petal-layer-1-placeholder.svg`
- Create: `public/images/hero/petal-layer-2-placeholder.svg`
- Create: `components/intro/AmbientParticles.tsx`
- Create: `components/intro/ScrollCue.tsx`
- Create: `components/intro/BrandMoment.tsx`
- Create: `components/intro/FlowerDive.tsx`
- Create: `components/intro/LightTransition.tsx`
- Create: `tests/intro-components.test.tsx`

**Interfaces:**
- Consumes: `introConfig`, `cn`, `useReducedMotion`, and Phase 0 typography/tokens.
- Produces: presentational scene markup with stable `data-intro-*` selectors; `AmbientParticlesProps { count: number }`; `FlowerDiveProps { mobile?: boolean; petalLayers: 1 | 2; showMiddleLayer: boolean }`.

- [ ] **Step 1: Write failing semantic scene tests**

Assert that:

- `BrandMoment` exposes the exact label, tagline, corner copy, scroll cue, and decorative image alt behavior.
- `FlowerDive` exposes the three poem lines in one accessible ordered quotation and renders one or two petal layers from props.
- the middle layer is absent when `showMiddleLayer={false}`.
- `LightTransition` is decorative and hidden from assistive technology.
- `AmbientParticles` renders exactly the requested deterministic count and no interactive descendants.

Example:

```tsx
render(<FlowerDive mobile={false} petalLayers={2} showMiddleLayer />);
expect(screen.getByText("Shaped stem by stem…")).toBeInTheDocument();
expect(screen.getAllByTestId("petal-layer")).toHaveLength(2);
expect(screen.getByTestId("flower-middle-layer")).toHaveAttribute("aria-hidden", "true");
```

- [ ] **Step 2: Run the component test and confirm RED**

Run: `npm test -- tests/intro-components.test.tsx`

Expected: FAIL because the scene components do not exist.

- [ ] **Step 3: Create original SVG fixtures**

Build the landscape and portrait flower fixtures from layered SVG paths, gradients, turbulence, and repeated chenille-stem strokes using only the approved blush, lilac, cream, forest, and gold palette. Keep an obvious central focal point at 50%/48%. The petal SVGs must have transparent canvases and sparse edge-biased shapes so their transforms read as foreground depth. The logo fixture contains a simple ornamental radial flower and outlined typographic lockup, clearly documented as temporary.

- [ ] **Step 4: Implement scene markup**

Use `next/image` for the logo, flower, and petal layers. The base flower is `priority`, `fill`, and uses:

```tsx
sizes="100vw"
placeholder="blur"
blurDataURL="data:image/svg+xml;base64,..."
```

Assign stable hooks including `data-intro-brand`, `data-intro-brand-copy`, `data-intro-logo`, `data-intro-frame`, `data-intro-flower-mask`, `data-intro-flower`, `data-intro-middle`, `data-intro-petal`, `data-intro-ring`, `data-intro-vignette`, `data-intro-poem-line`, and `data-intro-light`.

Particles use deterministic positions/durations from a fixed array, never `Math.random()` during render. `AmbientParticles` owns one IntersectionObserver that toggles a `data-paused` attribute; CSS pauses child animation from that attribute.

- [ ] **Step 5: Verify scenes and assets**

Run: `npm test -- tests/intro-components.test.tsx && npm run typecheck && npm run lint`

Expected: PASS with no missing-alt, hydration, or type warnings.

- [ ] **Step 6: Commit presentational scenes**

```bash
git add public/brand public/images/hero components/intro tests/intro-components.test.tsx
git commit -m "feat: add cinematic intro scenes"
```

### Task 4: Implement the Sequence Canvas Renderer

**Files:**
- Create: `components/intro/sequenceCanvas.ts`
- Create: `components/intro/FlowerSequence.tsx`
- Create: `tests/sequence-canvas.test.ts`
- Modify: `tests/intro-components.test.tsx`

**Interfaces:**
- Consumes: the sequence paths/load order from Task 1.
- Produces: `CoverRect`, `getCoverRect()`, `findNearestLoadedFrame()`, `FlowerSequenceHandle { setFrame(index: number): void; resize(): void }`, and `FlowerSequenceProps { frameUrls: readonly string[]; preloadResult?: PreloadResult; focalPoint: { x: number; y: number } }`.

- [ ] **Step 1: Write failing pure renderer tests**

```ts
expect(getCoverRect({ sourceWidth: 1920, sourceHeight: 1080, targetWidth: 375, targetHeight: 812, focalX: 0.5, focalY: 0.48 }))
  .toMatchObject({ drawHeight: 812 });

const frames = new Map([[0, image0], [10, image10]]);
expect(findNearestLoadedFrame(frames, 8)).toBe(image10);
expect(findNearestLoadedFrame(new Map(), 8)).toBeNull();
```

Also test focal clamping from 0 to 1 and deterministic lower-index preference for equal distance.

- [ ] **Step 2: Run and confirm RED**

Run: `npm test -- tests/sequence-canvas.test.ts`

Expected: FAIL because the pure helper module does not exist.

- [ ] **Step 3: Implement pure cover and fallback helpers**

`getCoverRect()` computes a cover scale, centered crop offsets influenced by the normalized focal point, and source-safe draw dimensions. `findNearestLoadedFrame()` returns an exact match first, then the minimum absolute index distance with the lower index winning ties.

- [ ] **Step 4: Implement the imperative canvas component**

Use `forwardRef` and `useImperativeHandle`. Cap backing-store DPR with `Math.min(window.devicePixelRatio || 1, 2)`. Coalesce resize and frame drawing with a single RAF. Load frame elements in the priority order from Task 1, retaining only successful images. Draw the nearest available frame using `getCoverRect()`. Cleanup cancels RAF and disconnects `ResizeObserver`/window listeners.

The canvas is `aria-hidden="true"`; include an adjacent visually hidden sentence describing the chenille flower dive. If no frame has loaded, render the configured poster beneath the transparent canvas.

- [ ] **Step 5: Add component cleanup tests**

Mock canvas context, `requestAnimationFrame`, and `ResizeObserver`. Assert DPR never exceeds 2, `setFrame()` snaps/clamps requested indices, and unmount cancels the pending RAF and observer.

- [ ] **Step 6: Verify renderer**

Run: `npm test -- tests/sequence-canvas.test.ts tests/intro-components.test.tsx && npm run typecheck && npm run lint`

Expected: PASS.

- [ ] **Step 7: Commit sequence support**

```bash
git add components/intro/FlowerSequence.tsx components/intro/sequenceCanvas.ts tests
git commit -m "feat: add flower sequence renderer"
```

### Task 5: Build Preloader and Skip Lifecycles

**Files:**
- Create: `components/intro/Preloader.tsx`
- Create: `components/intro/SkipIntro.tsx`
- Modify: `tests/intro-components.test.tsx`

**Interfaces:**
- Consumes: `preloadImages`, `introConfig.preload`, optional Lenis instance from `useLenis`, and a destination element.
- Produces: `PreloaderProps { urls: readonly string[]; lenis: Lenis | null; reducedMotion: boolean; onComplete(result: PreloadResult): void }` and `SkipIntroProps { destinationId: string; visible: boolean }`.

- [ ] **Step 1: Write failing lifecycle tests**

Use fake timers and mocked loader results. Assert:

- body/document native scroll lock is applied immediately, even when `lenis` is initially null;
- a Lenis instance that arrives after mount receives `stop()`;
- first visit cannot finish before 1800ms and repeat visit cannot finish before 800ms;
- a six-second watchdog finishes once when loading remains pending;
- completion writes `studio-viana:intro-seen`, unlocks native scroll, calls `lenis.start()`, and calls `onComplete` once;
- unmount clears timers, unlocks scroll, and restarts only the Lenis instance the component stopped;
- `SkipIntro` calls `lenis.scrollTo(destination, { duration: 1.6 })`, while missing Lenis uses `scrollIntoView({ behavior: "smooth" })` and reduced motion uses `behavior: "auto"`.

- [ ] **Step 2: Run and confirm RED**

Run: `npm test -- tests/intro-components.test.tsx`

Expected: FAIL because the lifecycle components do not exist.

- [ ] **Step 3: Implement preloader state machine**

`Preloader` starts at progress zero and renders three-digit text with `String(percent).padStart(3, "0")`. It calls the loader once per stable URL signature. Completion sets `phase="exiting"`, runs a scoped GSAP exit timeline for normal motion, and invokes the finalizer on timeline completion. Reduced motion finalizes without decorative motion after the timing condition.

Guard `sessionStorage` in `try/catch`. Preserve and restore the previous `document.documentElement.style.overflow` and body overflow values rather than assuming empty strings. Store timer IDs in refs and centralize completion through one idempotent callback.

- [ ] **Step 4: Implement accessible skip behavior**

Render a fixed `<button type="button">Skip intro</button>` only when `visible`. Read Lenis through `useLenis()` inside the component. Resolve the target at click time so restored/hydrated markup works. Disable the button after activation until the destination is reached or a short guard timer expires.

- [ ] **Step 5: Verify lifecycle behavior**

Run: `npm test -- tests/intro-components.test.tsx && npm run typecheck && npm run lint`

Expected: PASS with fake timers fully drained and no act warnings.

- [ ] **Step 6: Commit controls**

```bash
git add components/intro/Preloader.tsx components/intro/SkipIntro.tsx tests/intro-components.test.tsx
git commit -m "feat: add intro loading and skip controls"
```

### Task 6: Compose the Master Timeline

**Files:**
- Create: `components/intro/IntroSection.tsx`
- Create: `tests/intro-timeline.test.tsx`
- Modify: `components/animations/SplitTextReveal.tsx`
- Modify: `tests/animations.test.tsx`

**Interfaces:**
- Consumes: all intro scene components, `introConfig`, Phase 0 GSAP utilities, `useLenis`, `useReducedMotion`, and controlled split tokens in `#home`.
- Produces: `IntroSection` and `SplitTextRevealProps.controlled?: boolean`.

- [ ] **Step 1: Extend split text with a failing controlled-mode test**

```tsx
render(<SplitTextReveal controlled as="h1" type="lines">{"Where flowers become\nforever memories."}</SplitTextReveal>);
expect(mocks.fromTo).not.toHaveBeenCalled();
expect(container.querySelectorAll("[data-split-token]")).toHaveLength(2);
expect(container.querySelector("[data-controlled-split]")).toBeInTheDocument();
```

Keep reduced-motion tokens visibly in their final state.

- [ ] **Step 2: Implement controlled split mode and verify**

Skip the component-owned GSAP effect when `controlled` is true, add `data-controlled-split`, and preserve the same accessible unsplit heading.

Run: `npm test -- tests/animations.test.tsx`

Expected: PASS.

- [ ] **Step 3: Write failing master-timeline tests**

Mock `gsap.context`, `gsap.matchMedia`, `gsap.timeline`, and ScrollTrigger. Assert:

- reduced motion renders the static intro and never creates match media or a pinned timeline;
- normal motion creates one `matchMedia` owner and one timeline for the active branch;
- the ScrollTrigger receives `trigger: root`, `pin: true`, `scrub: 1.2`, `invalidateOnRefresh: true`, and an end derived from 400vh/300vh/220vh;
- timeline labels equal the normalized config values;
- sequence mode calls the imperative `setFrame()` from a snapped frame proxy without adding a second ScrollTrigger;
- cleanup reverts both media and context and clears `document.documentElement.dataset.introComplete`;
- restored `window.scrollY` is never overwritten and no `scrollTo(0, 0)` call occurs.

- [ ] **Step 4: Implement the normal-motion master timeline**

Create the timeline only after preload completion. Use `gsap.matchMedia().add()` branches for desktop, tablet, and mobile. Each branch calls one `buildTimeline(settings)` function.

The implementation must contain clear comments exactly labeling:

```ts
// Scene 1 · Brand moment · 0%–15%
// Scene 2 · Flower appears · 15%–35%
// Scene 3 · The dive · 35%–80%
// Scene 4 · Light transition · 80%–100%
```

Initialize all animated values with `.set()` calls before adding tweens. Use normalized positions and deliberate overlaps rather than chained default durations. Animate the controlled Home headline tokens at 92–100 while the light reaches cream. On ScrollTrigger enter/enterBack add `data-intro-active` and `will-change`; on leave/leaveBack clear them. On final leave set `data-intro-complete="true"` for Phase 2 nav integration.

- [ ] **Step 5: Implement layered and sequence branches inside the same timeline**

For layered mode, target the poster, middle copy, petals, ring, vignette, and mask. For sequence mode, tween a frame proxy across the Scene 2–3 range and call `sequenceRef.current?.setFrame(Math.round(proxy.frame))` from `onUpdate`. Both branches share brand, poem, skip, vignette, light, and Home-heading tweens.

- [ ] **Step 6: Verify master ownership and cleanup**

Run: `npm test -- tests/intro-timeline.test.tsx tests/animations.test.tsx && npm run typecheck && npm run lint`

Expected: PASS with one master ScrollTrigger and all teardown assertions satisfied.

- [ ] **Step 7: Commit orchestration**

```bash
git add components/intro/IntroSection.tsx components/animations/SplitTextReveal.tsx tests
git commit -m "feat: orchestrate cinematic intro timeline"
```

### Task 7: Replace the Showcase with the Intro-to-Home Flow

**Files:**
- Create: `components/sections/HomeHeroPlaceholder.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Create: `tests/home-page.test.tsx`

**Interfaces:**
- Consumes: `IntroSection`, controlled `SplitTextReveal`, `Container`, `Section`, `SectionLabel`, and `Heading`.
- Produces: the Phase 1 root-page flow and stable `#home` destination.

- [ ] **Step 1: Write the failing page composition test**

Mock heavy intro internals and assert the server page order:

```tsx
render(<Home />);
const main = screen.getByRole("main");
expect(within(main).getByTestId("intro-section")).toBeInTheDocument();
expect(within(main).getByRole("heading", { level: 1, name: "Where flowers become forever memories." })).toBeVisible();
expect(document.querySelector("#home")).toBeInTheDocument();
expect(screen.queryByText("Design System")).not.toBeInTheDocument();
```

- [ ] **Step 2: Run and confirm RED**

Run: `npm test -- tests/home-page.test.tsx`

Expected: FAIL because the Phase 0 specimen page is still present.

- [ ] **Step 3: Build the Home placeholder and page flow**

The Home hero begins on the exact cream surface used by the light transition, fills at least `100svh`, and has no top border, gap, shadow, or margin that can reveal a seam. It includes the controlled two-line headline, one Phase 2 label, and a restrained note that the complete Home composition follows in Phase 2. Add two neutral cream/cream-soft spacer sections with semantic test copy, not public marketing content, to provide post-intro scroll distance.

- [ ] **Step 4: Add intro styling**

Add focused CSS for:

- fixed preloader, inset hairline frame, progress line, and film grain;
- `100svh` scene layers with progressive `100dvh` support;
- stable clip/mask, full-bleed images, vignette, light bloom, and canvas;
- safe-area skip positioning;
- deterministic particle drift and paused state;
- active-only `will-change` via `[data-intro-active="true"]`;
- reduced-motion static flow and hidden decorative motion layers;
- 320px-safe corner labels and wrapping poem lines.

Do not add a global permanent `will-change` declaration.

- [ ] **Step 5: Verify page structure and full unit suite**

Run: `npm test -- tests/home-page.test.tsx && npm run test && npm run typecheck && npm run lint`

Expected: all tests pass and the Phase 0 showcase copy is absent from `/`.

- [ ] **Step 6: Commit the page transition**

```bash
git add app components/sections tests/home-page.test.tsx
git commit -m "feat: transition intro into home placeholder"
```

### Task 8: Document Assets, Modes, Generation Prompts, and Operations

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: final config names and asset paths.
- Produces: complete Phase 1 operator documentation.

- [ ] **Step 1: Replace the Phase 0-only README narrative**

Retain Phase 0 foundation notes and add:

- `npm install`, `npm run dev`, `npm run test`, `npm run test:browser`, and `npm run check`.
- a table for `INTRO_MODE`, focal point, scrub, preload durations, frame count, per-breakpoint pin lengths/scales/particles, and poem lines.
- one-line mode switch: change `INTRO_MODE` in `components/intro/intro.config.ts` from `"layers"` to `"sequence"`.
- the exact final asset paths, pixel sizes, formats, alpha requirements, color space, and target file weights from the spec.
- an explicit note that placeholder SVGs are temporary and the final production filenames are activated only after the user supplies them.

- [ ] **Step 2: Add the exact video-to-WebP command**

```bash
ffmpeg -i flower-dive.mp4 -vf "fps=30,scale=1920:-2:flags=lanczos" -c:v libwebp -quality 82 -compression_level 6 -start_number 1 public/sequence/flower_%04d.webp
```

Document that `frameCount` must match the generated file count and numbering starts at 0001.

- [ ] **Step 3: Add three ready-to-use image-generation prompts**

Prompt 1 creates a 16:9 ultra-detailed macro chenille flower with a precise visible center, blush/lilac/cream fibers, forest shadows, no text, no vase, and generous 4K crop safety.

Prompt 2 creates a transparent foreground petal layer with large out-of-focus chenille petals entering only from the edges, separated objects, alpha background, no complete flower, and a 3:2 2400×1600 composition.

Prompt 3 creates a second transparent depth layer with smaller lilac/cream petals and soft gold bokeh, a distinct arrangement from layer one, clean alpha edges, no full flower, and a 3:2 2400×1600 composition.

Write the complete prompts in the README, not summaries.

- [ ] **Step 4: Add the manual verification checklist**

Include desktop, tablet, 320px mobile, reduced motion, skip button, keyboard focus, scroll-up reversal, restored mid-page reload, first/repeat preload duration, both modes, missing-frame tolerance, and Chrome Performance recording with no long tasks attributable to scrub work.

- [ ] **Step 5: Verify documentation formatting and commit**

Run: `npm run format:check`

Expected: PASS.

```bash
git add README.md
git commit -m "docs: add cinematic intro operations guide"
```

### Task 9: Browser QA and Final Phase Gate

**Files:**
- Create: `tests/browser/intro.spec.ts`
- Modify: `tests/browser/showcase.spec.ts` (remove Phase 0 route assertions or replace the file entirely)
- Modify: `playwright.config.ts` only if production-like serving is needed for stable restoration tests.

**Interfaces:**
- Consumes: the completed Phase 1 root route.
- Produces: repeatable cross-viewport evidence and final completion status.

- [ ] **Step 1: Write the browser suite**

Cover these cases:

1. Desktop 1440×1000: wait for preloader removal, assert brand scene and images, verify Lenis class, sample intro styles at top/middle/end scroll positions, scroll backward, and confirm values reverse.
2. Tablet 900×1000: assert the medium pin-distance CSS/data contract and no overflow.
3. Mobile 320×760: assert portrait source, one petal layer, safe skip control, no clipped corner/poem text, and no horizontal overflow.
4. Skip: click the button and assert `#home` reaches the viewport and the control disables/hides.
5. Reduced motion: assert no pinned spacer, canvas, ambient animation, or Lenis smoothing; both the static brand/flower and Home headline are visible.
6. Reload restoration: scroll below the first scene, reload, and assert the page does not return to zero after preloader completion.
7. Runtime health: collect `console.error`, hydration messages, `pageerror`, broken images, and failed same-origin asset responses; expect empty arrays.

Use a sessionStorage preload marker in most tests to keep each case under one second while retaining one dedicated first-visit timing/progress test.

- [ ] **Step 2: Run browser tests and confirm failures expose any gaps**

Run: `npm run test:browser`

Expected before fixes: any choreography, selector, or responsive gaps fail with a specific assertion or screenshot trace.

- [ ] **Step 3: Fix only evidence-backed browser issues**

For each failure, identify whether the cause is lifecycle, layout, asset decode, or timeline state. Add or strengthen a unit test when the failure can recur without a browser, then make the smallest production change and rerun the affected test.

- [ ] **Step 4: Capture visual evidence**

Capture full-page screenshots at desktop and 320px mobile plus viewport screenshots at brand, circular reveal, deep dive, light bloom, and Home states. Inspect every image for seams, unreadable copy, mask edges, placeholder quality, and crop focal point.

- [ ] **Step 5: Run the complete automated gate**

Run:

```bash
npm run format
npm run check
npm run test:browser
git diff --check
git status --short
```

Expected: Prettier, ESLint, TypeScript, all Vitest tests, the production build, and all Playwright tests pass. Git reports only intentional final edits before the completion commit.

- [ ] **Step 6: Inspect active runtime performance**

Use Chrome performance tooling while scrubbing the desktop intro from 0% to 100% and back. Confirm no repeated layout reads in `onUpdate`, no React commit loop during scrub, no decoded-image work after preload completion, and no long task attributable to frame updates. Record that real 60fps validation must be repeated with the user's final 4K assets on target devices.

- [ ] **Step 7: Commit Phase 1**

```bash
git add .
git commit -m "feat: complete Studio Viana cinematic intro"
```

- [ ] **Step 8: Verify the committed branch is clean**

Run:

```bash
git status --short --branch
git log --oneline --decorate -12
```

Expected: `feature/phase-1` is clean and contains the Phase 0 base, approved Phase 1 design, implementation commits, and final completion commit. Do not push or merge unless separately requested.

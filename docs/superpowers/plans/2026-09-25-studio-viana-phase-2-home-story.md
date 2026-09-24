# Studio Viana Phase 2 Home Story Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Phase 2 navigation, Home hero, About story, What We Do section, and placeholder anchors as a seamless continuation of the Phase 1 cinematic intro.

**Architecture:** Keep `app/page.tsx` server-rendered and compose focused client islands for motion, navigation, and context state. `IntroProvider` bridges Phase 1 completion into one controlled hero entrance; `Navbar` reads Lenis direction, active ScrollTriggers, and section theme without coupling section internals. Static local images are imported so Next Image supplies dimensions and blur data automatically.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6, Tailwind CSS 3, GSAP/ScrollTrigger 3, Lenis 1, Framer Motion 13, Vitest/Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-25-studio-viana-phase-2-home-story-design.md`

## Global Constraints

- Reuse the Phase 0 design system and Phase 1 intro; do not rewrite either foundation.
- The intro and Home hero both use exact cream `#F7F0E6` with no transition seam.
- Visible copy, section order, interactions, assets, and responsive behavior follow the Phase 2 prompt and four saved visual references exactly.
- Animate only transform, opacity, and clip-path; pointer motion uses `gsap.quickTo`.
- Disable floating, parallax, scrubbed reveals, cursor follow, and clip expansion for reduced motion.
- Every image uses Next Image with stable sizing, descriptive alt text, responsive `sizes`, and blur placeholders; only Home hero images are priority.
- Use semantic landmarks, visible gold focus styles, a trapped mobile-menu focus cycle, Escape close, and at least 4.5:1 body-text contrast.
- Verify 360, 390, 768, 1024, 1440, and 1920px layouts without horizontal overflow.

## Review Focus

- A reload below the intro must never leave the hero or navbar hidden; `tests/intro-context.test.tsx` and Playwright reload coverage pin this behavior.
- Opening and closing the mobile menu must stop/restart Lenis and restore keyboard focus; `tests/navigation.test.tsx` exercises both paths.
- Sections that declare `data-theme="dark"` must switch nav foreground without depending on arbitrary scroll offsets; `tests/nav-hooks.test.tsx` covers section sampling.
- Touch and reduced-motion users must never receive mouse-follow or infinite motion; section component tests and a Playwright reduced-motion case assert static final styles.
- Every anchor must resolve to a unique semantic section and compensate for the fixed header; `tests/home-page.test.tsx` and Playwright navigation coverage verify the contract.

---

### Task 1: Intro completion context

**Files:**
- Create: `lib/context/IntroContext.tsx`
- Modify: `components/intro/IntroSection.tsx`
- Modify: `app/layout.tsx`
- Create: `tests/intro-context.test.tsx`
- Modify: `tests/intro-timeline.test.tsx`

**Interfaces:**
- Produces: `useIntro(): { introComplete: boolean; markIntroComplete(): void; markIntroActive(): void }`
- Consumes: existing `data-intro-complete`, ScrollTrigger callbacks, reload position, and reduced-motion state.

- [ ] **Step 1: Write failing provider tests**

```tsx
it("publishes completion through state, html data, and a custom event", async () => {
  const listener = vi.fn();
  window.addEventListener("studio-viana:intro-complete", listener);
  render(<IntroProvider><Probe /></IntroProvider>);
  await userEvent.click(screen.getByRole("button", { name: "complete" }));
  expect(screen.getByTestId("state")).toHaveTextContent("complete");
  expect(document.documentElement).toHaveAttribute("data-intro-complete", "true");
  expect(listener).toHaveBeenCalledOnce();
});

it("initializes complete when the restored scroll is below the intro", () => {
  Object.defineProperty(window, "scrollY", { configurable: true, value: 1200 });
  render(<IntroProvider><Probe /></IntroProvider>);
  expect(screen.getByTestId("state")).toHaveTextContent("complete");
});
```

- [ ] **Step 2: Run the focused tests and confirm RED**

Run: `npm test -- tests/intro-context.test.tsx tests/intro-timeline.test.tsx`

Expected: failure because `IntroContext` and the callback wiring do not exist.

- [ ] **Step 3: Implement the context and Phase 1 bridge**

```ts
export interface IntroContextValue {
  introComplete: boolean;
  markIntroComplete: () => void;
  markIntroActive: () => void;
}
```

Wrap `Navbar` and `children` inside `IntroProvider` beneath `SmoothScrollProvider`. Replace direct dataset writes in `IntroSection` callbacks with the context methods while preserving the existing HTML attribute for Phase 1 tests. Mark completion after the reduced-motion preload path and refresh ScrollTrigger after the pin releases.

- [ ] **Step 4: Run focused and full unit tests**

Run: `npm test -- tests/intro-context.test.tsx tests/intro-timeline.test.tsx`

Run: `npm test`

Expected: both commands pass with no warnings.

- [ ] **Step 5: Commit the context bridge**

```bash
git add app/layout.tsx components/intro/IntroSection.tsx lib/context/IntroContext.tsx tests/intro-context.test.tsx tests/intro-timeline.test.tsx
git commit -m "feat: bridge intro completion into phase two"
```

### Task 2: Navigation behavior and mobile focus management

**Files:**
- Create: `components/layout/Navbar.tsx`
- Create: `components/layout/MobileMenu.tsx`
- Create: `components/layout/useNavTheme.ts`
- Create: `components/layout/useScrollDirection.ts`
- Create: `components/decor/MandalaMark.tsx`
- Create: `tests/nav-hooks.test.tsx`
- Create: `tests/navigation.test.tsx`

**Interfaces:**
- Consumes: `useLenis`, `useIntro`, section IDs, `data-theme`, `site`, and `whatsappLink`.
- Produces: fixed semantic header, active section state, smooth navigation, responsive overlay, and focus trap.

- [ ] **Step 1: Write failing hook and interaction tests**

```tsx
it("hides after downward Lenis movement and shows on upward movement", () => {
  const { result } = renderHook(() => useScrollDirection(mockLenis));
  act(() => emitLenis({ scroll: 300, direction: 1 }));
  expect(result.current).toBe("down");
  act(() => emitLenis({ scroll: 220, direction: -1 }));
  expect(result.current).toBe("up");
});

it("traps focus, closes on Escape, and restores the trigger", async () => {
  render(<Navbar />);
  const trigger = screen.getByRole("button", { name: /open menu/i });
  await userEvent.click(trigger);
  expect(screen.getByRole("dialog", { name: /navigation/i })).toBeVisible();
  await userEvent.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
```

Also assert `aria-expanded`, numbered links, contact/Instagram content, Lenis stop/start calls, the WhatsApp URL, active underline state, and dark-theme foreground.

- [ ] **Step 2: Run tests and confirm RED**

Run: `npm test -- tests/nav-hooks.test.tsx tests/navigation.test.tsx`

Expected: failures for missing components and hooks.

- [ ] **Step 3: Implement focused navigation modules**

Use a custom 24px mandala SVG; do not reuse raster branding. `useScrollDirection` subscribes once to Lenis and ignores sub-2px noise. `useNavTheme` samples `document.elementsFromPoint(window.innerWidth / 2, 42)` on Lenis/scroll updates and returns `dark` only for the nearest section with that declaration. Navbar active links use scoped ScrollTriggers and revert them on cleanup.

MobileMenu stores the active element, derives the tabbable list, wraps Tab and Shift+Tab, listens for Escape, and guarantees Lenis restart in cleanup. Animate the overlay with one GSAP timeline and render final open/closed states for reduced motion.

- [ ] **Step 4: Verify navigation tests and suite**

Run: `npm test -- tests/nav-hooks.test.tsx tests/navigation.test.tsx`

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 5: Commit navigation**

```bash
git add components/layout components/decor/MandalaMark.tsx tests/nav-hooks.test.tsx tests/navigation.test.tsx
git commit -m "feat: add responsive editorial navigation"
```

### Task 3: Home hero and controlled entrance

**Files:**
- Create: `components/decor/PaperGrain.tsx`
- Create: `components/sections/home/HomeHero.tsx`
- Create: `components/sections/home/HeroCollage.tsx`
- Create: `components/sections/home/RotatingBadge.tsx`
- Modify: `components/animations/Float.tsx`
- Modify: `app/globals.css`
- Create: `tests/home-hero.test.tsx`
- Modify: `tests/animations.test.tsx`

**Interfaces:**
- Consumes: `useIntro`, `useLenis`, local static image imports, existing UI/animation primitives.
- Produces: `HomeHero`, a one-shot `data-hero-entered` state, a responsive collage, and off-screen-paused floating/badge loops.

- [ ] **Step 1: Write failing hero and Float tests**

```tsx
it("renders the locked hero copy and four descriptive product images", () => {
  render(<HomeHero />);
  expect(screen.getByRole("heading", { level: 1, name: /where flowers become forever memories/i })).toBeVisible();
  expect(screen.getAllByRole("img")).toHaveLength(4);
  expect(screen.getByRole("link", { name: /explore collection/i })).toHaveAttribute("href", "#collection");
});

it("starts the controlled entrance once after intro completion", () => {
  renderWithIntro(<HomeHero />, { introComplete: true });
  expect(screen.getByTestId("home-hero")).toHaveAttribute("data-hero-entered", "true");
});
```

Test reduced motion, mobile collage count, badge accessible hiding, priority/blur intent, and Float pause/resume when IntersectionObserver changes.

- [ ] **Step 2: Run hero tests and confirm RED**

Run: `npm test -- tests/home-hero.test.tsx tests/animations.test.tsx`

Expected: missing Home components and Float visibility controls.

- [ ] **Step 3: Implement the hero slice**

Use static imports from `public/images/products`. Build the entrance timeline in `HomeHero` with labelled phases and comments: label `0`, headline `0.12`, divider/body `0.55`, images `0.72`, badge `1.45`, nav event `1.7`. Set final content before returning from reduced-motion/reload paths.

Enhance `Float` with `duration`, `delay`, and `enabled` props. Create its loop paused, use IntersectionObserver to play only while visible, and use `gsap.quickTo` x/y setters for fine-pointer mouse parallax. HeroCollage creates separate ScrollTriggers for -10/-18/-28/-40 yPercent and scopes them through `gsap.matchMedia()`.

- [ ] **Step 4: Compare the first viewport to both concepts**

Run: `npm run dev`

Capture 1440×1000 and 390×844 screenshots with Playwright. Inspect the saved Home desktop and mobile concepts plus both renders with `view_image`; fix hierarchy, copy, type scale, spacing, crop, frame offsets, overlap, glow, and mobile overflow before continuing.

- [ ] **Step 5: Run tests and commit the hero**

Run: `npm test -- tests/home-hero.test.tsx tests/animations.test.tsx`

Run: `npm test`

```bash
git add app/globals.css components/animations/Float.tsx components/decor/PaperGrain.tsx components/sections/home/HomeHero.tsx components/sections/home/HeroCollage.tsx components/sections/home/RotatingBadge.tsx tests/home-hero.test.tsx tests/animations.test.tsx
git commit -m "feat: build the phase two home hero"
```

### Task 4: About story, scrubbed copy, and values

**Files:**
- Create: `components/decor/MagnoliaLineArt.tsx`
- Create: `components/sections/home/AboutStudio.tsx`
- Create: `components/sections/home/WordScrubText.tsx`
- Create: `components/sections/home/ValuesStrip.tsx`
- Modify: `components/animations/ImageReveal.tsx`
- Create: `tests/about-studio.test.tsx`

**Interfaces:**
- Consumes: `ImageReveal`, `ParallaxImage`, `Reveal`, `SplitTextReveal`, and `lilac-pearl-dome.jpg`.
- Produces: labelled `#about`, accessible scrub text, SVG draw animation, and values count/fade behavior.

- [ ] **Step 1: Write failing About tests**

```tsx
it("keeps paragraph semantics while decorative words remain hidden", () => {
  render(<WordScrubText>Every gift should tell a story.</WordScrubText>);
  expect(screen.getByText("Every gift should tell a story.")).toBeVisible();
  expect(document.querySelectorAll("[data-scrub-word]")).toHaveLength(6);
  expect(document.querySelector("[data-scrub-copy]")).toHaveAttribute("aria-hidden", "true");
});

it("renders the founder signature and all four values", () => {
  render(<AboutStudio />);
  expect(screen.getByText("Dr. Sadhana")).toBeVisible();
  expect(screen.getByText("100%")).toBeVisible();
  expect(screen.getByText("Blooms that never fade")).toBeVisible();
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `npm test -- tests/about-studio.test.tsx`

Expected: missing About modules.

- [ ] **Step 3: Implement About modules**

Add a `direction` prop to ImageReveal so the image panel can reveal top-to-bottom while preserving the original default. WordScrubText uses one screen-reader paragraph and visual `aria-hidden` spans; animate opacity only. MagnoliaLineArt calculates path lengths, sets dash arrays, and draws once from `top 82%`. ValuesStrip uses a numeric proxy for 100 and text fade for the other labels.

- [ ] **Step 4: Compare the section to the About concept**

Capture the `#about` viewport at 1440px and a 390px stacked render. Inspect concept and render with `view_image`; fix split ratio, crop, heading wraps, paragraph measure, line-art scale, signature, and values rhythm.

- [ ] **Step 5: Verify and commit About**

Run: `npm test -- tests/about-studio.test.tsx`

Run: `npm test`

```bash
git add components/animations/ImageReveal.tsx components/decor/MagnoliaLineArt.tsx components/sections/home/AboutStudio.tsx components/sections/home/WordScrubText.tsx components/sections/home/ValuesStrip.tsx tests/about-studio.test.tsx
git commit -m "feat: add the Studio Viana about story"
```

### Task 5: Craft image band, services, cursor previews, and marquee

**Files:**
- Create: `components/sections/home/WhatWeDo.tsx`
- Create: `components/sections/home/ExpandingImageBand.tsx`
- Create: `components/sections/home/ServiceColumn.tsx`
- Create: `components/sections/home/CursorImageFollow.tsx`
- Modify: `components/animations/Marquee.tsx`
- Modify: `lib/data/products.ts`
- Create: `tests/what-we-do.test.tsx`
- Modify: `tests/animations.test.tsx`

**Interfaces:**
- Consumes: `services`, five local image imports, existing labels/headings/dividers, and reduced-motion state.
- Produces: `#craft`, an expanding full-bleed band, responsive service grid, fine-pointer previews, and a dark-theme marquee.

- [ ] **Step 1: Write failing craft tests**

```tsx
it("renders four numbered services from canonical data", () => {
  render(<WhatWeDo />);
  expect(screen.getAllByRole("article")).toHaveLength(4);
  expect(screen.getByRole("heading", { name: "Corporate Events" })).toBeVisible();
  expect(screen.getAllByRole("link", { name: /discover/i })).toSatisfy((links) => links.every((link) => link.getAttribute("href") === "#collection"));
});

it("marks only the marquee band as a dark navigation theme", () => {
  render(<WhatWeDo />);
  expect(screen.getByTestId("craft-marquee")).toHaveAttribute("data-theme", "dark");
});
```

Assert the exact band headline, updated Hampers copy, static reduced-motion expansion, preview visibility lifecycle, and Marquee IntersectionObserver pause/resume.

- [ ] **Step 2: Run and confirm RED**

Run: `npm test -- tests/what-we-do.test.tsx tests/animations.test.tsx`

Expected: missing craft components and marquee pausing.

- [ ] **Step 3: Implement the craft slice**

ExpandingImageBand uses one scrubbed timeline from `inset(10% 12% round 4px)`/scale 1.2 to full bleed/scale 1, with the heading entering over the final 30%. ServiceColumn uses semantic `article`, a count-up number, a divider ref, and a Discover anchor. CursorImageFollow is `aria-hidden`, uses `gsap.quickTo`, and mounts only for `(hover: hover) and (pointer: fine)`.

Marquee owns one infinite timeline, pauses it via IntersectionObserver, and modifies direction/timeScale from ScrollTrigger velocity. Do not reconstruct the loop in `onUpdate`.

- [ ] **Step 4: Compare the section to the craft concept**

Capture the expanded band, service row, and marquee at 1440px plus the mobile stack at 390px. Inspect the craft concept and render with `view_image`; fix band crop, overlay contrast, service spacing/type, preview scale, and marquee cadence.

- [ ] **Step 5: Verify and commit craft**

Run: `npm test -- tests/what-we-do.test.tsx tests/animations.test.tsx`

Run: `npm test`

```bash
git add components/animations/Marquee.tsx components/sections/home/CursorImageFollow.tsx components/sections/home/ExpandingImageBand.tsx components/sections/home/ServiceColumn.tsx components/sections/home/WhatWeDo.tsx lib/data/products.ts tests/what-we-do.test.tsx tests/animations.test.tsx
git commit -m "feat: build the what we do story"
```

### Task 6: Compose the full Phase 2 page

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Delete: `components/sections/HomeHeroPlaceholder.tsx`
- Modify: `tests/home-page.test.tsx`
- Modify: `tests/data.test.ts`

**Interfaces:**
- Consumes: `Navbar`, `HomeHero`, `AboutStudio`, `WhatWeDo`, and existing section primitives.
- Produces: final semantic page order and working `collection`, `pricing`, and `contact` anchor shells.

- [ ] **Step 1: Replace the Phase 1 composition assertions with failing Phase 2 assertions**

```tsx
it("composes intro, home, about, craft, collection, pricing, and contact in order", () => {
  render(<Home />);
  const ids = [...document.querySelectorAll("main > section[id]")].map((node) => node.id);
  expect(ids).toEqual(["home", "about", "craft", "collection", "pricing", "contact"]);
  expect(screen.queryByText("Phase 2 begins here")).not.toBeInTheDocument();
});
```

Also assert one H1, all navigation targets, semantic labels, exact Home copy, and absence of placeholder transition copy.

- [ ] **Step 2: Run and confirm RED**

Run: `npm test -- tests/home-page.test.tsx tests/data.test.ts`

Expected: old placeholder and transition sections fail the new contract.

- [ ] **Step 3: Compose sections and global finishing styles**

Replace the placeholder and transition surfaces. Add three quiet, labelled shells without fabricated product content. Keep the navbar outside `main` through the root layout. Add only shared Phase 2 CSS needed for grain, scrollbar-offset anchors, mobile menu viewport safety, and reduced-motion final states.

- [ ] **Step 4: Run the complete static gate**

Run: `npm run format`

Run: `npm run lint`

Run: `npm run typecheck`

Run: `npm test`

Run: `npm run build`

Expected: every command exits 0 without warnings or hydration diagnostics.

- [ ] **Step 5: Commit page composition**

```bash
git add app/page.tsx app/layout.tsx app/globals.css components/sections/HomeHeroPlaceholder.tsx tests/home-page.test.tsx tests/data.test.ts
git commit -m "feat: compose the complete phase two homepage"
```

### Task 7: Browser interaction, responsive, and performance verification

**Files:**
- Create: `tests/browser/phase-two.spec.ts`
- Modify: `playwright.config.ts` only if a device project is required

**Interfaces:**
- Consumes: the built application.
- Produces: automated proof for navigation, accessibility-critical interactions, all breakpoints, intro hand-off, reduced motion, and runtime health.

- [ ] **Step 1: Write failing Playwright coverage**

```ts
test("intro hand-off reveals hero and navigation without a cream seam", async ({ page }) => {
  await markIntroSeen(page);
  await page.goto("/");
  await page.locator("#home").scrollIntoViewIfNeeded();
  await expect(page.locator("html")).toHaveAttribute("data-intro-complete", "true");
  await expect(page.getByRole("navigation", { name: /primary/i })).toBeVisible();
  await expect(page.locator("#home")).toHaveCSS("background-color", "rgb(247, 240, 230)");
});
```

Add tests for skip, post-intro reload, navbar hide/show, active underline, dark marquee theme, all five nav links, mobile menu keyboard cycle/Escape, cursor service preview, reduced motion, no missing images, runtime console errors, and horizontal overflow at 360/390/768/1024/1440/1920.

- [ ] **Step 2: Run the new browser suite and confirm failures**

Run: `npx playwright test tests/browser/phase-two.spec.ts`

Expected: any remaining integration drift is exposed before final tuning.

- [ ] **Step 3: Fix each observed integration issue with a regression assertion**

For every issue, keep the failing assertion, make the smallest component/style correction, and rerun the single named Playwright test until green. Do not weaken viewport, timing, or visibility assertions to hide a defect.

- [ ] **Step 4: Run production browser and performance gates**

Run: `npm run build`

Run: `PLAYWRIGHT_PRODUCTION=true npx playwright test tests/browser/intro.spec.ts tests/browser/phase-two.spec.ts`

Run a Chrome DevTools trace across the Home/About/Craft scroll and assert no main-thread task at or above 50ms. Record accessibility snapshot issues, failed images, CLS, and overflow; fix all reproducible failures.

- [ ] **Step 5: Commit browser verification**

```bash
git add tests/browser/phase-two.spec.ts playwright.config.ts
git commit -m "test: verify phase two interactions and layouts"
```

### Task 8: Fidelity ledger and final evidence

**Files:**
- Create: `docs/superpowers/phase-2-fidelity-ledger.md`
- Create: `docs/phase-2-home-story.md`
- Modify: `README.md` only for the Phase 2 verification command and asset note

**Interfaces:**
- Consumes: four approved concepts, final browser screenshots, test/build output, and asset inventory.
- Produces: auditable fidelity evidence, tweakable motion values, image list, and operating checklist.

- [ ] **Step 1: Capture final screenshots**

Capture 1440×1000 Home, 390×844 Home, 1440px About, 1440px Craft, and full-page renders at 360/768/1024/1920. Keep final evidence under `/tmp` and remove intermediate screenshots.

- [ ] **Step 2: Inspect concept and render pairs with `view_image`**

For each pair, record at least five concrete checks spanning copy, composition, typography, palette, asset treatment, spacing, responsiveness, and motion. Fix every agency-review-level mismatch and recapture.

- [ ] **Step 3: Write the fidelity ledger and Phase 2 operations guide**

Document concept evidence, render evidence, changes made, the exact six-image inventory, tweakable values, and the checklist for intro hand-off, Skip, reload, nav, mobile menu, dark theme, cursor preview, reduced motion, breakpoints, Lighthouse-style checks, and performance trace.

- [ ] **Step 4: Run the fresh completion gate**

Run: `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build`

Run: `npx playwright test tests/browser/intro.spec.ts tests/browser/phase-two.spec.ts`

Expected: zero formatting, lint, type, unit, build, browser, image, console, hydration, or overflow failures.

- [ ] **Step 5: Review the requirement matrix and commit completion**

Check every section of the design spec against implementation and evidence. Confirm the exact allowed above-the-fold copy has no additions or omissions. Then commit:

```bash
git add README.md docs/superpowers/phase-2-fidelity-ledger.md docs/phase-2-home-story.md
git commit -m "docs: complete phase two delivery guide"
```


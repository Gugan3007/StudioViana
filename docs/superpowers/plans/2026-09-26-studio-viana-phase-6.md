# Studio Viana Phase 6 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify and production-harden Studio Viana's interactions, overlays, routes, performance, accessibility, and search/social surface without redesigning the approved site.

**Architecture:** A root motion/device context supplies reduced-motion and low-power decisions to shared cursor, magnetic, atmosphere, and scrolling systems. A single overlay stack coordinates every modal surface, while server-rendered product/legal routes and shared SEO builders provide crawlable deep links; verification remains evidence-scoped and runs against the optimized production build.

**Tech Stack:** Next.js 16.3 App Router, React 19, TypeScript, Tailwind CSS, GSAP/ScrollTrigger/Flip, Lenis, Framer Motion, Vitest/Testing Library, Playwright, Sharp, Lighthouse, `@next/bundle-analyzer`.

**Spec:** `docs/superpowers/specs/2026-09-26-studio-viana-phase-6-design.md`

## Global Constraints

- Preserve the approved Phase 0–5 layouts, copy, palette, typography, image crops, section order, and interaction outcomes.
- Custom cursor and magnetic movement run only on `(hover: hover) and (pointer: fine)` with full motion.
- Every animated feature has a reduced-motion fallback and nonessential loops stop off-screen.
- One h1 per route; document language `en-IN`; every interactive target is keyboard reachable and at least 44×44 CSS pixels where applicable.
- Sound is off by default and the toggle is absent when `public/audio/ambient.mp3` does not exist.
- No performance, Lighthouse, cross-browser, or assistive-technology claim may be made without recorded evidence.
- Product content and prices remain server-rendered from `lib/data/products.ts`.

## Review Focus

- Browser restores a deep scroll position below Pricing: deferred sections hydrate from any visible shell and saved order state remains available.
- Two overlays transition in sequence: only the top overlay handles Escape and focus returns to the correct originating control.
- OS reduced motion and a stored user override disagree: the explicit stored value wins and all decorative motion follows the effective value.
- Fine pointer changes or low-power signals change after hydration: the site keeps native input behavior and never leaves the document cursor hidden.
- Internal route clicks with hashes, modifier keys, download attributes, external origins, or browser back/forward retain their expected native semantics.

---

### Task 1: Motion, device and accessibility foundations

**Files:**

- Create: `lib/context/MotionContext.tsx`
- Create: `lib/utils/device.ts`
- Create: `components/a11y/SkipLink.tsx`
- Create: `components/a11y/MotionPreferenceToggle.tsx`
- Modify: `lib/animations/useReducedMotion.ts`
- Modify: `lib/animations/tokens.ts`
- Modify: `components/providers/SmoothScrollProvider.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Test: `tests/phase-six-foundations.test.tsx`

**Interfaces:**

- Produces: `MotionProvider`, `useMotionPreferences(): { lowPower: boolean; preference: "full" | "reduce" | "system"; setPreference(value): void; shouldReduceMotion: boolean }`, `isLowPowerDevice(navigatorLike): boolean`, and the existing `useReducedMotion(): boolean` contract.
- Consumes: existing Lenis and intro providers.

- [ ] Write tests that fail because low-power classification, stored motion override, branded skip target, and `en-IN` layout integration do not exist.

```tsx
expect(isLowPowerDevice({ hardwareConcurrency: 4 })).toBe(true);
localStorage.setItem("studio-viana:motion", "full");
render(
  <MotionProvider>
    <MotionProbe />
  </MotionProvider>,
);
expect(screen.getByTestId("motion-probe")).toHaveTextContent("full:false");
render(<SkipLink />);
expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute(
  "href",
  "#main-content",
);
```

- [ ] Run `npm test -- tests/phase-six-foundations.test.tsx` and confirm missing exports/elements cause the failures.
- [ ] Implement the context, device helpers, skip link, footer-ready toggle, token extensions, provider order, and CSS data-attribute fallbacks.
- [ ] Re-run the focused test and `npm test`; expect all tests to pass.
- [ ] Commit `feat: add phase six motion foundations`.

### Task 2: Cursor, magnetic controls and micro-interaction primitives

**Files:**

- Create: `components/cursor/CustomCursor.tsx`
- Create: `components/cursor/useCursor.ts`
- Create: `components/interaction/Magnetic.tsx`
- Create: `components/interaction/RollText.tsx`
- Create: `components/interaction/ArrowLink.tsx`
- Modify: `lib/store/cursorStore.ts`
- Modify: `components/ui/Button.tsx`
- Modify: `components/layout/Navbar.tsx`
- Modify: `components/layout/FloatingWhatsApp.tsx`
- Modify: `components/layout/BackToTop.tsx`
- Modify: collection, gallery, Instagram, pricing, form and copy controls touched by the cursor/micro-interaction audit.
- Test: `tests/phase-six-interactions.test.tsx`

**Interfaces:**

- Consumes: `useMotionPreferences`, motion tokens, semantic `data-cursor` values.
- Produces: cursor states `default | view | drag | zoom | link | text | hidden`, `Magnetic`, `RollText`, and `ArrowLink`.

- [ ] Write failing interaction tests for semantic state inference, fine-pointer/reduced-motion gating, accessible duplicate text, magnetic reset, and preserved button names.

```tsx
expect(resolveCursorState(document.createElement("input"))).toBe("text");
render(<Button magnetic>Order now</Button>);
expect(screen.getByRole("button", { name: "Order now" })).toHaveAttribute(
  "data-cursor",
  "link",
);
expect(screen.getAllByText("Order now")).toHaveLength(2);
expect(screen.getAllByText("Order now")[1]).toHaveAttribute(
  "aria-hidden",
  "true",
);
```

- [ ] Run `npm test -- tests/phase-six-interactions.test.tsx` and confirm failures are caused by missing behavior.
- [ ] Implement delegated cursor state, GSAP quick setters and velocity stretch; add shared magnetic/roll/arrow components and adopt them through shared controls.
- [ ] Add CSS for native-cursor safety, focus-visible, fill/roll/underline/select/check/badge behaviors without changing layout.
- [ ] Run focused tests and the full unit suite; expect zero failures.
- [ ] Commit `feat: unify cursor and micro interactions`.

### Task 3: Global overlay manager and transition language

**Files:**

- Create: `components/overlay/OverlayManager.tsx`
- Modify: `lib/context/OverlayContext.tsx`
- Modify: `components/product/ProductDetail.tsx`
- Modify: `components/sections/gallery/Lightbox.tsx`
- Modify: `components/layout/OrderBagDrawer.tsx`
- Modify: `components/layout/MobileMenu.tsx`
- Modify: `components/layout/Navbar.tsx`
- Modify: `components/layout/GlobalOrderTouchpoints.tsx`
- Test: `tests/phase-six-overlays.test.tsx`
- Test: affected product/lightbox/bag/navigation regression files.

**Interfaces:**

- Produces: `useManagedOverlay({ id, open, onClose, rootRef, initialFocusRef, returnFocusRef })`, ordered `overlayStack`, and existing `overlayOpen` compatibility.
- Consumes: Lenis context, cursor store, motion preferences, current overlay DOM.

- [ ] Write failing tests proving top-most Escape ownership, single scroll lock, focus containment, focus restoration, and cursor reset.

```tsx
render(<OverlayHarness />);
await user.click(screen.getByRole("button", { name: "Open first" }));
await user.click(screen.getByRole("button", { name: "Open second" }));
await user.keyboard("{Escape}");
expect(
  screen.queryByRole("dialog", { name: "Second" }),
).not.toBeInTheDocument();
expect(screen.getByRole("dialog", { name: "First" })).toBeVisible();
expect(document.documentElement).toHaveStyle({ overflow: "hidden" });
```

- [ ] Run the overlay test and confirm failures identify duplicated legacy ownership.
- [ ] Implement the provider stack and hook, then remove local Escape/trap/lock/event duplication from all four overlays.
- [ ] Unify backdrop/panel/content entrance and faster exit through shared token values while keeping reduced motion instantaneous.
- [ ] Run focused overlay regressions and the full unit suite.
- [ ] Commit `refactor: centralize overlay behavior`.

### Task 4: Atmosphere, progress, theme color and optional sound

**Files:**

- Create: `components/atmosphere/FilmGrain.tsx`
- Create: `components/atmosphere/ScrollProgress.tsx`
- Create: `components/atmosphere/DynamicThemeColor.tsx`
- Create: `components/atmosphere/SoundToggle.tsx`
- Create: `components/atmosphere/AmbientAudio.tsx`
- Create: `components/atmosphere/Atmosphere.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `components/layout/Navbar.tsx`
- Test: `tests/phase-six-atmosphere.test.tsx`

**Interfaces:**

- Consumes: intro completion, overlay state, motion/low-power preferences, `data-theme` sections.
- Produces: one global atmosphere layer and audio controls rendered only when the server confirms an audio file.

- [ ] Write failing tests for progress visibility, active theme-color updates, reduced/low-power grain disabling, remembered sound opt-in, visibility pause, and no toggle without audio.

```tsx
render(<Atmosphere audioAvailable={false} />);
expect(
  screen.queryByRole("button", { name: /sound/i }),
).not.toBeInTheDocument();
expect(screen.getByTestId("scroll-progress")).toHaveAttribute(
  "aria-hidden",
  "true",
);
act(() => intersect(document.querySelector('[data-theme="dark"]')!, true));
expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute(
  "content",
  "#1F3326",
);
```

- [ ] Run the focused tests and verify the missing components fail.
- [ ] Implement observed texture layers, progress sampling, meta updates, and a non-autoplay HTML audio controller with a 0.25 ceiling.
- [ ] Integrate without changing navbar width when audio is absent.
- [ ] Run focused and complete unit tests.
- [ ] Commit `feat: add restrained site atmosphere`.

### Task 5: Product/legal routes, transitions and SEO surface

**Files:**

- Create: `components/transitions/CurtainWipe.tsx`
- Create: `components/transitions/RouteTransition.tsx`
- Create: `app/template.tsx`
- Create: `app/collection/[slug]/page.tsx`
- Create: `app/collection/[slug]/opengraph-image.tsx`
- Create: `app/privacy/page.tsx`
- Create: `app/terms/page.tsx`
- Create: `app/not-found.tsx`
- Create: `app/opengraph-image.tsx`
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`
- Create: `app/manifest.ts`
- Create: `app/icon.svg`
- Create: `app/icon.tsx`
- Create: `app/apple-icon.tsx`
- Create: `components/analytics/AnalyticsHooks.tsx`
- Create: `lib/seo/metadata.ts`
- Modify: `lib/seo/schema.ts`
- Modify: `app/layout.tsx`
- Modify: `components/layout/Footer.tsx`
- Test: `tests/phase-six-seo-routes.test.tsx`

**Interfaces:**

- Produces: `createPageMetadata`, `createProductStructuredData`, `SITE_URL`, static product params, route transition interception, sitemap/robots/manifest handlers.
- Consumes: catalogue product data, site data, existing Button/order entry behavior.

- [ ] Write failing tests with literal canonical URLs, sitemap route count, manifest colors/icons, product page text, not-found copy, JSON-LD Product/BreadcrumbList, and route interception exclusions.

```tsx
expect(
  createPageMetadata({ title: "Privacy", path: "/privacy" }).alternates
    ?.canonical,
).toBe("https://studioviana.com/privacy");
expect(sitemap()).toHaveLength(11);
expect(manifest()).toMatchObject({
  theme_color: "#1F3326",
  background_color: "#F7F0E6",
});
const markup = renderToStaticMarkup(
  await ProductPage({ params: Promise.resolve({ slug: "grand-bouquet" }) }),
);
expect(markup).toContain("The Grand Bouquet");
expect(markup).toContain('"@type":"BreadcrumbList"');
```

- [ ] Run the focused test and confirm missing modules/routes fail.
- [ ] Implement metadata builders and static/crawlable routes following the local Next 16 metadata and template documentation.
- [ ] Implement generated OG routes, icons, sitemap, robots, manifest, draft legal links, analytics placeholder, and curtain transition.
- [ ] Run focused tests, complete units, typecheck, and production build.
- [ ] Commit `feat: add crawlable routes and social metadata`.

### Task 6: Image, bundle and runtime performance tooling

**Files:**

- Create: `scripts/optimize-images.mjs`
- Create: `scripts/analyze-build.mjs`
- Modify: `package.json`
- Modify: `next.config.mjs`
- Modify: `components/intro/intro.config.ts`
- Modify: `components/intro/IntroSection.tsx`
- Modify: `components/intro/FlowerSequence.tsx`
- Modify: looping animation components identified by the audit.
- Test: `tests/phase-six-performance.test.ts`

**Interfaces:**

- Produces: deterministic image-plan helpers, CLI flags `--input`, `--output`, `--dry-run`, `--overwrite`, bundle-analysis script, device-aware intro settings, and cache headers.
- Consumes: Sharp, bundle analyzer, motion/low-power context.

- [ ] Write failing tests for image width capping, derivative naming, non-destructive default behavior, cache policies, progressive frame order, DPR caps, and low-power intro settings.

```ts
expect(planResponsiveWidths(3200, [480, 768, 1280, 1920, 2560])).toEqual([
  480, 768, 1280, 1920, 2560,
]);
expect(planResponsiveWidths(900, [480, 768, 1280])).toEqual([480, 768, 900]);
expect(derivativeName("gallery-01.jpg", 768, "avif")).toBe(
  "gallery-01-768.avif",
);
expect(
  getCanvasDpr({ devicePixelRatio: 3, mobile: true, lowPower: false }),
).toBe(1.5);
expect(
  getCanvasDpr({ devicePixelRatio: 3, mobile: false, lowPower: false }),
).toBe(2);
```

- [ ] Run the focused test and observe the missing script/config behavior.
- [ ] Add exact development dependencies and scripts, implement Sharp optimization and analyzer configuration, then update intro/loop behavior.
- [ ] Run the optimizer in dry-run mode over `public/images`, run bundle analysis, and record before/after build sizes.
- [ ] Run focused tests, full units, lint, typecheck, and production build.
- [ ] Commit `perf: harden media and animation runtime`.

### Task 7: Whole-site accessibility and motion audit

**Files:**

- Modify: relevant Phase 1–5 components with missing labels, autocomplete, target sizes, cursor semantics, motion tokens, off-screen pausing, or cleanup.
- Modify: `components/layout/Footer.tsx`
- Modify: `README.md`
- Create: `docs/phase-6-final-polish.md`
- Test: `tests/phase-six-accessibility.test.tsx`
- Test: existing affected suites.

**Interfaces:**

- Consumes: shared motion, interaction, overlay and atmosphere primitives.
- Produces: footer preference control, documented motion system, accessibility checklist, SEO checklist, owner dependency list, and maintainer guide.

- [ ] Write failing tests for footer motion control, form autocomplete/live errors, landmark/heading integrity, touch target contracts, decorative semantics, and shared token use at behavior boundaries.

```tsx
render(<Footer />);
expect(screen.getByRole("button", { name: /reduce motion/i })).toBeVisible();
expect(screen.getByLabelText("Email for Stay in bloom")).toHaveAttribute(
  "autoComplete",
  "email",
);
render(<Home />);
expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
```

- [ ] Run the test and verify each failure maps to an actual audit issue.
- [ ] Fix the audited components without altering approved visible copy or layout; document intentional cinematic and scrub exceptions.
- [ ] Update README with structure, content maintenance, `ORDER_MODE`, `INTRO_MODE`, image optimization, bundle analysis, and final motion values.
- [ ] Run focused and complete unit suites.
- [ ] Commit `fix: complete accessibility and motion audit`.

### Task 8: Production browser QA, Lighthouse and final report

**Files:**

- Create: `tests/browser/phase-six.spec.ts`
- Create: `docs/superpowers/phase-6-fidelity-ledger.md`
- Modify: `docs/phase-6-final-polish.md`
- Modify: `playwright.config.ts` only if evidence-backed projects/settings are needed.

**Interfaces:**

- Consumes: the complete Phase 6 implementation and all existing browser suites.
- Produces: screenshots, measured performance table, accessibility/SEO checklists, browser/device/scenario QA matrix, and release evidence.

- [ ] Write browser tests for cursor/magnetic gating, skip link, motion override, overlay stack, product deep link, route transition/back-forward, metadata endpoints, responsive widths through 2560, 200% zoom, no-JavaScript content, and runtime errors.

```ts
test("deep product route is crawlable and returns through the curtain", async ({
  page,
}) => {
  await page.goto("/collection/grand-bouquet");
  await expect(
    page.getByRole("heading", { level: 1, name: "The Grand Bouquet" }),
  ).toBeVisible();
  await expect(
    page.locator('script[type="application/ld+json"]'),
  ).toContainText("BreadcrumbList");
  await page.getByRole("link", { name: "Back to collection" }).click();
  await expect(page).toHaveURL(/\/#collection$/);
  await expect(page.locator("[data-route-curtain]")).toHaveAttribute(
    "data-transition-state",
    "idle",
  );
});
```

- [ ] Run the new spec before final fixes and record every failure as a concrete QA issue.
- [ ] Fix each issue through a focused failing unit/browser regression test, then re-run the affected test.
- [ ] Capture desktop/mobile final renders and inspect them against accepted Phase 0–5 references with `view_image`; write at least five concrete comparisons.
- [ ] Run Lighthouse mobile/desktop against the production server, bundle/image reports, `npm run check`, and the complete production Playwright suite. Record exact scores/counts and do not claim unavailable browsers.
- [ ] Complete the QA matrix, performance table, accessibility/SEO checklists, owner dependency list, and final fidelity ruling.
- [ ] Commit `test: verify phase six release quality`.

# Studio Viana Phase 4 Craft & Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the complete Phase 4 craft story, process timeline, filterable gallery/lightbox, testimonials, Instagram rail and velocity marquee after the existing Phase 3 collection.

**Architecture:** Seven independently testable slices extend the existing typed-data and section-component conventions. Static data and resilient markup stay lightweight; GSAP owns scroll animation, Framer Motion owns shared media transitions, one shared scroll-lock service owns modal state, and the lightbox is the only new dynamic chunk.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 3, GSAP/ScrollTrigger/Flip, Lenis, Framer Motion, Vitest/Testing Library, Playwright Chromium.

**Spec:** `docs/superpowers/specs/2026-09-25-studio-viana-phase-4-craft-gallery-design.md`

## Global Constraints

- Preserve Phases 0–3; change only shared APIs needed by Phase 4, page composition and navigation.
- Exact visible copy and section order come from the spec; generated concepts govern composition and visual relationships.
- Existing forest/cream/gold tokens and Lora/Poppins typography remain authoritative.
- New media uses static imports, meaningful alt text, blur placeholders, stable aspect ratios and correct responsive `sizes`.
- Reduced motion has no pins, zoom scrubs, parallax, velocity response or autoplay.
- Continuous motion pauses off-screen; all tweens, observers, timers and listeners clean up on unmount.
- Production code follows TDD; every task observes a relevant failing test before implementation.
- No new runtime dependency is required; `Flip` is provided by the installed GSAP package.

## Review Focus

- Directly opening a product from the gallery lightbox must close the lightbox first and leave exactly one scroll-lock owner and one accessible dialog.
- Filtering after loading all 18 items must preserve the correct count, navigation set and current lightbox index without stale hidden entries.
- A 320px touch viewport must retain two usable gallery columns, reachable lightbox controls and no horizontal document overflow.
- Reduced-motion and no-JavaScript users must see complete craft/process copy, fully drawn paths and non-autoplaying content without hidden initial states.
- Repeated viewport changes around desktop pin/parallax breakpoints must not leave stale transforms, duplicate ScrollTriggers, timers or global listeners.

---

### Task 1: Phase 4 data, configuration and media inventory

**Files:**

- Create: `lib/data/process.ts`
- Create: `lib/data/gallery.ts`
- Create: `lib/data/testimonials.ts`
- Create: `lib/data/instagram.ts`
- Create: `public/images/craft/closeup-flower.jpg`
- Create: `public/images/craft/closeup-macro.jpg`
- Create: `public/images/process/step-01.jpg` through `step-05.jpg`
- Create: `public/images/gallery/gallery-01.jpg` through `gallery-18.jpg`
- Create: `public/images/instagram/ig-01.jpg` through `ig-10.jpg`
- Create: `tests/phase-four-data.test.ts`

**Interfaces:**

- Consumes: `ProductImage`, catalogue slugs and existing static image loader behavior.
- Produces: `processSteps`, `craftMotion`, `galleryItems`, `galleryFilters`, `GalleryItemData`, `GalleryCategory`, `testimonials`, `trustStats`, `instagramItems`, `instagramProfileUrl`.

- [ ] **Step 1: Write the failing typed-data contract test**

```ts
import { describe, expect, it } from "vitest";
import { galleryFilters, galleryItems } from "@/lib/data/gallery";
import { instagramItems } from "@/lib/data/instagram";
import { processSteps } from "@/lib/data/process";
import { testimonials, trustStats } from "@/lib/data/testimonials";

describe("Phase 4 data", () => {
  it("supplies the exact complete section inventories", () => {
    expect(processSteps.map((step) => step.number)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
    ]);
    expect(galleryItems).toHaveLength(18);
    expect(galleryFilters).toEqual([
      "All",
      "Bouquets",
      "Hampers",
      "Flower Cards",
      "Single Stems",
      "Occasions",
    ]);
    expect(new Set(galleryItems.map((item) => item.id)).size).toBe(18);
    expect(testimonials).toHaveLength(5);
    expect(testimonials.every((item) => item.placeholder)).toBe(true);
    expect(trustStats).toHaveLength(4);
    expect(instagramItems).toHaveLength(10);
  });
});
```

- [ ] **Step 2: Run the data test and verify RED**

Run: `npm test -- --run tests/phase-four-data.test.ts`  
Expected: FAIL because the four Phase 4 data modules do not exist.

- [ ] **Step 3: Create exact media files and typed data**

```ts
export type GalleryCategory =
  "Bouquets" | "Hampers" | "Flower Cards" | "Single Stems" | "Occasions";

export interface GalleryItemData {
  readonly alt: string;
  readonly category: GalleryCategory;
  readonly height: number;
  readonly id: string;
  readonly productSlug?: string;
  readonly src: StaticImageData;
  readonly title: string;
  readonly width: number;
}

export const galleryFilters = [
  "All",
  "Bouquets",
  "Hampers",
  "Flower Cards",
  "Single Stems",
  "Occasions",
] as const;
```

Create the exact step copy, five placeholder review records clearly marked in source, four editable stats and ten profile-linked Instagram records. Duplicate and mechanically crop existing Studio Viana photographs into the required exact file inventory; preserve the originals.

- [ ] **Step 4: Run the data contract and full suite**

Run: `npm test -- --run tests/phase-four-data.test.ts && npm test`  
Expected: the focused file and the complete suite PASS with no warnings.

- [ ] **Step 5: Commit**

```bash
git add lib/data public/images tests/phase-four-data.test.ts
git commit -m "feat: define the phase four content system"
```

### Task 2: Up Close and process story

**Files:**

- Create: `components/decor/SectionDivider.tsx`
- Create: `components/sections/craft/AnnotationCallout.tsx`
- Create: `components/sections/craft/LineIcon.tsx`
- Create: `components/sections/craft/StemPath.tsx`
- Create: `components/sections/craft/ProcessStep.tsx`
- Create: `components/sections/craft/ProcessSection.tsx`
- Create: `components/sections/craft/UpClose.tsx`
- Create: `tests/craft-phase-four.test.tsx`

**Interfaces:**

- Consumes: `processSteps`, `craftMotion`, `ImageReveal`, `SplitTextReveal`, `Button`, `SectionLabel`, GSAP helpers and reduced-motion hook.
- Produces: `<UpClose />`, `<ProcessSection />`, `<SectionDivider />`, `data-process-node` geometry for `StemPath`.

- [ ] **Step 1: Write failing semantic and reduced-motion tests**

```tsx
it("renders exact Up Close copy and three annotations", () => {
  const { container } = render(<UpClose />);
  expect(
    screen.getByRole("heading", { name: "Every fibre, shaped by hand." }),
  ).toBeVisible();
  expect(container.querySelectorAll("[data-annotation-callout]")).toHaveLength(
    3,
  );
  expect(container.querySelector("#craft-closeup")).toHaveAttribute(
    "data-theme",
    "dark",
  );
});

it("renders five process nodes and the custom-order CTA", () => {
  const { container } = render(<ProcessSection />);
  expect(container.querySelectorAll("[data-process-node]")).toHaveLength(5);
  expect(
    screen.getByRole("link", { name: "Start your order" }),
  ).toHaveAttribute("href", expect.stringContaining("wa.me"));
});
```

- [ ] **Step 2: Run the craft test and verify RED**

Run: `npm test -- --run tests/craft-phase-four.test.tsx`  
Expected: FAIL because the Phase 4 craft components do not exist.

- [ ] **Step 3: Implement responsive Up Close and calculated StemPath**

```ts
export interface StemPoint {
  x: number;
  y: number;
}

export function buildStemPath(points: readonly StemPoint[]) {
  if (points.length === 0) return "";
  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index];
    const middleY = (previous.y + point.y) / 2;
    return `${path} C ${previous.x} ${middleY}, ${point.x} ${middleY}, ${point.x} ${point.y}`;
  }, `M ${points[0].x} ${points[0].y}`);
}
```

Implement the documented pin/crossfade/callout timeline with `gsap.matchMedia`, a static mobile list and fully visible reduced-motion state. `StemPath` reads node rectangles relative to its container, debounces resize by 120ms, derives path length and animates dash offset. Add the required timeline and path-calculation comments.

- [ ] **Step 4: Run focused and full tests**

Run: `npm test -- --run tests/craft-phase-four.test.tsx && npm test`  
Expected: focused tests and the complete suite PASS.

- [ ] **Step 5: Commit**

```bash
git add components/decor/SectionDivider.tsx components/sections/craft tests/craft-phase-four.test.tsx
git commit -m "feat: tell the studio craft story"
```

### Task 3: Filterable masonry gallery

**Files:**

- Create: `components/sections/gallery/GalleryFilters.tsx`
- Create: `components/sections/gallery/GalleryItem.tsx`
- Create: `components/sections/gallery/MasonryGrid.tsx`
- Create: `components/sections/gallery/GallerySection.tsx`
- Modify: `lib/animations/gsap.ts`
- Create: `tests/gallery-phase-four.test.tsx`

**Interfaces:**

- Consumes: `galleryItems`, `galleryFilters`, cursor store, `Flip`, ScrollTrigger refresh and gallery item intent callbacks.
- Produces: `GallerySection`, a visible filtered item array, lazy-lightbox preload intent, selected item/trigger state and `data-gallery-item` markup.

- [ ] **Step 1: Write failing filter and load-more tests**

```tsx
it("shows twelve pieces first, filters the complete inventory, then loads all", async () => {
  const user = userEvent.setup();
  const { container } = render(<GallerySection />);
  expect(container.querySelectorAll("[data-gallery-item]")).toHaveLength(12);
  await user.click(screen.getByRole("button", { name: "Hampers" }));
  expect(screen.getByText(/Showing \d+ pieces/)).toBeVisible();
  expect(
    container.querySelectorAll('[data-gallery-category="Hampers"]'),
  ).not.toHaveLength(0);
  await user.click(screen.getByRole("button", { name: "All" }));
  await user.click(screen.getByRole("button", { name: "View more pieces" }));
  expect(container.querySelectorAll("[data-gallery-item]")).toHaveLength(18);
});
```

- [ ] **Step 2: Run the gallery test and verify RED**

Run: `npm test -- --run tests/gallery-phase-four.test.tsx`  
Expected: FAIL because `GallerySection` does not exist.

- [ ] **Step 3: Register Flip and implement the gallery**

```ts
import { Flip } from "gsap/Flip";

if (typeof window !== "undefined" && !pluginsRegistered) {
  gsap.registerPlugin(ScrollTrigger, Flip);
}

export { Flip, gsap, ScrollTrigger };
```

Capture `Flip.getState` before filter/load state changes and call `Flip.from` after React commits the new layout. Render responsive columns, fine-pointer hover focus/dimming, item reveal, ±8% desktop parallax, intent preloading and correct count. Include the required Flip lifecycle comment.

- [ ] **Step 4: Run focused and full tests**

Run: `npm test -- --run tests/gallery-phase-four.test.tsx && npm test`  
Expected: focused tests and complete suite PASS; filters expose only matching categories and All reaches 18.

- [ ] **Step 5: Commit**

```bash
git add lib/animations/gsap.ts components/sections/gallery tests/gallery-phase-four.test.tsx
git commit -m "feat: build the crafted masonry gallery"
```

### Task 4: Accessible lazy gallery lightbox

**Files:**

- Create: `components/sections/gallery/Lightbox.tsx`
- Modify: `components/sections/gallery/GallerySection.tsx`
- Modify: `components/sections/gallery/GalleryItem.tsx`
- Create: `tests/lightbox-phase-four.test.tsx`

**Interfaces:**

- Consumes: selected/visible `GalleryItemData[]`, initial item ID, originating HTMLElement, `useScrollLock`, WhatsApp helper and `studio-viana:open-product` event contract.
- Produces: dynamically loaded `Lightbox`, focus restoration, keyboard/touch navigation and optional product launch.

- [ ] **Step 1: Write failing lightbox lifecycle tests**

```tsx
it("traps focus, navigates, opens a product and restores the trigger", async () => {
  const user = userEvent.setup();
  render(<GallerySection />);
  const trigger = screen.getAllByRole("button", {
    name: /Open .* in gallery/,
  })[0];
  await user.click(trigger);
  const dialog = await screen.findByRole("dialog", {
    name: /gallery lightbox/i,
  });
  expect(document.documentElement.style.overflow).toBe("hidden");
  await user.keyboard("{ArrowRight}");
  expect(within(dialog).getByTestId("lightbox-counter")).toHaveTextContent(
    "02 / 12",
  );
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
```

- [ ] **Step 2: Run the lightbox test and verify RED**

Run: `npm test -- --run tests/lightbox-phase-four.test.tsx`  
Expected: FAIL because the dynamic lightbox and dialog lifecycle are absent.

- [ ] **Step 3: Implement one stable shared-element dialog**

```ts
const openProduct = (slug: string) => {
  onClose(false);
  window.dispatchEvent(
    new CustomEvent("studio-viana:open-product", { detail: { slug } }),
  );
};
```

Use `layoutId={`gallery-image-${item.id}`}`, AnimatePresence slide direction, adjacent `Image` preloading, arrow/Escape handling, focus trap, swipe threshold, click/double-tap zoom and backdrop close. Close before dispatching a Phase 3 product event so only one modal owns scroll/focus. Include the required shared-transition comment.

- [ ] **Step 4: Run focused and full tests**

Run: `npm test -- --run tests/lightbox-phase-four.test.tsx && npm test`  
Expected: lightbox tests and complete suite PASS; native overflow restores and trigger regains focus.

- [ ] **Step 5: Commit**

```bash
git add components/sections/gallery tests/lightbox-phase-four.test.tsx
git commit -m "feat: add the editorial gallery lightbox"
```

### Task 5: Testimonial slider and trust statistics

**Files:**

- Create: `components/sections/testimonials/TestimonialSlide.tsx`
- Create: `components/sections/testimonials/TrustStats.tsx`
- Create: `components/sections/testimonials/Testimonials.tsx`
- Create: `tests/testimonials-phase-four.test.tsx`

**Interfaces:**

- Consumes: `testimonials`, `trustStats`, reduced-motion and IntersectionObserver.
- Produces: `Testimonials`, `aria-live` slide content, manual/swipe navigation and off-screen-paused six-second autoplay.

- [ ] **Step 1: Write failing navigation and autoplay tests**

```tsx
it("navigates placeholder reviews and does not autoplay when reduced", async () => {
  const user = userEvent.setup();
  render(<Testimonials />);
  const region = screen.getByRole("region", { name: "Customer testimonials" });
  expect(region).toHaveAttribute("aria-live", "polite");
  const first = within(region).getByTestId("testimonial-name").textContent;
  await user.click(
    within(region).getByRole("button", { name: "Next testimonial" }),
  );
  expect(within(region).getByTestId("testimonial-name")).not.toHaveTextContent(
    first ?? "",
  );
});
```

- [ ] **Step 2: Run the testimonial test and verify RED**

Run: `npm test -- --run tests/testimonials-phase-four.test.tsx`  
Expected: FAIL because testimonial components do not exist.

- [ ] **Step 3: Implement word transitions, lifecycle-safe autoplay and stats**

```ts
const AUTOPLAY_MS = 6000;
const advance = () =>
  setActiveIndex((index) => (index + 1) % testimonials.length);
```

Use one interval only while intersecting, unhovered and motion-allowed; reset progress on manual navigation, support pointer swipe and render four editable stats with count-up only for finite numeric targets.

- [ ] **Step 4: Run focused and full tests**

Run: `npm test -- --run tests/testimonials-phase-four.test.tsx && npm test`  
Expected: testimonial tests and complete suite PASS with timers and observers cleaned up.

- [ ] **Step 5: Commit**

```bash
git add components/sections/testimonials tests/testimonials-phase-four.test.tsx
git commit -m "feat: add kind words and trust proof"
```

### Task 6: Instagram rail and velocity marquee

**Files:**

- Modify: `components/animations/Marquee.tsx`
- Create: `components/sections/instagram/InstagramStrip.tsx`
- Create: `components/sections/instagram/VelocityMarquee.tsx`
- Create: `tests/social-phase-four.test.tsx`
- Modify: `tests/animations.test.tsx`

**Interfaces:**

- Consumes: `instagramItems`, `instagramProfileUrl`, Lenis/ScrollTrigger velocity, pointer/reduced-motion hooks and extended Marquee props.
- Produces: `MarqueeProps.velocityFactor`, `MarqueeProps.skew`, `MarqueeProps.reverse`, `InstagramStrip`, `VelocityMarquee`.

- [ ] **Step 1: Write failing social and Marquee API tests**

```tsx
it("renders ten profile links and two accessible velocity rows", () => {
  render(
    <>
      <InstagramStrip />
      <VelocityMarquee />
    </>,
  );
  expect(
    screen.getAllByRole("link", { name: /View .* on Instagram/ }),
  ).toHaveLength(10);
  expect(
    screen.getByText(/Handcrafted, made to order and curated with love/),
  ).toHaveClass("sr-only");
});

it("accepts reverse, velocity and skew controls", () => {
  render(<Marquee text="Studio Viana" reverse velocityFactor={1.5} skew />);
  expect(
    screen.getByText("Studio Viana", { selector: ".sr-only" }),
  ).toBeVisible();
});
```

- [ ] **Step 2: Run social tests and verify RED**

Run: `npm test -- --run tests/social-phase-four.test.tsx tests/animations.test.tsx`  
Expected: FAIL because social components and the extended Marquee props do not exist.

- [ ] **Step 3: Extend one retained marquee timeline and build the social finale**

```ts
interface MarqueeProps {
  className?: string;
  reverse?: boolean;
  skew?: boolean;
  speed?: number;
  text: string;
  velocityFactor?: number;
}
```

Scroll velocity maps to `timeScale = direction * clamp(0.6, 3, 1 + abs(velocity) / 2000 * velocityFactor)`. A `quickTo` writer eases wrapper `skewX` toward `clamp(-8, 8, velocity / 300)` and back to zero. Pause the retained loop off-screen and on hover. Include the required velocity-math comment.

- [ ] **Step 4: Run focused and full tests**

Run: `npm test -- --run tests/social-phase-four.test.tsx tests/animations.test.tsx && npm test`  
Expected: social/API tests and complete suite PASS.

- [ ] **Step 5: Commit**

```bash
git add components/animations/Marquee.tsx components/sections/instagram tests/social-phase-four.test.tsx tests/animations.test.tsx
git commit -m "feat: create the social velocity finale"
```

### Task 7: Compose, verify and document Phase 4

**Files:**

- Modify: `app/page.tsx`
- Modify: `components/layout/Navbar.tsx`
- Modify: `tests/home-page.test.tsx`
- Modify: `tests/navigation.test.tsx`
- Create: `tests/browser/phase-four.spec.ts`
- Create: `docs/phase-4-craft-gallery.md`
- Create: `docs/superpowers/phase-4-fidelity-ledger.md`
- Modify: `README.md`

**Interfaces:**

- Consumes: all Phase 4 section components, final IDs/theme surfaces, existing product overlay event and Phase 5 shells.
- Produces: final page order, Gallery navigation state, browser evidence, tweakable-value guide, exact image list, five generation prompts and testing checklist.

- [ ] **Step 1: Write failing composition and browser contracts**

```tsx
it("composes the five Phase 4 chapters before Phase 5 shells", () => {
  const { container } = render(<Home />);
  const ids = Array.from(container.querySelectorAll("main > section[id]")).map(
    (node) => node.id,
  );
  expect(ids.indexOf("craft-closeup")).toBeLessThan(ids.indexOf("process"));
  expect(ids.indexOf("process")).toBeLessThan(ids.indexOf("gallery"));
  expect(ids.indexOf("gallery")).toBeLessThan(ids.indexOf("testimonials"));
  expect(ids.indexOf("testimonials")).toBeLessThan(ids.indexOf("instagram"));
  expect(ids.indexOf("instagram")).toBeLessThan(ids.indexOf("pricing"));
});
```

Browser coverage must exercise Up Close desktop/mobile/reduced modes, process path forward/back, filters/Flip/load more, lightbox click/keys/swipe/zoom/close/product handoff, testimonial controls and paused autoplay, Instagram links/hover, marquee reduced mode, theme navigation, no-JavaScript readability, responsive overflow and a production long-task trace.

- [ ] **Step 2: Run composition/browser contracts and verify RED**

Run: `npm test -- --run tests/home-page.test.tsx tests/navigation.test.tsx`  
Expected: FAIL because Phase 4 is not composed and Gallery is absent from navigation.

- [ ] **Step 3: Compose the page and write complete delivery documentation**

```tsx
<CollectionSection />
<UpClose />
<SectionDivider from="dark" to="light" />
<ProcessSection />
<GallerySection />
<Testimonials />
<InstagramStrip />
<VelocityMarquee />
```

Change the pricing shell label to Phase 5, retain Contact as Phase 5, add Gallery navigation between Craft and Pricing, and update browser/unit mocks. Document all tweakable values, exact image files, five brand-specific process prompts and the supplied checklist. Capture desktop and mobile screenshots and compare them with all five accepted concepts in the fidelity ledger.

- [ ] **Step 4: Run all static and unit gates**

Run: `npm run check`  
Expected: formatting, ESLint, TypeScript, all unit tests and optimized build PASS.

- [ ] **Step 5: Run the complete production browser gate**

Run: `PLAYWRIGHT_PRODUCTION=true npx playwright test`  
Expected: all Phase 1–4 Chromium tests PASS serially with no console/page/runtime/image errors or 50ms production long tasks.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx components/layout/Navbar.tsx tests docs README.md
git commit -m "docs: complete the phase four craft experience"
```

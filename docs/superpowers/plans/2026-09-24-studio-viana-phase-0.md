# Studio Viana Phase 0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Studio Viana's production-grade Next.js foundation, reusable brand design system, typed catalogue data, smooth-scroll and GSAP animation infrastructure, and a temporary verification showcase without building any public website sections.

**Architecture:** Use the Next.js App Router with Server Components by default and narrow client boundaries for Lenis, Framer Motion, and GSAP. Keep brand tokens, content data, UI primitives, and animation behavior in focused modules; centralize browser-only setup and make reduced motion a first-class static path. The temporary page composes these primitives as a disposable specimen sheet.

**Tech Stack:** Next.js 14+, React, strict TypeScript, Tailwind CSS configuration-file workflow, GSAP 3 with ScrollTrigger, Lenis, Framer Motion, `next/font`, `clsx`, `tailwind-merge`, Vitest, Testing Library, ESLint, Prettier, npm.

**Spec:** `docs/superpowers/specs/2026-09-24-studio-viana-phase-0-design.md`

## Global Constraints

- Use the latest stable Next.js release available through npm at implementation time, provided it is version 14 or newer, with its supported React versions.
- Package manager is npm and `package-lock.json` must be committed.
- Preserve the exact palette values and approved Lora/Poppins weights from the spec.
- No homepage, navigation, footer, final catalogue section, commerce flow, or Phase 1 cinematic intro.
- Use Server Components unless browser APIs, animation, pointer input, or React context require a client boundary.
- Every GSAP animation uses `gsap.context()` inside `useIsomorphicLayoutEffect` and reverts on cleanup.
- Reduced motion disables Lenis and all nonessential motion while leaving every item visible in its final state.
- Animate transform, opacity, and clip-path only.
- Support 320px through 2560px, keyboard navigation, visible focus, semantic HTML, and required image alt text.
- No `any`, hydration warnings, browser-console errors, unused dependencies, or layout-shifting image frames.
- The supplied catalogue and ZIP are reference material; source images with social overlays, embedded prices, or third-party marks are not production assets.
- Remote repository: `https://github.com/Gugan3007/StudioViana.git`; it is currently empty. Initialize the existing workspace and attach this URL as `origin` rather than cloning over the approved docs.

## Review Focus

- React Strict Mode mounts the Lenis provider twice in development: only one active ticker callback and Lenis instance may survive each mounted lifecycle; Task 5 includes this test.
- A user changes `prefers-reduced-motion` while the page is open: the hook and provider must update and stop/destroy smooth scrolling; Tasks 4 and 5 include this test.
- A WhatsApp message contains spaces, ampersands, emoji, or line breaks: the generated URL must encode the exact message; Task 2 includes this test.
- The preview is opened at 320px with long labels and price strings: no horizontal overflow or clipped interactive content; Task 8 includes an automated browser assertion.
- Images finish decoding after ScrollTrigger calculations: animation geometry must refresh after image load without accumulating listeners; Tasks 4, 6, and 8 include this behavior and browser verification.

---

## Planned File Map

### Project and toolchain

- `package.json` — npm scripts and dependency manifest
- `package-lock.json` — reproducible install
- `next.config.mjs` — Next.js configuration
- `tsconfig.json` — strict TypeScript and `@/*` alias
- `next-env.d.ts` — Next.js declarations
- `postcss.config.mjs` — Tailwind/PostCSS pipeline
- `tailwind.config.ts` — semantic theme tokens, type scale, spacing, shadows, and animation-safe utilities
- `eslint.config.mjs` — Next.js and TypeScript lint rules
- `.prettierrc.json`, `.prettierignore` — deterministic formatting
- `.gitignore` — Next.js, environment, coverage, and OS artifacts
- `vitest.config.ts`, `vitest.setup.ts` — jsdom test environment

### App shell and showcase

- `app/layout.tsx` — fonts, metadata, global wrapper, smooth-scroll provider
- `app/page.tsx` — temporary showcase composition only
- `app/globals.css` — variables, reset/base styling, Lenis CSS, scrollbar, selection, focus, reduced-motion safeguards
- `app/showcase/AnimationShowcase.tsx` — client-only animation specimens so `page.tsx` stays server-rendered

### Providers, UI, and animation components

- `components/providers/SmoothScrollProvider.tsx` — Lenis lifecycle/context
- `components/ui/{Button,Container,GoldDivider,Heading,PillTag,PriceTag,Section,SectionLabel}.tsx` — requested brand primitives
- `components/animations/{Float,ImageReveal,Marquee,ParallaxImage,Reveal,SplitTextReveal}.tsx` — requested reusable motion primitives

### Libraries and data

- `lib/utils.ts` — `cn`, `formatINR`, and `whatsappLink`
- `lib/animations/tokens.ts` — immutable timing/easing/distance constants
- `lib/animations/gsap.ts` — guarded GSAP/ScrollTrigger registration and refresh helper
- `lib/animations/useIsomorphicLayoutEffect.ts` — SSR-safe effect alias
- `lib/animations/useReducedMotion.ts` — live media-query hook
- `lib/animations/useLenis.ts` — provider consumer hook
- `lib/data/site.ts` — brand and contact constants
- `lib/data/products.ts` — typed products and services

### Tests and assets

- `tests/utils.test.ts` — utility behavior
- `tests/data.test.ts` — catalogue invariants
- `tests/ui.test.tsx` — semantic UI variants and accessibility
- `tests/reduced-motion.test.tsx` — media-query behavior
- `tests/smooth-scroll.test.tsx` — Lenis/GSAP lifecycle
- `tests/animations.test.tsx` — animation component static and animated contracts
- `public/images/gallery/placeholder-botanical-01.svg`, `placeholder-botanical-02.svg` — neutral fixed-size demo assets
- `public/images/hero/.gitkeep`, `public/images/products/.gitkeep`, `public/sequence/.gitkeep`, `public/brand/.gitkeep` — documented future asset locations
- `README.md` — setup, commands, asset placement, expected output, and Phase 0 checklist

---

### Task 1: Approve the Temporary Showcase Concept

**Files:**

- No repository files changed
- Generate: three coordinated concept images in the image-generation result store

**Interfaces:**

- Consumes: approved design spec and the supplied catalogue's cream/forest/gold editorial language
- Produces: an approved visual reference for the specimen intro, light component/animation area, and dark motion area

- [ ] **Step 1: Generate the specimen-intro concept**

Use Image Gen with this exact brief:

```text
Create a high-fidelity desktop web design concept for the top of a temporary design-system showcase for Studio Viana, not a public homepage. Luxury editorial florist mood inspired by a premium printed catalogue. Exact palette: forest #1F3326, cream #F7F0E6, cream-soft #FBF7F1, gold #B8925A, charcoal #2A2A26. Typography mood: Lora editorial serif headings and Poppins restrained sans-serif labels. Show a simple specimen title, exact colour swatches, and typography scale with generous whitespace, thin gold hairlines, square geometry, and no navigation, no hero CTA, no cards with large radii, and no invented marketing sections. Practical responsive HTML/CSS composition, 1440px wide screenshot, clean and readable.
```

- [ ] **Step 2: Generate the light component-and-animation concept**

```text
Create a coordinated high-fidelity desktop concept for the middle of Studio Viana's temporary design-system showcase. Continue the exact cream, cream-soft, forest, and muted-gold editorial system. Show compact specimens for a gold divider, handmade pill, framed price tag, three button variants, then elegant demonstration frames for text reveal, split-text reveal, image clip reveal, and botanical-image parallax. This is tooling documentation, not a public homepage. Use open layouts and whitespace, thin hairlines, square or 2px corners, clear labels, and implementation-friendly image frames. No navigation, testimonials, product grid, or promotional CTA. 1440px wide screenshot.
```

- [ ] **Step 3: Generate the dark motion-area concept**

```text
Create a coordinated high-fidelity desktop concept for the final dark section of Studio Viana's temporary design-system showcase. Forest #1F3326 background with a very restrained forest-deep radial glow, cream type, muted-gold labels and hairlines. Show a subtle floating botanical object demonstration, a large continuous horizontal marquee using the phrase 'FLOWERS THAT NEVER FADE', and a minimal typed-data specimen. Keep the composition calm, sparse, editorial, and test-oriented. No footer, navigation, cards with rounded corners, or final website sections. 1440px wide screenshot.
```

- [ ] **Step 4: Present all three concepts for approval**

Expected: user explicitly approves the visual references before code is written. If revisions are requested, regenerate the affected concept rather than reinterpreting it during implementation.

### Task 2: Bootstrap the Repository and Toolchain

**Files:**

- Create: all files under “Project and toolchain” in the file map
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css` with the smallest buildable shell
- Modify: none

**Interfaces:**

- Consumes: empty remote URL and approved spec
- Produces: buildable strict Next.js project with `@/*` imports and test/lint/format scripts

- [ ] **Step 1: Initialize Git and attach the empty remote**

Run:

```bash
git init -b main
git remote add origin https://github.com/Gugan3007/StudioViana.git
git remote -v
```

Expected: `origin` fetch and push URLs both point to the supplied repository.

- [ ] **Step 2: Initialize npm and install the exact stack**

Run:

```bash
npm init -y
npm install next@latest react@latest react-dom@latest gsap@latest lenis@latest framer-motion@latest clsx@latest tailwind-merge@latest
npm install --save-dev typescript@latest @types/node@latest @types/react@latest @types/react-dom@latest tailwindcss@3.4.17 postcss@latest autoprefixer@latest eslint@latest eslint-config-next@latest prettier@latest prettier-plugin-tailwindcss@latest vitest@latest jsdom@latest @vitejs/plugin-react@latest @testing-library/react@latest @testing-library/jest-dom@latest @testing-library/user-event@latest
```

Expected: installation succeeds and npm records the resolved versions in `package-lock.json`.

- [ ] **Step 3: Write the configuration and minimal app shell**

Set scripts in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --max-warnings=0",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "check": "npm run format:check && npm run lint && npm run typecheck && npm run test && npm run build"
  }
}
```

Configure `tsconfig.json` with `strict: true`, `noEmit: true`, `moduleResolution: "bundler"`, Next.js plugin support, and `@/*` mapped to the project root. Configure Vitest for `jsdom`, globals, `vitest.setup.ts`, and the React plugin. Import `@testing-library/jest-dom/vitest` from the setup file.

- [ ] **Step 4: Verify the empty shell**

Run:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Expected: typecheck, lint, and build pass; Vitest reports no test files yet without treating that as a failure by setting `passWithNoTests: true` temporarily. Remove `passWithNoTests` in Task 3 after the first tests exist.

- [ ] **Step 5: Commit the scaffold**

```bash
git add .
git commit -m "chore: bootstrap Studio Viana foundation"
```

### Task 3: Add Utilities and Typed Brand Data with TDD

**Files:**

- Create: `tests/utils.test.ts`
- Create: `tests/data.test.ts`
- Create: `lib/utils.ts`
- Create: `lib/data/site.ts`
- Create: `lib/data/products.ts`
- Modify: `vitest.config.ts`

**Interfaces:**

- Consumes: Vitest configuration from Task 2
- Produces: `cn(...inputs: ClassValue[]): string`, `formatINR(value: number): string`, `whatsappLink(message?: string): string`, `site`, `products`, `services`, and exported `Product`, `ProductVariant`, and `Service` types

- [ ] **Step 1: Write failing utility tests**

```ts
import { describe, expect, it } from "vitest";
import { cn, formatINR, whatsappLink } from "@/lib/utils";

describe("formatINR", () => {
  it("uses Indian digit grouping without forcing decimal places", () => {
    expect(formatINR(1250)).toBe("₹1,250");
    expect(formatINR(125000)).toBe("₹1,25,000");
  });
});

describe("whatsappLink", () => {
  it("normalizes the Studio Viana number and encodes complex messages", () => {
    expect(whatsappLink("Hello & thank you 🌸\nStudio Viana")).toBe(
      "https://wa.me/919488713438?text=Hello%20%26%20thank%20you%20%F0%9F%8C%B8%0AStudio%20Viana",
    );
  });
});

describe("cn", () => {
  it("merges conditional classes and resolves Tailwind conflicts", () => {
    expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4");
  });
});
```

- [ ] **Step 2: Run the utility tests and confirm RED**

Run: `npm test -- tests/utils.test.ts`

Expected: FAIL because `@/lib/utils` does not exist.

- [ ] **Step 3: Implement the utilities**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const WHATSAPP_NUMBER = "919488713438";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function whatsappLink(message = ""): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
```

- [ ] **Step 4: Run the utility tests and confirm GREEN**

Run: `npm test -- tests/utils.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing catalogue invariant tests**

Test exact product order, names, prices, unique `id`/`number`/`slug`, the Grand Bouquet `featured` flag, exact service order, and exact site contact values. Include:

```ts
expect(products.map(({ number, priceLabel }) => [number, priceLabel])).toEqual([
  ["01", "₹150"],
  ["02", "₹120 per stem"],
  ["03", "₹150 – ₹250"],
  ["04", "₹550"],
  ["05", "₹650"],
  ["06", "₹1,250"],
  ["07", "₹1,250"],
  ["08", "₹1,250"],
  ["09", "On request"],
]);
expect(new Set(products.map((product) => product.slug)).size).toBe(
  products.length,
);
expect(services.map((service) => service.name)).toEqual([
  "Hampers",
  "Bouquets",
  "Corporate Events",
  "Return Gifts",
]);
```

- [ ] **Step 6: Run catalogue tests and confirm RED**

Run: `npm test -- tests/data.test.ts`

Expected: FAIL because the data modules do not exist.

- [ ] **Step 7: Implement immutable typed site, product, and service data**

Define `ProductVariant`, `Product`, and `Service` with readonly fields. Populate all copy from Section 7 of the user brief. Give Corporate & Bulk Orders number `09`, slug `corporate-bulk-orders`, and no variants. Re-export the same `whatsappLink` function from `site.ts` rather than duplicating URL logic.

- [ ] **Step 8: Run data and utility tests**

Run: `npm test -- tests/utils.test.ts tests/data.test.ts`

Expected: PASS. Remove `passWithNoTests` from Vitest configuration.

- [ ] **Step 9: Commit typed domain data**

```bash
git add lib tests vitest.config.ts
git commit -m "feat: add typed brand and catalogue data"
```

### Task 4: Implement Global Tokens and UI Primitives with TDD

**Files:**

- Create: `tests/ui.test.tsx`
- Create: `components/ui/SectionLabel.tsx`
- Create: `components/ui/Heading.tsx`
- Create: `components/ui/GoldDivider.tsx`
- Create: `components/ui/PriceTag.tsx`
- Create: `components/ui/PillTag.tsx`
- Create: `components/ui/Button.tsx`
- Create: `components/ui/Container.tsx`
- Create: `components/ui/Section.tsx`
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`

**Interfaces:**

- Consumes: `cn` from Task 3 and approved CSS tokens
- Produces: the eight requested UI components, `HeadingSize`, `ButtonVariant`, and `SectionTone` types

- [ ] **Step 1: Write failing semantic component tests**

Cover:

```tsx
render(
  <Heading as="h2" size="h1" italic="forever">
    Flowers live forever
  </Heading>,
);
expect(
  screen.getByRole("heading", { level: 2, name: "Flowers live forever" }),
).toBeVisible();
expect(screen.getByText("forever")).toHaveClass("italic");

render(
  <Button href="/catalogue" variant="outline-gold">
    Explore
  </Button>,
);
expect(screen.getByRole("link", { name: "Explore" })).toHaveAttribute(
  "href",
  "/catalogue",
);

render(
  <Button type="button" variant="solid-forest" onClick={() => undefined}>
    Order
  </Button>,
);
expect(screen.getByRole("button", { name: "Order" })).toHaveAttribute(
  "type",
  "button",
);

render(
  <Section tone="dark" aria-label="Dark specimen">
    Content
  </Section>,
);
expect(screen.getByRole("region", { name: "Dark specimen" })).toHaveClass(
  "bg-forest",
);
```

- [ ] **Step 2: Run the UI tests and confirm RED**

Run: `npm test -- tests/ui.test.tsx`

Expected: FAIL because component modules do not exist.

- [ ] **Step 3: Add CSS variables and Tailwind mappings**

Add the exact colour variables, font variables, fluid font sizes, 1320px max width, section spacing, subtle shadows, 2px editorial radius, label tracking, and twelve-column grid values. Add global body, selection, focus-visible, Lenis selectors, scrollbar, touch-device scrollbar fallback, and reduced-motion transition safeguards.

- [ ] **Step 4: Implement UI primitives**

Use small variant maps and `cn`. `Heading` accepts `children: string`, finds the first exact italic phrase, and emits one semantic heading without duplicating accessible text. `Button` uses `motion.a` or `motion.button` for a small `whileTap={{ scale: 0.98 }}` interaction and CSS pseudo-elements for the sliding fill; use Framer Motion's own `useReducedMotion()` hook here and set `whileTap` to `undefined` when it matches. The `magnetic?: boolean` prop is accepted and forwarded nowhere. The project-level hook introduced in Task 5 remains the GSAP/Lenis source of truth.

- [ ] **Step 5: Run UI tests and confirm GREEN**

Run: `npm test -- tests/ui.test.tsx`

Expected: PASS with no React act warnings.

- [ ] **Step 6: Run static checks**

Run: `npm run typecheck && npm run lint`

Expected: PASS with no `any`, unused imports, or unescaped JSX text warnings.

- [ ] **Step 7: Commit the design-system primitives**

```bash
git add app/globals.css tailwind.config.ts components/ui tests/ui.test.tsx
git commit -m "feat: add Studio Viana design primitives"
```

### Task 5: Build Reduced-Motion and GSAP Foundations with TDD

**Files:**

- Create: `tests/reduced-motion.test.tsx`
- Create: `lib/animations/tokens.ts`
- Create: `lib/animations/gsap.ts`
- Create: `lib/animations/useReducedMotion.ts`
- Create: `lib/animations/useIsomorphicLayoutEffect.ts`

**Interfaces:**

- Consumes: browser `matchMedia`, GSAP, and ScrollTrigger
- Produces: `motionTokens`, configured `gsap`, `ScrollTrigger`, `refreshScrollTrigger(): void`, `useReducedMotion(): boolean`, and `useIsomorphicLayoutEffect`

- [ ] **Step 1: Write a controllable matchMedia test utility and failing tests**

Create a real listener-backed test implementation whose `setMatches(boolean)` dispatches a `change` event. Assert that a component displaying `String(useReducedMotion())` changes from `false` to `true` after `setMatches(true)`.

- [ ] **Step 2: Run and confirm RED**

Run: `npm test -- tests/reduced-motion.test.tsx`

Expected: FAIL because `useReducedMotion` does not exist.

- [ ] **Step 3: Implement motion tokens and hooks**

`motionTokens` must contain:

```ts
export const motionTokens = {
  ease: {
    expo: "expo.out",
    entrance: "power3.out",
    transition: "power2.inOut",
    signature: "cubic-bezier(0.22, 1, 0.36, 1)",
  },
  duration: { fast: 0.4, base: 0.8, slow: 1.2, cinematic: 1.8 },
  stagger: 0.08,
  revealDistance: 40,
} as const;
```

Implement `useReducedMotion` with `window.matchMedia("(prefers-reduced-motion: reduce)")`, an initial lazy state, `change` listener registration, and cleanup. Use `useLayoutEffect` in the browser and `useEffect` on the server.

- [ ] **Step 4: Implement guarded GSAP registration**

Import `gsap` and `ScrollTrigger` from browser-compatible GSAP entry points, guard registration with `typeof window !== "undefined"` and a module flag, call `gsap.defaults({ ease: "power3.out", duration: 0.8 })`, and export a refresh function that schedules `ScrollTrigger.refresh()` in `requestAnimationFrame`.

- [ ] **Step 5: Run tests and static checks**

Run: `npm test -- tests/reduced-motion.test.tsx && npm run typecheck && npm run lint`

Expected: PASS.

- [ ] **Step 6: Commit animation foundations**

```bash
git add lib/animations tests/reduced-motion.test.tsx
git commit -m "feat: add motion tokens and browser-safe gsap setup"
```

### Task 6: Implement Lenis Integration with Lifecycle Tests

**Files:**

- Create: `tests/smooth-scroll.test.tsx`
- Create: `components/providers/SmoothScrollProvider.tsx`
- Create: `lib/animations/useLenis.ts`
- Modify: `app/layout.tsx`

**Interfaces:**

- Consumes: `useReducedMotion`, configured `gsap`, and `ScrollTrigger`
- Produces: `SmoothScrollProvider`, `LenisContextValue`, and `useLenis()`

- [ ] **Step 1: Write failing lifecycle tests**

Mock the `lenis` constructor and GSAP ticker boundary, not React behavior. Assert the constructor receives:

```ts
{
  lerp: 0.08,
  smoothWheel: true,
  wheelMultiplier: 0.9,
  touchMultiplier: 1.4,
  syncTouch: false,
}
```

Assert one scroll callback is subscribed, one ticker callback is added, `lagSmoothing(0)` is called, ticker time is converted from seconds to milliseconds for `lenis.raf(time * 1000)`, and unmount removes the exact ticker callback before calling `lenis.destroy()`.

Add a rerender test that changes reduced motion from false to true and expects the active Lenis instance to be destroyed with no replacement. Wrap the provider in `StrictMode` and assert active listeners do not exceed one after the mounted lifecycle settles.

- [ ] **Step 2: Run and confirm RED**

Run: `npm test -- tests/smooth-scroll.test.tsx`

Expected: FAIL because the provider and hook do not exist.

- [ ] **Step 3: Implement provider and hook**

Use a typed context initialized with `{ lenis: null }`. In the effect, return immediately when reduced motion is true. Subscribe `lenis.on("scroll", ScrollTrigger.update)`, add the ticker callback, and cleanup in reverse ownership order. Do not call `requestAnimationFrame` separately because GSAP owns the loop.

- [ ] **Step 4: Wrap the root layout**

Load Lora and Poppins from `next/font/google` with approved weights, CSS variables, and `display: "swap"`. Export metadata:

```ts
export const metadata: Metadata = {
  title: "Studio Viana — Handcrafted Chenille Florals",
  description: "Flowers that never fade, feelings that never end.",
  themeColor: "#1F3326",
};
```

Apply both font variables and wrap `{children}` with `SmoothScrollProvider`.

- [ ] **Step 5: Run tests and static checks**

Run: `npm test -- tests/smooth-scroll.test.tsx && npm run typecheck && npm run lint`

Expected: PASS without leaked-timer or act warnings.

- [ ] **Step 6: Commit smooth scrolling**

```bash
git add app/layout.tsx components/providers lib/animations/useLenis.ts tests/smooth-scroll.test.tsx
git commit -m "feat: integrate lenis with gsap ticker"
```

### Task 7: Implement Text and Reveal Animations with TDD

**Files:**

- Create: `tests/animations.test.tsx`
- Create: `components/animations/Reveal.tsx`
- Create: `components/animations/SplitTextReveal.tsx`
- Modify: `components/ui/GoldDivider.tsx`

**Interfaces:**

- Consumes: configured GSAP, ScrollTrigger, motion tokens, reduced-motion hook, isomorphic layout effect
- Produces: `Reveal`, `SplitTextReveal`, and animated `GoldDivider`

- [ ] **Step 1: Write failing public-contract tests**

Assert:

- `Reveal` keeps children in the document and renders them immediately when reduced motion is true.
- `Reveal` creates a GSAP context and calls `context.revert()` on unmount when motion is enabled.
- `SplitTextReveal` renders one accessible heading name while its visual token spans have `aria-hidden="true"`.
- `type="words"` preserves punctuation and visible spacing.
- `type="lines"` treats newline-delimited text as explicit lines and otherwise uses the complete string as one line, avoiding hydration-dependent layout measurement.
- Animated `GoldDivider` remains full width with reduced motion.

- [ ] **Step 2: Run and confirm RED**

Run: `npm test -- tests/animations.test.tsx`

Expected: FAIL because animation components do not exist and `GoldDivider` lacks the animated contract.

- [ ] **Step 3: Implement `Reveal`**

Use a root ref, `gsap.context`, `gsap.fromTo`, `autoAlpha`, transform-only `y`, optional `[data-reveal-item]` child selection when `stagger` is supplied, and ScrollTrigger options `{ start: "top 85%", once }`. Set final inline visibility for reduced motion.

- [ ] **Step 4: Implement `SplitTextReveal`**

Accept `children: string`, `as: "h1" | "h2" | "h3" | "p"`, `type`, and `delay`. Render a visually hidden unsplit string and mark the animated visual layer hidden from assistive technology. Each word/line sits in an overflow-hidden mask; animate token spans from `yPercent: 110` and `autoAlpha: 0` with the default stagger.

- [ ] **Step 5: Add optional divider drawing**

When `animate` is true, reveal the divider with `scaleX: 0` to `1`, left transform origin, and ScrollTrigger. On reduced motion, render at `scaleX(1)` without GSAP.

- [ ] **Step 6: Run tests and static checks**

Run: `npm test -- tests/animations.test.tsx && npm run typecheck && npm run lint`

Expected: PASS.

- [ ] **Step 7: Commit reveal primitives**

```bash
git add components/animations components/ui/GoldDivider.tsx tests/animations.test.tsx
git commit -m "feat: add accessible reveal animations"
```

### Task 8: Implement Image, Float, and Marquee Animations

**Files:**

- Modify: `tests/animations.test.tsx`
- Create: `components/animations/ParallaxImage.tsx`
- Create: `components/animations/ImageReveal.tsx`
- Create: `components/animations/Float.tsx`
- Create: `components/animations/Marquee.tsx`
- Create: `public/images/gallery/placeholder-botanical-01.svg`
- Create: `public/images/gallery/placeholder-botanical-02.svg`
- Create: public `.gitkeep` files listed in the map

**Interfaces:**

- Consumes: Next Image, configured GSAP, ScrollTrigger, `refreshScrollTrigger`, motion hooks/tokens
- Produces: four remaining animation components and fixed-dimension local preview assets

- [ ] **Step 1: Extend animation tests and confirm RED**

Add tests that require image `alt`, verify fixed aspect-ratio wrapper classes, call the image load callback and expect `refreshScrollTrigger`, assert reduced motion removes transform/clip initial states, assert Float removes pointer listeners on unmount, and assert Marquee renders two hidden-from-assistive-technology copies plus one accessible phrase.

Run: `npm test -- tests/animations.test.tsx`

Expected: FAIL because the four modules do not exist.

- [ ] **Step 2: Create neutral botanical SVG assets**

Create two 1600×1200 SVGs using cream/cream-soft backgrounds, restrained forest botanical linework, and soft lilac/blush shapes. Include no logos, prices, claims, or UI text. These are intentionally temporary image-animation fixtures.

- [ ] **Step 3: Implement `ParallaxImage` and `ImageReveal`**

Both accept typed `ImageProps` essentials plus `className` and `sizes`. `ParallaxImage` uses an overflow-hidden stable frame and a 1.15-scaled inner image; its scrubbed timeline translates by a bounded percentage derived from `speed`. `ImageReveal` animates wrapper clip-path from `inset(100% 0 0 0)` and inner scale from `1.08` to `1`. Both call `refreshScrollTrigger` after image load.

- [ ] **Step 4: Implement `Float`**

Accept `strength?: number`, `mouseParallax?: number`, and children. Create a deterministic offset from `useId()` rather than `Math.random()` to avoid hydration drift. Use a yoyo timeline for vertical translation. Add pointer movement only when `(hover: hover) and (pointer: fine)` matches, and remove both media-query/pointer listeners during cleanup.

- [ ] **Step 5: Implement `Marquee`**

Accept `text`, `speed?: number`, and `direction?: "left" | "right"`. Render one screen-reader string and two decorative tracks. Use `xPercent` looping with `ease: "none"`, `repeat: -1`, and `modifiers` or wrapped values for continuity. Subscribe to ScrollTrigger velocity and ease the timeline time scale toward a bounded value; remove the trigger and timeline on cleanup.

- [ ] **Step 6: Run tests and full static checks**

Run: `npm test -- tests/animations.test.tsx && npm run typecheck && npm run lint`

Expected: PASS with no image-prop or cleanup warnings.

- [ ] **Step 7: Commit motion components and fixtures**

```bash
git add components/animations public tests/animations.test.tsx
git commit -m "feat: add image and ambient motion primitives"
```

### Task 9: Compose and Verify the Temporary Showcase

**Files:**

- Create: `app/showcase/AnimationShowcase.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Create: `README.md`
- Create: `tests/browser/showcase.spec.ts` if Playwright is required as the browser fallback

**Interfaces:**

- Consumes: all UI components, animation components, brand data, products, services, and approved concept images
- Produces: finished Phase 0 preview, asset/run documentation, browser evidence, and completion checklist

- [ ] **Step 1: Compose the server-rendered specimen areas**

Build `app/page.tsx` in the exact approved order: title, palette, typography, component specimens, light animation area, dark Float/Marquee area, and compact data specimen. Keep only animation demos inside `AnimationShowcase.tsx`. Do not add navigation, a footer, order CTA, product-card grid, or homepage sections.

- [ ] **Step 2: Match the approved visual concepts**

Compare the first viewport, component area, and dark motion area against their accepted images. Preserve palette temperature, type hierarchy, thin borders, square geometry, whitespace rhythm, image framing, and exact visible copy. Record a five-point fidelity ledger covering copy, composition, typography, colour, and spacing.

- [ ] **Step 3: Add README delivery documentation**

Document:

```text
npm install
npm run dev
```

Explain that `http://localhost:3000` shows the temporary design-system preview. List the `/public/brand`, `/public/images/hero`, `/public/images/products`, `/public/images/gallery`, and `/public/sequence` destinations. Include the Phase 0 checklist and identify custom text splitting as the deliberate SplitText fallback.

- [ ] **Step 4: Run the complete automated gate**

Run:

```bash
npm run format
npm run check
```

Expected: Prettier, ESLint, TypeScript, all tests, and production build pass with zero warnings treated as errors.

- [ ] **Step 5: Start the production-like preview**

Run:

```bash
npm run dev
```

Expected: Next.js starts locally and `/` returns 200.

- [ ] **Step 6: Verify through the available browser tooling**

Use the Browser/IAB integration first. If unavailable, read and use the `vercel:agent-browser-verify` skill; use Playwright only if both are unavailable or unreliable. Verify:

- 1440px desktop and 320px mobile viewports
- `document.documentElement.scrollWidth === document.documentElement.clientWidth`
- all placeholder images report `complete` and positive `naturalWidth`
- all requested component labels and animation specimens are present
- keyboard focus is visible on each button/link variant
- Lenis scrolling and ScrollTrigger reveals work without console errors
- emulated reduced motion leaves all content visible and prevents continuing marquee/float motion
- resizing across breakpoints does not produce hydration warnings or clipped labels

- [ ] **Step 7: Capture and inspect visual evidence**

Capture desktop and mobile full-page screenshots. Use `view_image` on the accepted concept images and latest implementation screenshots in the same QA pass. Fix every material mismatch and repeat until the preview is agency-signoff faithful for its temporary purpose.

- [ ] **Step 8: Run final verification after visual fixes**

Run:

```bash
npm run check
git status --short
```

Expected: all checks pass; status contains only intentional showcase/documentation edits ready for commit.

- [ ] **Step 9: Commit Phase 0**

```bash
git add app README.md tests docs
git commit -m "feat: complete Studio Viana phase zero"
```

- [ ] **Step 10: Inspect remote divergence without pushing**

Run:

```bash
git fetch origin
git status -sb
git log --oneline --decorate -10
```

Expected: local `main` contains the Phase 0 commits and the empty remote has no competing history. Do not push unless the user explicitly requests publication.

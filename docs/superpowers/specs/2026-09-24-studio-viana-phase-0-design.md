# Studio Viana Phase 0 Design Specification

Date: 2026-09-24
Status: Pending user review before implementation planning

## 1. Objective

Create the technical and visual foundation for Studio Viana's future website. Phase 0 establishes the Next.js application, brand design system, reusable UI primitives, animation infrastructure, typed content data, and a temporary design-system showcase used only for verification.

This phase must not build the public-facing homepage, navigation, footer, product catalogue sections, or the cinematic flower intro planned for later phases.

## 2. Success Criteria

Phase 0 is complete when:

- The project runs through npm as a strict TypeScript Next.js App Router application.
- Brand tokens are available as CSS variables and Tailwind theme values.
- The requested UI primitives are reusable, responsive, accessible, and visually consistent.
- Lenis and GSAP share a single animation frame loop and clean up without duplicate initialization.
- All reusable animation components render static, readable content when reduced motion is requested.
- The temporary preview demonstrates every required token, component, and animation across cream and forest surfaces.
- The project has no TypeScript, lint, build, hydration, or browser-console errors.
- The preview is usable from 320px through 2560px without horizontal overflow or unstable image layout.
- Brand and product data reflect the supplied catalogue and approved Phase 0 brief.

## 3. Scope

### Included

- Next.js App Router project and npm scripts
- TypeScript strict mode
- Tailwind CSS with a conventional `tailwind.config` file
- ESLint and Prettier configuration
- `next/font` integration for Lora and Poppins
- CSS variables, global base styles, selection styling, Lenis rules, scrollbar treatment, focus treatment, and reduced-motion safeguards
- Shared `Container` and `Section` layout primitives
- Requested brand UI components and variants
- Lenis provider and access hook
- Centralized GSAP and ScrollTrigger registration
- Custom word/line splitting utility instead of relying on licensed GSAP SplitText availability
- Requested reusable animation components
- Typed site, service, and product data
- Temporary design-system showcase page
- Neutral local placeholder imagery for image-animation demonstrations
- Automated unit/component checks where behavior can be validated reliably
- Production build and browser-based visual verification

### Excluded

- Public website sections or final information architecture
- Header/navigation and footer
- Phase 1 cinematic scroll-dive intro
- Shopping, checkout, order submission, CMS, database, authentication, analytics, or external APIs
- Final product-photo curation, retouching, or optimization
- Production logo reconstruction
- Deployment

## 4. Technical Architecture

The application uses the Next.js App Router. `app/layout.tsx` remains a Server Component and owns metadata, font variables, the global stylesheet, and the client-side smooth-scroll provider. `app/page.tsx` is primarily a composition surface for the temporary showcase; interactive and animated portions are isolated inside client components.

Browser-only animation packages must never execute during server rendering. GSAP plugin registration is guarded by a browser check and a module-level registration flag. Animation components import the configured GSAP module and run timelines through `gsap.context()` inside the isomorphic layout-effect hook. Every context is reverted during cleanup.

Lenis is initialized only inside `SmoothScrollProvider`. The provider owns its lifecycle, connects Lenis scroll events to `ScrollTrigger.update`, advances Lenis from `gsap.ticker`, disables GSAP ticker lag smoothing, and removes both ticker and Lenis listeners on cleanup. Strict Mode remounts must not leave multiple Lenis instances or ticker callbacks.

The provider exposes the current Lenis instance through context. `lib/animations/useLenis.ts` is the public hook for later phases and supports access to `scrollTo`, `start`, and `stop` through the underlying typed instance. If reduced motion is active, no Lenis instance is created and native scrolling remains available.

## 5. Dependency Strategy

Required runtime dependencies:

- The latest stable Next.js release available through npm at implementation time, provided it is version 14 or newer, paired with its supported React versions
- React and React DOM versions required by that Next.js release
- Tailwind CSS using the configuration-file workflow requested in the brief
- GSAP 3 with ScrollTrigger
- `lenis`
- `framer-motion`
- `clsx`
- `tailwind-merge`

SplitText will not be assumed available because its packaging and licensing can vary. `SplitTextReveal` will use a small local splitter that preserves readable text and accessibility semantics.

Development dependencies include TypeScript, React/Node type packages, ESLint, the compatible Next.js ESLint configuration, Prettier, the Tailwind Prettier plugin, PostCSS tooling, and a lightweight test runner with DOM testing support.

Exact versions are locked in `package-lock.json`. No dependency is added unless it is used by Phase 0.

## 6. Design System

### Colour

The CSS root defines the approved palette exactly:

- forest `#1F3326`
- forest-deep `#16241B`
- cream `#F7F0E6`
- cream-soft `#FBF7F1`
- gold `#B8925A`
- gold-light `#D6B98A`
- charcoal `#2A2A26`
- muted `#6B665E`
- blush `#E9C9C9`
- lilac `#C9B6E4`

Tailwind exposes semantic names that reference these variables rather than duplicating independent values.

### Typography

Lora is the display family with weights 400, 500, and 600 plus italic styling. Poppins is the body and UI family with weights 300, 400, and 500. Both are loaded through `next/font/google`, exported as CSS variables, and connected to Tailwind font-family utilities.

The approved fluid scale is implemented with `clamp()` values for display, h1, h2, h3, body, and label roles. Labels use Poppins 500, uppercase, 0.35em tracking, and the gold colour unless a component variant explicitly changes contrast.

### Layout

`Container` caps content at 1320px and supplies responsive horizontal gutters. It also exposes a reusable twelve-column CSS grid mode. `Section` owns semantic section markup, vertical padding, and tone. Its dark tone uses forest with a restrained forest-deep radial glow; its light tone uses cream. Neither primitive introduces rounded card shells.

### Details

The system uses square or 2px-radius editorial geometry, thin translucent gold hairlines, 56px by 2px dividers, pill shapes only for tags, and subtle shadows. Visible keyboard focus uses a high-contrast gold outline with an offset.

## 7. UI Components

- `SectionLabel`: semantic small label with approved uppercase tracking and gold treatment.
- `Heading`: polymorphic Lora heading with display/h1/h2/h3 sizes, light contrast, and an optional italic-highlight phrase. Highlighting changes visual style without altering heading semantics.
- `GoldDivider`: fixed gold rule with an optional transform-based draw animation and a static reduced-motion state.
- `PriceTag`: compact editorial price frame using Lora and a thin gold border.
- `PillTag`: small uppercase made-to-order treatment with a gold outline.
- `Button`: anchor or button output with `outline-gold`, `solid-forest`, and `text-link` variants. Hover fills use a transformed pseudo-layer; content remains above the layer. Focus, disabled behavior, and reduced motion are explicit. `magnetic` is accepted as a typed no-op capability marker for Phase 6.
- `Container`: max-width and gutter control, with optional twelve-column grid behavior.
- `Section`: vertical rhythm and light/dark surface ownership.

The `cn()` utility combines `clsx` and `tailwind-merge` for predictable variant composition.

## 8. Animation Components

All components are client components, accept a `className` where appropriate, require meaningful alternative text for images, and render final/static visual states under reduced motion.

- `Reveal`: opacity and vertical translation reveal triggered by ScrollTrigger. It supports delay, distance, child staggering, and once/replay behavior.
- `SplitTextReveal`: splits visible heading content into words or measured visual lines. Each segment is wrapped in an overflow mask and moves upward into place. An accessible unsplit label remains available to assistive technology, while split fragments are decorative.
- `ParallaxImage`: a stable aspect-ratio frame containing `next/image`. The image scales to 1.15 and translates vertically according to scroll position and configurable speed.
- `ImageReveal`: clips a stable image frame from bottom to top while the inner image settles from a slight scale-up.
- `Float`: uses a yoyoing sine-like GSAP motion with a stable per-instance offset. Optional pointer parallax is bounded and transform-only. Pointer listeners and timelines are cleaned up.
- `Marquee`: duplicates its track sufficiently for a continuous loop. Base direction and speed are configurable; scroll velocity temporarily modifies time scale without causing discontinuities.

Animation defaults live in `lib/animations/tokens.ts`. `lib/animations/gsap.ts` sets GSAP defaults and exports a safe refresh helper. `useReducedMotion` and `useIsomorphicLayoutEffect` avoid repeated ad hoc media-query and SSR logic.

## 9. Data Model

`lib/data/site.ts` exports immutable typed brand information: name, tagline, secondary line, founder, location, email, Instagram handle/URL, and normalized WhatsApp number. WhatsApp URL generation is centralized and URL-encodes the requested message.

`lib/data/products.ts` exports a typed immutable product collection matching the nine catalogue entries, including Corporate & Bulk Orders. Product records contain `id`, `number`, `name`, `slug`, `priceLabel`, `description`, optional variants, optional flower choices, and optional `featured`. Placeholder image paths use stable, documented public locations.

The services array contains Hampers, Bouquets, Corporate Events, and Return Gifts with catalogue-derived descriptions.

`formatINR()` formats numeric rupee values consistently using the Indian numbering system. It is not used to rewrite catalogue price labels that intentionally contain ranges or suffixes.

## 10. Temporary Showcase Page

The showcase is a disposable verification surface, not an early homepage. It uses the following sequence:

1. Introductory specimen title identifying the Phase 0 design system.
2. Exact palette swatches with token names and hexadecimal values.
3. Typography scale samples for display, h1, h2, h3, body, italic emphasis, and labels.
4. Component specimens for dividers, pills, price labels, and every button variant.
5. Light-surface animation demonstrations for Reveal, SplitTextReveal, ImageReveal, and ParallaxImage.
6. A dark-surface motion area for Float and Marquee, providing enough scroll distance to assess Lenis and ScrollTrigger.
7. A small data specimen showing that product/service records load, without turning them into public-facing catalogue sections.

The preview alternates cream, cream-soft, and forest surfaces, uses generous whitespace, and avoids navigation, promotional CTAs, final homepage copy, or final section compositions. Neutral botanical placeholder assets have fixed intrinsic dimensions and blurred loading placeholders to prevent layout shifts.

## 11. Responsive and Accessibility Behaviour

- The layout starts as a single-column mobile composition and expands into the twelve-column grid at appropriate breakpoints.
- No fixed-width content may cause overflow at 320px.
- Touch devices do not receive custom scrollbars or pointer-parallax behavior.
- All controls are reachable and clearly visible by keyboard.
- Images require useful `alt` text; purely decorative duplicate animation layers are hidden from assistive technology.
- Motion is disabled when `prefers-reduced-motion: reduce` matches, including Lenis, scroll reveals, marquees, parallax, clip animations, and floating loops.
- Content does not depend on animation to become visible.
- Heading order and section landmarks remain semantic on the temporary preview.

## 12. Placeholder Asset Policy

Phase 0 uses neutral local placeholder imagery only to validate image loading and animations. The supplied catalogue and ZIP remain visual/content references; their source images are not automatically promoted into production assets because several include social-media overlays, embedded prices, third-party marks, or inconsistent treatment.

Future assets belong in:

- `/public/brand` for the logo, favicon, and brand marks
- `/public/images/hero` for the Phase 1 ultra-HD hero flower
- `/public/images/products` for approved and retouched product imagery
- `/public/images/gallery` for editorial/lifestyle photography
- `/public/sequence` for any future image-sequence frames

## 13. Testing and Verification

Behavioral development follows test-first cycles for utilities, data invariants, reduced-motion decisions, and component output where a DOM test provides durable value. Configuration-only files and generated scaffold files are verified through the toolchain rather than artificial unit tests.

Required automated checks:

- WhatsApp messages are URL encoded correctly.
- INR formatting uses Indian separators.
- Product identifiers, numbers, and slugs are unique.
- The requested catalogue prices and service ordering remain intact.
- UI variants render correct semantic elements and accessibility attributes.
- Reduced-motion hooks and animation components expose static final content.

Required project checks:

- Prettier check
- ESLint
- TypeScript checking
- Test suite
- Next.js production build

Required browser checks:

- Desktop and 320px mobile layouts
- Full-page scrolling and Lenis/ScrollTrigger synchronization
- Every animation demo activates and cleans up without console warnings
- Reduced-motion mode shows all content without animation
- Keyboard focus is visible
- No hydration warnings, console errors, broken assets, horizontal overflow, or material layout shifts

## 14. File Structure

The implementation follows the requested `/app`, `/components`, `/lib`, and `/public` structure. Test files may be colocated with the behavior they cover or grouped under a top-level test directory, provided production imports remain clean.

No source directory alias beyond the standard `@/*` project-root alias is required. No state-management library, component library, or icon package is introduced in Phase 0.

## 15. Delivery

The handoff will include:

- The implemented project and lockfile
- A concise record of the scaffold/install commands actually used
- Asset-placement guidance
- Local run instructions using `npm run dev`
- A description of the expected showcase
- Verification results and a Phase 0 completion checklist
- Any intentional deviation caused by package compatibility or licensing, explicitly identified

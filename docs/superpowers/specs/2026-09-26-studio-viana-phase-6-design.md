# Studio Viana Phase 6 Design Specification

Date: 2026-09-26

## Intent

Phase 6 turns the approved Phase 0–5 site into a coherent, production-ready experience without redesigning its sections. The work must preserve the existing cream, forest, gold, Lora/Poppins editorial system while making motion, overlays, focus, route behavior, metadata, and performance feel like one intentional system.

The binding product brief is the user's Phase 6 prompt at `/Users/gugansaravanan/.codex/attachments/bdccd321-18cb-4f88-8897-e14a06dd8900/pasted-text.txt`. This specification resolves implementation details that the prompt leaves open.

## Accepted visual system

- Existing Phase 0–5 browser renders and fidelity ledgers remain the visual source of truth.
- No new section layouts, marketing claims, product data, or decorative component families may be introduced.
- Cream remains `#F7F0E6`, forest remains `#1F3326`, deep forest remains `#16241B`, and brand gold remains `#B8925A`. Small gold text on cream uses the existing darker accessible treatment where required.
- Lora remains the display voice and Poppins remains the interface/body voice.
- New polish must stay quiet: one cursor, one top progress line, restrained grain, unified buttons, and a single curtain transition language.

## Architecture

### Motion and device preferences

`MotionProvider` owns the effective reduced-motion preference, the stored visitor override, fine-pointer state, and low-power state. The user override has three internal values—system, reduce, and full—while the footer exposes a simple Reduce motion toggle. Low-power mode activates when save-data is enabled, hardware concurrency is at most four, or device memory is at most four gigabytes. Consumers continue to call `useReducedMotion`, which delegates to this context and retains a safe standalone fallback for isolated tests.

The single motion token module defines UI/reveal/scrub/magnetic eases, durations, label and item staggers, reveal distance, Lenis settings, and documented scroll values. Scrub timelines keep `none` easing because scroll position—not clock time—owns their progress. Cinematic intro timeline percentages remain intentional exceptions.

### Cursor and magnetic interaction

The global cursor is a client-only fixed layer enabled only for fine hover pointers with full motion. Event delegation resolves explicit `data-cursor` values first, then infers link and text states from semantic controls. GSAP quick setters update dot, ring, velocity stretch, and magnetic offsets without React renders on pointer movement. Native input cursors remain available.

`Magnetic` is a reusable wrapper for desktop-only attraction and elastic return. `RollText` and `ArrowLink` provide one accessible text/arrow transition pattern. The shared `Button` composes these primitives so existing call sites inherit the unified behavior without duplicating markup.

### Overlay stack

`OverlayManager` replaces independent scroll-lock and Escape handlers with one ordered stack. Each overlay registers an id, root element, close callback, initial-focus target, and return-focus target. The manager locks native scrolling once, stops Lenis once, traps focus only in the top overlay, closes only the top overlay on Escape, restores focus when an item leaves the stack, resets cursor state, and exposes whether any overlay is open to floating controls.

Product detail, gallery lightbox, bag, and mobile navigation keep their current layouts but adopt the shared backdrop, clipped panel, content stagger, and faster exit timings. Existing URL and browser-history behavior for the product overlay is preserved.

### Routes and transitions

The home overlay stays intact. `/collection/[slug]` is a server-rendered, statically generated product route sourced from `products.ts`, with canonical metadata, Product/Offer and BreadcrumbList JSON-LD, a crawlable product presentation, and order actions. `/privacy` and `/terms` are visibly marked draft legal pages. `not-found.tsx` provides the requested wandering-bloom message and reduced-motion-safe line drawing.

A root template mounts a client transition layer. Same-origin pathname navigation is intercepted only for unmodified primary clicks; hash links, downloads, external targets, modifier clicks, and current-path links keep native behavior. The curtain covers before `router.push`, then clears after the pathname changes. Back/forward navigation receives the enter half of the transition. Every route change scrolls to the top and refreshes ScrollTrigger after fonts and layout settle.

### Atmosphere and optional audio

Cream pages receive one static paper texture and dark sections receive a low-opacity stepped grain layer. Grain and glow animations pause outside their observed section and stop for reduced motion or low power. A one-pixel progress line is hidden until the cinematic intro completes. The theme-color meta element follows the active `data-theme` section.

Ambient sound remains absent and off by default. The server checks for `/public/audio/ambient.mp3`; no request or toggle is rendered when the file is absent. If supplied, the client uses one HTMLAudioElement with remembered opt-in, 0.25 volume, fade in/out, visibility pause/resume, and no autoplay.

### Performance

- Existing static image imports continue through `next/image`, preserving intrinsic dimensions and generated blur placeholders.
- `scripts/optimize-images.mjs` uses Sharp to cap source dimensions at 2560 pixels and create 480, 768, 1280, 1920, and 2560 WebP/AVIF derivatives without overwriting originals unless explicitly requested.
- Intro sequence loading keeps its priority-frame-first order and gains device-aware DPR/frame behavior.
- Heavy overlays and Phase 5 conversion sections stay dynamically imported and load on intent/approach.
- Persistent loops use intersection and visibility controls; low-power mode removes grain, particles, nonessential floats, and long pins.
- Next headers cache versioned static assets immutably while public editable assets receive a long revalidation cache rather than a false immutable guarantee.
- Bundle analysis is opt-in through `ANALYZE=true` so normal builds stay unchanged.

### Accessibility

The first focusable control is a branded skip link targeting `#main-content`. The document language is `en-IN`. Every new route has one h1 and logical landmarks. Existing dialogs retain correct names and modal semantics through the shared manager. Focus indicators, 44-pixel targets, alt text, live errors, labels, and autocomplete are audited in touched flows. Reduced motion covers CSS, GSAP, Framer Motion, cursor, magnetic behavior, grain, progress smoothing, and route transitions.

The final report will include concrete VoiceOver/NVDA test instructions and mark only actually executed assistive-technology tests as verified.

### SEO and social

Metadata uses a shared site origin and `%s — Studio Viana` title template. Home, legal, not-found, and product routes receive canonical descriptions and route titles. Generated Open Graph images use the existing palette, mark, product name/price, and imagery without adding copy to visible pages. The sitemap lists home, legal routes, and all eight catalogue routes. Robots, manifest, SVG icon, generated app icons, and analytics placeholder are server-safe and crawlable.

## Testing and evidence

1. Unit/component tests cover device classification, motion override persistence, cursor states, magnetic fallback, overlay stack ordering/focus, metadata builders, sitemap/robots/manifest, product route content/schema, and image-tool argument handling.
2. Existing suites protect all Phase 0–5 behavior.
3. Production Playwright covers cursor enablement, reduced-motion fallback, skip link, overlay stack, route/deep-link/back-forward behavior, metadata endpoints, widths from 360 to 2560, 200% zoom, no-JavaScript readability, and runtime errors.
4. Lighthouse runs use a production server and system Chrome when the CLI is available. Scores are reported as measured; target misses are not rewritten as passes.
5. Browser claims remain evidence-scoped. Automated system Chrome is required. Firefox/WebKit are run only if their local Playwright binaries are available; Safari/iOS/Samsung-specific rows otherwise remain documented manual launch checks.
6. Final screenshots are visually compared against the accepted Phase 0–5 reference set and recorded in the Phase 6 fidelity ledger.

## Owner dependencies and intentional limits

- A licensed ambient file is not fabricated. Recommended source and compression guidance are documented, and the UI stays hidden until the owner supplies `public/audio/ambient.mp3`.
- The production domain remains `https://studioviana.com` from the current site data and must be confirmed before deployment.
- Privacy and terms copy is explicitly labeled draft and requires legal review.
- Rich Results validation is prepared and locally schema-tested; public Google validation requires a deployed crawlable URL.
- Final catalogue PDF, confirmed delivery/payment policy, final commissioned photography, testimonials, and launch analytics remain owner/deployment inputs rather than Phase 6 code gaps.

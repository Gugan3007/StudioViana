# Phase 6 — final polish and production readiness

Phase 6 keeps the approved Phase 0–5 layout, palette, typography, imagery and section order. It consolidates behavior that had accumulated across phases and adds the route, metadata, accessibility and performance surface needed for release.

## Delivered systems

- One effective motion preference (`system`, `reduce`, or `full`) with low-power detection and a footer control.
- Fine-pointer-only custom cursor, semantic cursor states, magnetic controls and shared roll/arrow micro-interactions.
- One ordered overlay stack for product detail, lightbox, order bag, mobile menu and mobile order summary.
- Restrained film grain, scroll progress and dynamic `theme-color`; optional ambient audio is absent unless the owner supplies `public/audio/ambient.mp3`.
- Eight static `/collection/[slug]` routes, draft legal routes, not-found page, canonical metadata, JSON-LD, sitemap, robots, manifest, icons and generated social images.
- Non-destructive Sharp image planning, opt-in bundle analysis, explicit public-asset cache policies and low-power intro settings.

## Motion values

| Boundary             |        Value | Notes                                        |
| -------------------- | -----------: | -------------------------------------------- |
| Fast feedback        |        0.4 s | Controls and compact state changes           |
| Base reveal          |        0.8 s | Standard editorial reveal                    |
| Slow reveal          |        1.2 s | Large composed sections                      |
| Cinematic            |        1.8 s | Intentional hero moments only                |
| Item stagger         |       0.08 s | Lists and overlay content                    |
| Overlay enter / exit | 0.5 / 0.35 s | Exit remains faster than entrance            |
| Lenis lerp           |         0.14 | Disabled when effective reduced motion is on |
| Intro scrub          |         0.35 | Linear scrub easing is intentional           |

The CSS data fallback, GSAP and Framer Motion consumers all use the effective preference. Scrub animations are deliberate exceptions to clock-based easing because scroll position owns their state.

## Accessibility audit

Automated checks verify the first-focus skip link, `en-IN`, reduced-motion override, overlay focus containment/restoration, top-most Escape ownership, form autocomplete, live error semantics, 44 px compact targets, route landmarks and one h1 per route fixture. Focus rings use dark gold on cream and light gold on forest.

Manual release checks still required:

- VoiceOver + Safari: landmarks, skip link, collection, lightbox, order builder and route transitions.
- NVDA + Chrome: headings, live validation, bag updates, dialog names and focus return.
- 200% browser zoom and keyboard-only traversal at 360, 768, 1440 and 2560 CSS pixels.
- iOS Safari, Samsung Internet and macOS Safari launch-device smoke tests.

No manual assistive-technology result is claimed until it is actually executed and recorded in the Phase 6 fidelity ledger.

## SEO checklist

- Canonical origin: `https://studioviana.com` (owner must confirm before deployment).
- Home + privacy + terms + eight product routes in `sitemap.xml`.
- Product, Offer and BreadcrumbList JSON-LD generated from `lib/data/products.ts`.
- Open Graph/Twitter metadata and generated brand/product images.
- `robots.txt`, web manifest, SVG favicon and generated app icons.
- Privacy and terms pages visibly marked draft pending legal review.

## Performance evidence

| Evidence                  | Phase 5 build |                         Phase 6 build |
| ------------------------- | ------------: | ------------------------------------: |
| `.next/static` disk size  |      31.48 MB |                              31.62 MB |
| JavaScript chunks on disk |       1.59 MB |                               1.72 MB |
| Planned image derivatives |             — |   388 (dry-run, no originals changed) |
| Analyzer reports          |             — | client, Node.js and edge HTML reports |

The bundle increase includes the cursor, overlay manager, atmosphere, route transition and generated route clients. Final Lighthouse and long-task measurements belong to production-browser QA and are recorded separately rather than inferred from bundle size.

## Maintenance

- Product and price copy: `lib/data/products.ts`
- Studio/contact/config: `lib/data/site.ts`
- Motion tuning: `lib/animations/tokens.ts` and `components/intro/intro.config.ts`
- Order routing: `ORDER_MODE` in `lib/data/site.ts`
- Image dry run: `npm run images:optimize -- --input public/images --dry-run`
- Bundle reports: `npm run analyze`
- Full verification: `npm run check` then production Playwright

## Owner dependencies

- Confirm production domain and analytics/consent provider.
- Obtain legal approval for privacy, terms, delivery, payment and cancellation copy.
- Supply the final catalogue PDF, licensed ambient track if desired, final photography and approved testimonials.
- Re-run browser, Lighthouse and image evidence after asset replacement or policy changes.

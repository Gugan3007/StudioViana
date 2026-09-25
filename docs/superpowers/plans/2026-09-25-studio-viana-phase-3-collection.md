# Studio Viana Phase 3 — Collection implementation plan

> Execute inline with `superpowers:executing-plans`. Use TDD for every behavior change and run one fresh whole-branch review at the end.

**Spec:** `docs/superpowers/specs/2026-09-25-studio-viana-phase-3-collection-design.md`  
**Concept:** `docs/superpowers/concepts/phase-3/collection-desktop.png`  
**Base:** `e191d95`  
**Goal:** deliver the complete indexed Collection, responsive gallery, URL-synced product detail/configurator, corporate CTA and Grand Bouquet showcase without rewriting Phases 0–2.

## Global constraints

- Keep TypeScript strict and use the existing GSAP/Lenis/Framer Motion wrappers.
- Do not add a state-management dependency; the cursor store is a tiny external store.
- Product media must be local static imports with useful alt text and stable aspect ratios.
- Desktop/tablet use horizontal pinning only when motion is allowed; mobile and reduced motion use vertical flow.
- No task is complete until its focused tests and `npm test` pass.

## Review Focus

- Direct and Back-button product URLs must never desynchronise the dialog or destroy unrelated query parameters.
- Mobile/reduced-motion content must not depend on the desktop horizontal ScrollTrigger or hide any product/price/action.
- Opening/closing/switching detail products must stop/restart Lenis exactly once, preserve focus, and leave ScrollTrigger geometry valid.
- Quantity/size/options must produce correct totals and encoded WhatsApp content for every product class.
- Horizontal resize/rebuild must clean every tween/trigger/listener and retain index-to-panel navigation.
- Touch/coarse-pointer users must not receive cursor-follow, lens, drag, or infinite particle motion.

---

### Task 1: Typed catalogue, messages and placeholder asset contract

**Files:** modify `lib/data/products.ts`; create `lib/utils/whatsapp.ts`; create `tests/products-phase-three.test.ts`; add Phase 3 product images.

**Produces:** `catalogueProducts`, `corporateProduct`, `getProductBySlug`, `OrderConfiguration`, `orderMessage`, and `enquiryMessage`.

1. Write failing data/message tests for all required fields, eight numbered products, the corporate record, base/variant and fully configured messages, quantity totals, and safe lookup.
2. Run `npm test -- tests/products-phase-three.test.ts` and confirm RED.
3. Extend the typed records and add helpers. Copy existing generated photography to every exact development filename without changing source files.
4. Run focused tests and `npm test`.
5. Commit `feat: model the phase three catalogue`.

### Task 2: Collection intro and interactive index

**Files:** create `components/sections/collection/CollectionIntro.tsx`, `CollectionIndex.tsx`, `CollectionSection.tsx`; create `lib/store/cursorStore.ts`; create `tests/collection-intro.test.tsx`.

**Produces:** semantic intro/index, mobile thumbnails, fine-pointer preview, configurable `onSelectProduct` contract, cursor state attributes.

1. Write failing render/keyboard/selection tests for exact copy, eight rows, prices, mobile thumbnails and selected slug.
2. Confirm RED, implement the intro/index with scoped line reveals and `quickTo` preview.
3. Run focused tests and full unit suite.
4. Commit `feat: create the collection index`.

### Task 3: Product panels and responsive gallery engine

**Files:** create `VariantThumbs.tsx`, `ProductPanel.tsx`, `GalleryProgress.tsx`, `CorporateCTAPanel.tsx`, `MobileProductCard.tsx`, `HorizontalGallery.tsx`; create `tests/collection-gallery.test.tsx`.

**Produces:** variant/image state, WhatsApp actions, desktop/tablet pinned track, progress/controller API, vertical mobile/reduced layout and corporate endpoint.

1. Write failing tests for all nine panels/cards, variant swaps, flower pills, messages, progress, keyboard arrows and reduced/mobile mode markers.
2. Confirm RED, implement content components first, then one `gsap.matchMedia` gallery timeline with cleanup and documented horizontal math/containerAnimation.
3. Run focused tests and full unit suite.
4. Commit `feat: build the responsive collection gallery`.

### Task 4: URL-owned accessible product detail

**Files:** create all modules under `components/product/`; create `tests/product-detail.test.tsx` and `tests/product-query.test.tsx`.

**Produces:** lazy detail overlay, query/history controller, focus trap, image/lens gallery, option form, accordions and related products.

1. Write failing query/history tests and interaction tests for open/direct URL/back/Escape/backdrop/focus, variants, quantity, small size pricing, palette/occasion/message, total, accordion and related switching.
2. Confirm RED, implement query hook and semantic controls before animation. Add layout IDs and clip wipes without making animation the state authority.
3. Run focused tests and full unit suite.
4. Commit `feat: add the product detail experience`.

### Task 5: Grand Bouquet showcase and complete page integration

**Files:** create `PearlParticles.tsx`, `GrandBouquetShowcase.tsx`; finish `CollectionSection.tsx`; modify `app/page.tsx` and minimal `app/globals.css`; modify `tests/home-page.test.tsx`; create `tests/grand-bouquet.test.tsx`.

**Produces:** exact route order, dark showcase/detail actions, paused/off-screen pearl motion, preserved Pricing/Contact shells.

1. Write failing page/showcase tests for section ownership/order, exact signature copy, theme, action callbacks and reduced/static particles.
2. Confirm RED, mount the complete Collection and retain only Pricing/Contact shells.
3. Run focused tests and full unit suite.
4. Commit `feat: complete the phase three collection story`.

### Task 6: Production browser coverage and performance

**Files:** create `tests/browser/phase-three.spec.ts`; update any component only for reproduced failures.

**Produces:** browser evidence for index→panel, horizontal forward/back, variants, URL/detail close modes, focus, WhatsApp, lens, mobile stack/sticky header, tablet, reduced motion, resize, assets, overflow and normal-motion long-task budget.

1. Write the browser suite and run against production; diagnose every failure from evidence.
2. Capture final desktop/mobile/index/detail/showcase screenshots and inspect them beside the concept.
3. Run `npm run format:check`, lint, typecheck, units, build and all Phase 1–3 browser suites.
4. Commit `test: verify the phase three collection`.

### Task 7: Delivery guide and fidelity ledger

**Files:** create `docs/phase-3-collection.md`, `docs/superpowers/phase-3-fidelity-ledger.md`; update `README.md`.

**Produces:** exact image inventory/sizes, tweak values, testing checklist, comparison evidence and Phase 4 handoff.

1. Document runtime ownership, asset replacement and tuning points.
2. Record at least five concrete concept/render observations for intro, gallery, detail, mobile and showcase.
3. Run the complete final gate and commit `docs: complete phase three delivery guide`.

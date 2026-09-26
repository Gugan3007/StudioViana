# Studio Viana Phase 5 Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the Phase 5 conversion layer—pricing, custom ordering, corporate enquiries, FAQ, contact, footer, floating WhatsApp, and persistent order bag—inside the existing one-page Studio Viana experience.

**Architecture:** Preserve the existing server-rendered page shell and product data. Add typed configuration and pure utility modules first, then build independently testable section clients. Use Zustand for debounced persistent order and bag state, Zod for validation, Framer Motion for state transitions, existing GSAP/Lenis helpers for scroll integration, and custom browser events only for decoupled cross-section entry and overlay visibility.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Zustand, Zod, Framer Motion, GSAP/ScrollTrigger, Lenis, Vitest, Testing Library, Playwright.

---

## Task 1: Configuration, validation, stores, and message foundations

**Files:**

- Modify: `package.json`, `package-lock.json`, `lib/data/site.ts`, `lib/utils/whatsapp.ts`
- Create: `lib/utils/formatINR.ts`, `lib/validation/orderSchema.ts`, `lib/store/orderStore.ts`, `lib/store/bagStore.ts`, `lib/data/faq.ts`, `lib/seo/schema.ts`
- Test: `tests/phase-five-foundations.test.ts`, `tests/phase-five-stores.test.ts`

- [ ] Write failing tests for Indian currency formatting, order/bulk/bag messages, mailto encoding, builder and bulk schemas, price estimation, store reset/hydration-safe persistence, and all JSON-LD graph types.
- [ ] Run `npm test -- tests/phase-five-foundations.test.ts tests/phase-five-stores.test.ts` and confirm the expected module failures.
- [ ] Install `zod` and `zustand`.
- [ ] Add all editable Phase 5 options to `site.ts`, including `ORDER_MODE`, lead time, hours, regions, catalogue path, palette, flower, occasion, wrap, and bulk options.
- [ ] Implement pure formatting/message/schema/SEO functions and typed stores with browser-guarded debounced persistence.
- [ ] Run the focused tests, `npm run typecheck`, and `npm run lint`.
- [ ] Commit: `feat: add phase five order foundations`

## Task 2: Pricing guide and product-detail/order routing

**Files:**

- Create: `components/sections/pricing/PricingSection.tsx`, `components/sections/pricing/PricingRow.tsx`, `components/sections/pricing/CustomisationNote.tsx`, `lib/utils/orderEntry.ts`
- Modify: `components/sections/collection/CollectionSection.tsx`, `components/sections/collection/ProductPanel.tsx`, `components/product/ProductOptions.tsx`
- Test: `tests/pricing-phase-five.test.tsx`, `tests/order-entry-phase-five.test.tsx`

- [ ] Write failing component tests for all nine pricing rows, real DOM prices, mobile actions, custom note, configurable chips, catalogue path, product-detail event dispatch, corporate scroll, and order-mode routing.
- [ ] Run the focused tests and confirm failures.
- [ ] Build the editorial pricing list with reduced-motion count behaviour and CSS/Framer hover affordances.
- [ ] Implement one order-entry helper/event contract and wire existing product calls without regressing direct WhatsApp mode.
- [ ] Run focused tests and `npm run typecheck`.
- [ ] Commit: `feat: build the editorial pricing guide`

## Task 3: Five-step custom order builder

**Files:**

- Create: `components/sections/order/OrderBuilder.tsx`, `components/sections/order/StepProgress.tsx`, `components/sections/order/StepPiece.tsx`, `components/sections/order/StepFlowers.tsx`, `components/sections/order/StepPalette.tsx`, `components/sections/order/StepDetails.tsx`, `components/sections/order/StepReview.tsx`, `components/sections/order/OrderSummary.tsx`, `components/sections/order/MobileSummarySheet.tsx`, `components/sections/order/MessageCardPreview.tsx`, `components/sections/order/OrderSuccess.tsx`
- Test: `tests/order-builder-phase-five.test.tsx`, `tests/order-builder-validation.test.tsx`

- [ ] Write failing tests covering prefill, forward/back/edit, product-specific quantities and sizes, three-colour maximum, custom palette input, date minimum/urgency, delivery area, identity validation, summary price, WhatsApp/email URLs, success/reset, and mobile summary accessibility.
- [ ] Run the focused tests and confirm failures.
- [ ] Build the stable-height, direction-aware, keyboard-friendly five-step flow against the order store and schemas.
- [ ] Add summary crossfades, estimated price animation, mobile sheet focus/scroll lock, bag hand-off consumption, and ScrollTrigger refresh.
- [ ] Run focused tests, `npm run typecheck`, and `npm run lint`.
- [ ] Commit: `feat: add the custom order concierge`

## Task 4: Corporate enquiry and FAQ

**Files:**

- Create: `components/sections/corporate/CorporateSection.tsx`, `components/sections/corporate/BulkEnquiryForm.tsx`, `components/sections/corporate/ClientLogos.tsx`, `components/sections/faq/FAQSection.tsx`, `components/sections/faq/AccordionItem.tsx`
- Test: `tests/corporate-phase-five.test.tsx`, `tests/faq-phase-five.test.tsx`

- [ ] Write failing tests for corporate copy/use-cases/features, empty logo suppression, validation, message links, success state, eight editable FAQ entries, one-open accordion behaviour, and ARIA relationships.
- [ ] Run focused tests and confirm failures.
- [ ] Build the framed forest corporate layout, reused-image collage, compact form, and reduced-motion-safe interaction.
- [ ] Build the sticky FAQ layout and single-open accessible animated accordion.
- [ ] Run focused tests and `npm run typecheck`.
- [ ] Commit: `feat: create corporate enquiries and faq`

## Task 5: Contact and footer

**Files:**

- Create: `components/sections/contact/ContactSection.tsx`, `components/sections/contact/ContactRow.tsx`, `components/sections/contact/RotatingRingImage.tsx`, `components/layout/Footer.tsx`, `components/layout/BigWordmark.tsx`, `components/layout/BackToTop.tsx`
- Test: `tests/contact-phase-five.test.tsx`, `tests/footer-phase-five.test.tsx`

- [ ] Write failing tests for all contact links and editable copy, clipboard feedback, ring/image semantics, footer groups and product events, newsletter mailto, accordions, and native/Lenis back-to-top behaviour.
- [ ] Run focused tests and confirm failures.
- [ ] Build the full-height contact finale with existing imagery and low-count ambient particles.
- [ ] Build the responsive footer, large masked wordmark, product/section links, newsletter action, thank-you moment, and scroll-progress back-to-top.
- [ ] Run focused tests and `npm run typecheck`.
- [ ] Commit: `feat: complete contact and closing footer`

## Task 6: Global bag, floating WhatsApp, and navigation

**Files:**

- Create: `components/layout/FloatingWhatsApp.tsx`, `components/layout/OrderBagButton.tsx`, `components/layout/OrderBagDrawer.tsx`, `lib/context/OverlayContext.tsx`
- Modify: `components/layout/Navbar.tsx`, `components/layout/MobileMenu.tsx`, `components/product/ProductDetail.tsx`, `components/product/ProductOptions.tsx`, `app/layout.tsx`
- Test: `tests/order-bag-phase-five.test.tsx`, `tests/global-touchpoints-phase-five.test.tsx`, `tests/navigation.test.tsx`, `tests/product-detail.test.tsx`

- [ ] Write failing tests for add/update/remove totals, navbar badge, drawer focus and Lenis lock, combined message, builder hand-off, intro-gated WhatsApp, overlay hide/show, active new navigation items, and configurable product order actions.
- [ ] Run focused tests and confirm failures.
- [ ] Add the overlay coordinator, persisted bag controls/drawer, product-detail add action, floating WhatsApp, and updated desktop/mobile navigation.
- [ ] Wire the drawer's hand-off to populate the builder and move to step 4.
- [ ] Run focused tests, `npm run typecheck`, and `npm run lint`.
- [ ] Commit: `feat: wire global order touchpoints`

## Task 7: Page composition, lazy boundaries, and SEO

**Files:**

- Modify: `app/page.tsx`, `app/layout.tsx`, `app/globals.css`
- Create: `components/sections/phase-five/PhaseFiveSections.tsx`
- Test: `tests/home-page.test.tsx`, `tests/phase-five-page.test.tsx`

- [ ] Write failing tests for exact final section order, ids/themes, heading hierarchy, sanitized LocalBusiness/Product/FAQ JSON-LD, and dynamic loading placeholders with fixed minimum heights.
- [ ] Run focused tests and confirm failures.
- [ ] Replace Phase 5 shells with the finished sequence and add lazy client boundaries/preload-on-approach behaviour at the appropriate client seam.
- [ ] Add sanitized JSON-LD and all shared responsive/reduced-motion Phase 5 styles.
- [ ] Run focused tests, `npm run typecheck`, and `npm run build`.
- [ ] Commit: `feat: compose the phase five conversion journey`

## Task 8: Browser verification, fidelity, and handoff documentation

**Files:**

- Create: `tests/browser/phase-five.spec.ts`, `docs/phase-5-conversion.md`, `docs/superpowers/phase-5-fidelity-ledger.md`
- Modify: any Phase 5 file only where verification exposes a defect

- [ ] Write Playwright coverage for pricing interactions, all builder paths, storage restore, outbound URLs, bulk form, FAQ, copy feedback, floating control visibility, bag flow, footer/back-to-top, mobile layout, reduced motion, overflow, console errors, and core Web Vitals proxies.
- [ ] Run browser tests against production build at desktop and mobile sizes.
- [ ] Capture and visually inspect screenshots for pricing/builder, corporate/FAQ, contact/footer, bag drawer, and mobile builder; compare against the concept references and record at least five concrete comparisons.
- [ ] Run `npm run check`, then the complete production Playwright suite.
- [ ] Perform a self-review because repository policy for this run prohibits spawning review subagents; fix every high/medium finding with focused regression coverage.
- [ ] Document editable config, three exact example messages, the complete testing checklist, architecture seams, and known catalogue-PDF owner action.
- [ ] Commit: `docs: complete the phase five conversion layer`

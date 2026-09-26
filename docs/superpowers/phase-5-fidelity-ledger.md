# Phase 5 fidelity ledger

Date: 2026-09-26
Branch: `performance-polish`

## Accepted references

- Pricing and order: `/Users/gugansaravanan/.codex/generated_images/01a0d4b3-2fb4-71d1-b37d-33ab38a733d1/exec-199935b7-e43f-4621-9199-eeaa85189642.png`
- Corporate: `/Users/gugansaravanan/.codex/generated_images/01a0d4b3-2fb4-71d1-b37d-33ab38a733d1/exec-1cb819a3-8286-4b7d-9d7b-13190098fa3f.png`
- FAQ: `/Users/gugansaravanan/.codex/generated_images/01a0d4b3-2fb4-71d1-b37d-33ab38a733d1/exec-090d47d0-4d48-41f6-9a31-56c13109be97.png`
- Contact: `/Users/gugansaravanan/.codex/generated_images/01a0d4b3-2fb4-71d1-b37d-33ab38a733d1/exec-4368128b-4631-4f10-843b-8cc1748d83e1.png`
- Footer and order drawer: `/Users/gugansaravanan/.codex/generated_images/01a0d4b3-2fb4-71d1-b37d-33ab38a733d1/exec-f6a58ab0-e832-401c-97fa-9ef34014d4ba.png`

## Production evidence

- `/tmp/studio-viana-phase-5-pricing.png`
- `/tmp/studio-viana-phase-5-order.png`
- `/tmp/studio-viana-phase-5-corporate.png`
- `/tmp/studio-viana-phase-5-faq.png`
- `/tmp/studio-viana-phase-5-contact.png`
- `/tmp/studio-viana-phase-5-footer.png`
- `/tmp/studio-viana-phase-5-bag.png`
- `/tmp/studio-viana-phase-5-mobile-builder.png`

The desktop captures use 1280 px or 1440 px viewports. The mobile builder uses a native touch-enabled 375×780 viewport with reduced motion. Every production capture was visually inspected, rather than inferred from component markup.

## Concrete comparison ledger

1. **Pricing hierarchy:** production preserves the reference's oversized serif title, four-column editorial rule system, restrained cream field, real right-aligned prices and hover-revealed actions. Mobile deliberately converts the row into a persistent tap action because hover-only ordering would be inaccessible.
2. **Builder composition:** the reference's framed working card and live companion summary become a 3:2 desktop split with a stable-height stage. Production adds explicit five-step progress, kind inline validation and edit links; the reduced-motion mobile capture replaces the sidebar with the scoped bottom estimate sheet.
3. **Corporate atmosphere:** the forest field, inset gold frame, large left-aligned serif statement and layered product collage map directly to the concept. The enquiry form stays inside the same framed chapter so the conversion action does not read as a separate generic form.
4. **FAQ restraint:** production keeps the concept's sticky oversized “Good to know” introduction, spacious gold hairlines and single-open right column. It avoids card shadows and heavy containers, matching the quiet editorial reference.
5. **Contact ceremony:** the circular flower-card portrait, rotating gold text ring, centered oversized invitation, three hairline contact rows and paired actions retain the reference's full-height finale. Production reduces the contact-value type slightly at desktop/tablet widths so long addresses remain inside their grid columns and every copy button remains operable.
6. **Footer close:** the implementation keeps the concept's forest-deep field, monumental outlined wordmark, grouped navigation, centered brand mark, newsletter rule, thank-you line and small progress-ring back-to-top control. Mobile groups collapse into native disclosure elements.
7. **Order drawer:** the right-side cream drawer, dimmed page, concise item rows, quantity steppers, total and two stacked actions match the reference. Production derives imagery and pricing from product slugs, persists only serializable data and hides the floating WhatsApp control while the drawer owns focus.
8. **Colour and typography:** every chapter retains the established forest, warm cream, blush/lilac imagery and antique-gold hairlines. Lora remains the narrative and product voice; Poppins remains the utility voice, with darker gold used where small cream-background text needs accessible contrast.

## Verified refinements found during the live audit

- The mobile fixed estimate bar originally appeared outside the order section and competed spatially with WhatsApp. It now mounts visually only while the builder intersects the viewport, closes on exit and owns the higher in-builder layer.
- Long contact values could cross into an adjacent column and block its copy control. Contact columns now use `minmax(0,1fr)`, bounded type, anywhere wrapping and an isolated copy-button hit area.
- Back-to-top used a two-second Lenis animation even when the visitor requested reduced motion. It now jumps immediately through Lenis, or uses native `auto` behaviour without Lenis.
- The “Clear this order” control was visually small on touch screens. Its hit area is now at least 44 px without making the label visually heavy.
- The browser suite can opt into installed system Chrome without weakening the default managed-Chromium CI path.
- Deferred conversion chunks now activate from the lead marker or any visible reserved shell, so initial hydration stays light without breaking restored scroll positions or direct section anchors.

## Intentional deviations and owner dependencies

- The static concepts imply a visual checkout endpoint; production correctly stops at WhatsApp/email because Phase 5 explicitly excludes checkout and payment.
- The corporate logo strip is absent because no approved logos were supplied. Its component renders nothing for an empty list.
- Reused product photography is intentionally retained for Phase 5. Final commissioned imagery remains an owner dependency and should preserve the existing crop/import boundaries.
- Delivery and payment FAQ answers remain editable placeholders marked in source until the owner confirms policy.
- The catalogue action is complete, but the configured PDF file must be supplied by the owner before launch.
- Browser release evidence is Chromium/Google Chrome scoped; Safari and Firefox are not claimed as separately verified.

## Verification and signoff

- `npm run check`: passed, including formatting, ESLint, TypeScript, 44 test files / 176 tests, and the optimized production build.
- Focused production Phase 5 browser suite: 5 / 5 passed after the restored-scroll regression fix.
- Complete production browser suite: 52 / 52 passed in system Chrome, covering desktop, touch mobile, reduced motion, no-JavaScript fallbacks, responsive overflow, layout stability, modal focus, persisted orders, and long-task budgets.

Agency-grade fidelity ruling: Phase 5 matches the accepted conversion concepts in composition, hierarchy, colour, interaction tone and responsive intent. Remaining launch dependencies are owner-supplied policy, catalogue and final photography—not missing conversion functionality.

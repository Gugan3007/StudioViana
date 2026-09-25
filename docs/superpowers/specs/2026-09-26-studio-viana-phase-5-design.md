# Studio Viana Phase 5 — Conversion Layer Design

**Date:** 2026-09-26  
**Status:** Approved for native implementation by the user's Phase 5 brief  
**Source brief:** `/Users/gugansaravanan/.codex/attachments/c0fd806d-81e1-47f9-a4d6-262c211a8291/pasted-text.txt`

## Intent

Phase 5 turns Studio Viana's editorial one-page story into a complete enquiry and ordering experience without changing the visual language or rewriting Phases 0–4. The conversion layer must feel calm, tactile, and precise while removing ordering ambiguity. Every path terminates in a preformatted WhatsApp message or email because there is no backend or payment gateway in this phase.

## Visual direction

The existing cream, forest, deep-forest, gold, charcoal, blush, and lilac tokens remain authoritative. Lora continues to carry display and product language; Poppins carries labels, controls, and supporting copy. Small gold text on cream uses a darker accessible gold treatment where required. Borders are single-pixel gold hairlines, panels are editorial rather than card-heavy, and animations use transforms, opacity, or clip-path.

Image-generation concepts are composition references only and are not production assets:

- Pricing and order builder: `/Users/gugansaravanan/.codex/generated_images/01a0d4b3-2fb4-71d1-b37d-33ab38a733d1/exec-199935b7-e43f-4621-9199-eeaa85189642.png`
- Corporate section: `/Users/gugansaravanan/.codex/generated_images/01a0d4b3-2fb4-71d1-b37d-33ab38a733d1/exec-1cb819a3-8286-4b7d-9d7b-13190098fa3f.png`
- FAQ: `/Users/gugansaravanan/.codex/generated_images/01a0d4b3-2fb4-71d1-b37d-33ab38a733d1/exec-090d47d0-4d48-41f6-9a31-56c13109be97.png`
- Contact: `/Users/gugansaravanan/.codex/generated_images/01a0d4b3-2fb4-71d1-b37d-33ab38a733d1/exec-4368128b-4631-4f10-843b-8cc1748d83e1.png`
- Footer and order drawer: `/Users/gugansaravanan/.codex/generated_images/01a0d4b3-2fb4-71d1-b37d-33ab38a733d1/exec-f6a58ab0-e832-401c-97fa-9ef34014d4ba.png`

## Section architecture

### Pricing

The cream pricing section uses a restrained editorial list. Desktop rows expose collection, details, price, thumbnail, and action through hover; mobile rows become tap-friendly stacked cards. Values animate only once in view and resolve immediately for reduced motion. Product rows dispatch the existing product-detail event; Corporate scrolls to its section. The customisation note, configurable lead-time chips, and catalogue link close the section.

### Custom order builder

The builder is a five-step client-side concierge with a persistent typed Zustand store and Zod validation. The left pane contains the active step and the right pane is a sticky live summary. Mobile replaces the sticky card with a collapsed estimate bar and accessible bottom sheet. State writes to localStorage through a debounced subscription, not on every render. A pure estimator and pure message builder keep price calculation and outbound copy testable. `submitOrder` remains the seam for a later API.

Builder navigation uses direction-aware Framer Motion transitions, a stable minimum-height stage, and simple fades under reduced motion. Step validation is kind and local: product before flowers, palette before details, and valid identity/delivery fields before review. Existing products can open the builder prefilled by dispatching a single global event when `ORDER_MODE` is `builder`.

### Corporate

A deep forest framed section combines editorial copy and a three-image floating collage made from existing product photography. Below, a compact Zod-validated bulk enquiry form formats WhatsApp and email messages. Client-logo markup renders only when configured data exists.

### FAQ

FAQ uses a sticky left introduction and a single-open-item accordion on the right. Answers are stored in `lib/data/faq.ts`; placeholder business policy content is visibly marked in source data. FAQ data also produces the SEO FAQPage graph.

### Contact

The contact finale is a centered dark composition with a circular product photograph and rotating text ring, line-revealed heading, copyable contact rows, two strong contact actions, editable region and business-hour copy, and a small reduced-motion-aware ambient particle field.

### Footer and global ordering

The footer provides the grand closing wordmark, product and section links, a mailto newsletter affordance, a measured back-to-top progress ring, and mobile accordions. A persistent Zustand order bag powers the navbar badge and a lazily mounted drawer. Product detail can add configurations to the bag. The drawer supports quantity changes, removal, a combined WhatsApp message, and a documented bag-to-builder hand-off at step 4.

A floating WhatsApp control appears only after the intro and hides whenever a modal, menu, bag, or mobile summary sheet is open. Overlay visibility is communicated through one document-level custom event so independently lazy-loaded surfaces remain decoupled.

## Data and configuration

Editable site data owns lead time, hours, delivery regions, catalogue path, order mode, builder palettes, flowers, occasions, wrap styles, and bulk ranges. Product prices remain in `products.ts`. The store keeps serializable identifiers, not imported image objects; views derive product records from those identifiers.

## Accessibility and responsive behaviour

- Native labels, fieldsets, controls, focus rings, and live error regions are mandatory.
- Dialogs trap focus, close on Escape, restore focus, and stop Lenis.
- Every chip is a native button or labelled input with at least a 44px target.
- Mobile pricing, form stages, contact rows, and footer columns stack without horizontal overflow.
- Reduced motion shows final values immediately, removes decorative drift/rotation, and replaces lateral step transitions with fades.
- Small text contrast is at least 4.5:1; gold is decorative or darkened when used as body text.

## SEO and performance

The page renders sanitized LocalBusiness, Product/Offer or AggregateOffer, and FAQPage JSON-LD. Order builder, corporate form, FAQ accordion, and bag drawer are split at client boundaries, with near-viewport preloading where practical. Local images retain intrinsic dimensions through static imports. Dynamic mounts refresh ScrollTrigger without layout-shifting the page.

## Out of scope

No checkout, payment gateway, API persistence, newsletter service, file upload, inventory system, or CRM integration is introduced. The catalogue link may 404 until the owner adds the supplied PDF path, as specified in the brief.

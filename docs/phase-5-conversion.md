# Phase 5 — Conversion layer operations guide

Phase 5 completes the Studio Viana one-page journey with an editorial pricing guide, a persistent five-step custom-order concierge, corporate enquiries, FAQ, contact, footer, a floating WhatsApp action, and a persistent order bag. Submission remains intentionally backend-free: the final action opens a preformatted WhatsApp conversation or email.

## Run and verify

```bash
npm run dev
npm run check
PLAYWRIGHT_SYSTEM_CHROME=true PLAYWRIGHT_PRODUCTION=true npx playwright test
```

`PLAYWRIGHT_SYSTEM_CHROME=true` uses an installed Google Chrome when the Playwright-managed Chromium version is not installed. Omit it in CI environments that run `npx playwright install`.

## Editable configuration

| Setting                                                             | Current value                                             | Authority                                                            |
| ------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------- |
| Brand, founder, canonical URL, email, WhatsApp, Instagram, location | Studio Viana / Dr. Sadhana / current live contact details | `lib/data/site.ts` → `site`                                          |
| Business hours and delivery regions                                 | Mon–Sat, 10 AM–7 PM; Tamil Nadu, Kerala, across India     | `lib/data/site.ts` → `site`                                          |
| Product order route                                                 | `builder`                                                 | `lib/data/site.ts` → `ORDER_MODE` (`builder` or `whatsapp-direct`)   |
| Lead time and bulk threshold                                        | 3–7 days; 20 pieces                                       | `lib/data/site.ts` → `phaseFiveConfig`                               |
| Catalogue download                                                  | `/catalogue/studio-viana-catalogue.pdf`                   | `lib/data/site.ts` → `phaseFiveConfig.cataloguePath`                 |
| Flowers, palettes, wraps, occasions                                 | Typed option arrays                                       | `lib/data/site.ts` → `builderOptions`                                |
| Bulk ranges, budgets and event types                                | Typed option arrays                                       | `lib/data/site.ts` → `builderOptions`                                |
| Product names, prices, sizes, variants and imagery                  | Eight catalogue records                                   | `lib/data/products.ts`                                               |
| Pricing-row descriptions and order                                  | Nine rows                                                 | `components/sections/pricing/PricingSection.tsx`                     |
| FAQ questions and answers                                           | Eight entries                                             | `lib/data/faq.ts`                                                    |
| FAQ policy placeholders requiring owner confirmation                | Delivery areas and payment methods                        | `lib/data/faq.ts` entries marked `placeholder: true`                 |
| Corporate logos                                                     | Empty by default, therefore hidden                        | `components/sections/corporate/CorporateSection.tsx` → `ClientLogos` |
| Contact opening message                                             | General handcrafted-florals enquiry                       | `components/sections/contact/ContactSection.tsx`                     |
| Footer groups and newsletter subject/body                           | Current section/product/contact groups; mailto newsletter | `components/layout/Footer.tsx`                                       |

The catalogue link is wired but the PDF is owner-supplied. Add the final file at `public/catalogue/studio-viana-catalogue.pdf`, or change `cataloguePath` before launch.

## Runtime and integration seams

- `useOrderStore` owns serializable builder state in `localStorage` under `studio-viana-order`; writes are debounced by 300 ms.
- `useBagStore` owns serializable bag items under `studio-viana-bag`; product records and imagery are derived by slug after hydration.
- `openProductOrder` dispatches `studio-viana:open-order-builder`, allowing pricing, collection and product-detail UI to prefill the builder without importing it.
- `OrderBagButton` dispatches `studio-viana:open-bag`; the lazy drawer hydrates and owns the dialog lifecycle.
- Product links dispatch `studio-viana:open-product`; the existing collection layer remains the single product-dialog owner.
- Menu, product, lightbox, bag and mobile summary surfaces report through the shared overlay coordinator so the floating WhatsApp action cannot compete with a dialog.
- `submitOrder`, `buildOrderMessage`, `buildBulkMessage`, `buildBagMessage` and `mailtoLink` are pure or narrow outbound seams. A later API can replace the transport without rewriting the forms.
- LocalBusiness, eight Product graphs and one FAQPage graph are generated in `lib/seo/schema.ts` and emitted as `<`-sanitized JSON-LD from `app/page.tsx`.

## Three exact message examples

### Custom order

```text
Hi Studio Viana! 🌸 I'd like to place an order:
• Piece: Single Stem Floral
• Flowers: Rose
• Palette: Blush Pink | Wrap: Classic cream
• Occasion: Birthday
• Message card: "Always in bloom."
• Needed by: 15 Oct 2026 | Delivery: Kochi
• Estimated total: ₹120
Name: Ananya Rao | Phone: 9876543210
Email: ananya@example.com
```

### Corporate or bulk enquiry

```text
Hi Studio Viana! 🌸 I'd like a tailored quote:
• Event: Wedding
• Quantity: 50–100
• Event date: 10 Nov 2026
• Budget per piece: ₹250–₹500
Name: Meera Rao | Phone: 9876543210
Organisation: Rao Family
Email: meera@example.com
Brief: Blush flower-card favours with custom name tags.
```

### Combined order bag

```text
Hi Studio Viana! 🌸 I'd like to order these pieces:
• 2 × Single Stem Floral (Sunflower) — ₹240
• 1 × Flower Card — ₹150
Estimated total: ₹390
Could you confirm availability and customisation options?
```

All three examples show the decoded human-readable copy. Production URL-encodes the text before opening WhatsApp or email.

## Complete testing checklist

- [x] Pricing contains all nine products, real DOM prices, mobile actions, product-detail routing, corporate routing and catalogue configuration.
- [x] Builder supports product prefill, all five steps, previous/edit navigation, flowers, variants, quantity, size, three-colour maximum, custom palette, wrap, occasion, message card, date, delivery and customer validation.
- [x] Builder state survives reload, the estimate updates, WhatsApp and email copy encode correctly, submission shows success, and reset returns to step one.
- [x] Mobile summary is present only while the builder is in view, traps the active overlay correctly and does not collide with floating WhatsApp.
- [x] Bag add/update/remove, badge total, persistence, focus trap, Escape, scroll lock, combined WhatsApp link and step-four builder hand-off work.
- [x] Corporate form validates gently, produces WhatsApp/email copy and shows a resettable success state; empty client logos do not render.
- [x] FAQ exposes eight items, valid button/panel relationships and exactly one open item.
- [x] Contact links, clipboard feedback, delivery copy, hours and rotating image-ring semantics work.
- [x] Footer desktop groups, mobile accordions, product links, newsletter mailto and reduced-motion-aware back-to-top work.
- [x] Floating WhatsApp appears after the intro and hides for every menu, dialog, drawer and summary overlay.
- [x] Keyboard focus, 44 px mobile targets, focus restoration, labelled errors, reduced motion and 375 px overflow were browser-verified.
- [x] Exact final section order, one `h1`, lazy boundaries, stable loading shells and structured data are unit-tested.
- [x] Production build, TypeScript, ESLint, formatting, Vitest and complete production Playwright suite pass.
- [ ] Owner: add the final catalogue PDF at the configured public path.
- [ ] Owner: confirm the two FAQ policy placeholders before launch.
- [ ] Owner: replace repeated development photography with the final commissioned image set, then re-run the complete browser gate and Lighthouse.

## Performance and scope notes

Phase 5 client-heavy sections are separated from the server-rendered story, preloaded before approach, and given fixed minimum-height placeholders. The order drawer is excluded from the initial server/client path. Motion uses transform and opacity where possible; reduced motion removes lateral transitions, counters, decorative rotation and smooth back-to-top travel. The production browser gate checks same-origin failures, console/page/hydration errors, mobile overflow, a layout-shift proxy, FCP and DOM-ready budgets.

Checkout, payments, server persistence, file uploads, newsletter storage, inventory and CRM integration remain out of scope.

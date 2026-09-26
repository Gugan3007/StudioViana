# Studio Viana Phase 7 pre-deploy audit

Audit date: 26 September 2026  
Branch: `phase-7-launch`  
Baseline: `3f97ad1`  
Scope: find and fix launch defects without adding features or redesigning the approved Phase 0–6 experience.

## Release status

The audited production build, code-quality checks, automated visitor flows, responsive matrix, accessibility audit, dependency audit and local security-header checks pass. The code is ready for the deployment step after the owner replaces or explicitly approves the launch-content placeholders listed below.

The first-visit cinematic intro remains a measured mobile performance tradeoff: Lighthouse mobile performance is 76 with a 4.8 s LCP under simulated throttling. Removing the preloader or cinematic intro would materially change the approved experience, so this audit records the cost instead of redesigning it.

## Issues found and disposition

| Severity           | Location                                      | Finding                                                                                                                                            | Fix applied / disposition                                                                                                                                                   |
| ------------------ | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| High               | Catalogue links in pricing/footer             | The configured catalogue PDF did not exist, creating a launch-time 404.                                                                            | Set `cataloguePath` to `null` and render no catalogue link until the owner supplies the PDF.                                                                                |
| High               | 360–430 px layouts                            | Long Instagram/wordmark/pricing content could compress or clip adjacent controls at compact widths.                                                | Added responsive clamps/grid constraints and a non-shrinking bag control; all requested portrait/landscape widths now pass overflow and clipping checks.                    |
| High               | Floating WhatsApp/footer                      | The fixed WhatsApp action could miss safe-area offsets, had no guaranteed 44 px width, and could cover footer controls.                            | Added safe-area positioning, minimum target sizing and footer clearance; collision tests pass at every requested viewport.                                                  |
| Medium             | Intro/navigation                              | Intro frame metadata could remain present beneath the navbar after the static/reduced-motion handoff and the intro did not declare its dark theme. | Declared the intro theme and hid non-current metadata in reduced/static states.                                                                                             |
| Medium             | Production responses                          | `X-Powered-By` was exposed and CSP, HSTS, clickjacking, MIME-sniffing, referrer and permissions protections were absent.                           | Disabled the framework header, kept compression enabled and added production-safe security headers globally. Live CDN/TLS behavior still requires post-deploy verification. |
| Medium             | About, gallery, testimonials, pricing, footer | Lighthouse found 76 mobile contrast failures and 55 desktop contrast failures.                                                                     | Added a readable dark-gold text token, strengthened muted/footer copy and retained decorative gold for non-text artwork. Final Lighthouse contrast audit has zero failures. |
| Medium             | Collection/pricing controls                   | Visible button text was not fully contained in accessible names, producing eight label-content-name failures.                                      | Added responsive screen-reader labels matching mobile/desktop visible content and corrected the corporate action label. Final audit has zero failures.                      |
| Medium             | Intro LCP                                     | The logo was eagerly discoverable but lacked an explicit high fetch priority; the flower dive was also preloaded and competed with it.             | Applied `fetchPriority="high"` and eager loading to the logo, removed the competing flower preload, and kept the flower eager for the first scroll interaction.             |
| Medium             | Contact configuration                         | The WhatsApp destination had more than one ownership point, increasing launch-config drift risk.                                                   | Centralized the number in `site`, added `NEXT_PUBLIC_WHATSAPP_NUMBER`, and made every helper/call site consume the canonical link builder.                                  |
| Medium             | Contact copy controls                         | Clipboard API rejection in restricted/in-app browser contexts could leave the copy action without feedback.                                        | Added a tested selection-based fallback when the modern Clipboard API is missing or denied; the contact flow passes in the final production suite.                          |
| Medium             | Message links                                 | No malformed link was reproduced, but the previous tests did not prove all Unicode/newline/destination invariants.                                 | Added table-driven product, builder, bag, bulk, WhatsApp and email URL checks for `🌸`, `₹`, line breaks, `919488713438` and `studioviana30@gmail.com`.                     |
| Low                | Dead code/assets                              | An unused showcase component, empty keep files and obsolete placeholder SVGs remained in the tree.                                                 | Removed only files with no route/import/runtime owner; all remaining public assets have a source reference.                                                                 |
| Low                | Browser runtime monitor                       | Legacy tests only treated failures on `localhost:3000` as local, so production audit ports could evade the network assertion.                      | Matched both local hostnames independent of port in every legacy browser monitor.                                                                                           |
| Informational      | Low-power mode                                | The implementation existed but was not browser-emulated in the release suite.                                                                      | Added a low-core/low-memory mobile scenario proving `data-low-power`, one petal layer and no film grain.                                                                    |
| Informational      | In-app browsers                               | Only representative user-agent emulation is available locally.                                                                                     | Instagram and WhatsApp were exercised on both iPhone- and Android-style touch contexts in system Chrome. Real app/WebKit certification remains an external launch check.    |
| Remaining tradeoff | First-visit mobile LCP                        | The full-screen preloader waits for client hydration before the brand logo becomes the final LCP candidate.                                        | Final measured LCP is 4.8 s. No removal/visual redesign was made under the audit scope. Repeat visits have no artificial minimum loader delay.                              |

No application `console.log`, lint warning, TypeScript error, build warning, hydration error, page error, same-origin 4xx/5xx on valid routes, dependency vulnerability or unowned public asset remains.

## Lighthouse and performance evidence

Lighthouse 13.5.0 ran against `next start` on the final local production build.

| Metric                   | Mobile | Desktop |
| ------------------------ | -----: | ------: |
| Performance              |     76 |      99 |
| Accessibility            |    100 |     100 |
| Best Practices           |    100 |     100 |
| SEO                      |    100 |     100 |
| First Contentful Paint   |  2.1 s |   0.5 s |
| Largest Contentful Paint |  4.8 s |   0.9 s |
| Cumulative Layout Shift  |      0 |       0 |
| Total Blocking Time      | 230 ms |   70 ms |
| Speed Index              |  2.4 s |   0.8 s |
| Time to Interactive      |  5.9 s |   1.3 s |

Lighthouse lab reports do not contain field INP, so no INP value is claimed. TBT is recorded as the available lab interaction proxy. The app's targeted production Chrome traces and frame-sampling regressions remain green; real-user INP requires post-deploy RUM.

Image evidence:

- All runtime photographs use `next/image` with intrinsic/static dimensions or bounded fill containers and responsive `sizes`.
- The non-destructive optimizer dry-run plans 388 AVIF/WebP derivatives in `public/images-optimized`; it did not overwrite originals.
- Final commissioned photography must be re-audited because replacement dimensions, crop, compression and decode cost can change LCP and scroll-trigger geometry.

## Responsive and in-app browser coverage

The final production matrix checks horizontal overflow, clipped headings/body copy, `100svh`, safe-area viewport support, 44 px global targets, viewport bounds, short-landscape menu reachability and WhatsApp/footer collision.

- Phones: 360×800, 800×360, 375×812, 812×375, 390×844, 844×390, 412×915, 915×412, 430×932 and 932×430.
- Tablets: 768×1024 and 1024×768.
- Desktop: 1440×1000.
- In-app emulation: Instagram iPhone, Instagram Android, WhatsApp iPhone and WhatsApp Android.
- In-app checks: first intro completion/skip, native touch scrolling without Lenis smoothing, local Poppins font rendering, bag/lightbox focus and Escape, overlay cleanup and the `/919488713438` WhatsApp path.

This is Chromium user-agent/touch emulation. It is not a claim that the physical Instagram or WhatsApp apps, iOS WebKit, Safari, Samsung Internet or Android System WebView were run.

## End-to-end flow coverage

The complete production suite covers:

- Intro full play, skip, repeat visit, reduced motion, restoration and flower-dive progression.
- Navbar, active sections, cross-route hashes and the mobile menu.
- Collection index, desktop horizontal and compact vertical galleries, variants, detail routes/query state, related products and focus restoration.
- Gallery filter/load-more, lightbox arrows, Escape, backdrop, swipe, zoom and gallery-to-product handoff.
- All five order-builder steps, validation, edits, estimate, WhatsApp/email handoff and `localStorage` restoration.
- Order bag add/update/remove/persistence/combined message and builder handoff.
- Corporate/bulk form validation, WhatsApp/email output and reset.
- FAQ single-open behavior, contact links/copy feedback, footer, back-to-top and motion preference.
- Route transitions/back-forward, legal/product routes and the branded 404 recovery path.

## Contact and message integrity

- Canonical WhatsApp display: `+91 94887 13438`.
- Canonical WhatsApp path: `https://wa.me/919488713438`.
- Canonical email: `studioviana30@gmail.com`.
- Product, custom builder, combined bag and corporate/bulk messages preserve Unicode emojis, `₹`, punctuation and line breaks after URL decoding.
- Email links preserve destination, subject and body independently.

## Remaining launch-content placeholders

These are owner inputs, not code defects. They should be replaced or explicitly approved before public launch.

### Brand and intro art

- `public/brand/logo-placeholder.svg` — temporary Studio Viana lockup.
- `public/images/hero/petal-layer-1-placeholder.svg` — temporary transparent foreground depth layer.
- `public/images/hero/petal-layer-2-placeholder.svg` — temporary transparent middle-depth layer.
- `public/images/craft/closeup-flower.jpg` and `closeup-macro.jpg` are development photography used by the intro/craft sequence and remain in the documented final-art replacement boundary.

### Product photography — 19 files

Every current file in `public/images/products` is documented as development photography to replace in place:

```text
flower-cards-hero.jpg
flower-cards-lily-bookmarks.jpg
single-stem-hero.jpg
small-bouquets-hero.jpg
small-bouquets-noir-orchid.jpg
medium-bouquets-hero.jpg
medium-tulip-lily.jpg
medium-noir-wrap.jpg
medium-violet-edit.jpg
mini-bouquets-hero.jpg
mini-rose-duet.jpg
large-hero.jpg
large-blush-lily.jpg
large-anniversary.jpg
large-birthday-edit.jpg
grand-bouquet-hero.jpg
grand-bouquet-mobile.jpg
hamper-hero.jpg
hamper-lilac-edition.jpg
```

The current asset audit confirms extensive byte-identical reuse across product/gallery filenames; unique final crops and exports are still required.

### Process/gallery/Instagram photography — 33 files

```text
public/images/process/step-01.jpg
public/images/process/step-02.jpg
public/images/process/step-03.jpg
public/images/process/step-04.jpg
public/images/process/step-05.jpg

public/images/gallery/gallery-01.jpg
public/images/gallery/gallery-02.jpg
public/images/gallery/gallery-03.jpg
public/images/gallery/gallery-04.jpg
public/images/gallery/gallery-05.jpg
public/images/gallery/gallery-06.jpg
public/images/gallery/gallery-07.jpg
public/images/gallery/gallery-08.jpg
public/images/gallery/gallery-09.jpg
public/images/gallery/gallery-10.jpg
public/images/gallery/gallery-11.jpg
public/images/gallery/gallery-12.jpg
public/images/gallery/gallery-13.jpg
public/images/gallery/gallery-14.jpg
public/images/gallery/gallery-15.jpg
public/images/gallery/gallery-16.jpg
public/images/gallery/gallery-17.jpg
public/images/gallery/gallery-18.jpg

public/images/instagram/ig-01.jpg
public/images/instagram/ig-02.jpg
public/images/instagram/ig-03.jpg
public/images/instagram/ig-04.jpg
public/images/instagram/ig-05.jpg
public/images/instagram/ig-06.jpg
public/images/instagram/ig-07.jpg
public/images/instagram/ig-08.jpg
public/images/instagram/ig-09.jpg
public/images/instagram/ig-10.jpg
```

All are explicitly documented as duplicated/cropped development placeholders. Replace in place and preserve filenames.

### Testimonials and trust claims

All five testimonials in `lib/data/testimonials.ts` are explicitly marked `placeholder: true`:

1. `t01` — Ananya R., Anniversary, Large Statement Bouquet.
2. `t02` — Meera S., Birthday, Medium Bouquet.
3. `t03` — Kavya P., Return Gifts, Flower Cards.
4. `t04` — Rhea M., Congratulations, Just For You Hamper.
5. `t05` — Nithya K., Just Because, Violet Edit.

Replace the names, quotes, occasions, product references and associated photos with permissioned customer content. The adjacent `500+ blooms handcrafted`, `100% made to order`, `∞ never fades` and `★ 5.0 customer love` values are unverified promotional claims and require owner approval/evidence.

### FAQ/business-policy answers

Two FAQ entries are explicitly marked as placeholders in `lib/data/faq.ts`:

- `delivery-areas`: currently promises Tamil Nadu, Kerala and other serviceable locations across India, with charges/timing confirmed on WhatsApp.
- `payment-methods`: currently states UPI or bank transfer after the order and total are confirmed on WhatsApp.

The remaining FAQ copy is not source-marked as placeholder, but all policy statements should receive final owner/legal review.

### Lead time, delivery regions and business hours

- Lead time: `leadTimeDays: 3`, visible label and FAQ promise `3–7 days`; larger/custom/bulk orders may take longer.
- Delivery regions: `Tamil Nadu`, `Kerala`, `across India`.
- Business hours: `Mon–Sat, 10 AM – 7 PM`.
- Bulk threshold: 20 pieces.

All four are editable business-policy values and require owner confirmation.

### Prices requiring owner confirmation

| Product                  |                    Current public price |
| ------------------------ | --------------------------------------: |
| Flower Cards             |                                    ₹150 |
| Single Stem Florals      |                           ₹120 per stem |
| Small Bouquets           | ₹150–₹250 (1 bloom ₹150; 2 blooms ₹250) |
| Medium Bouquets          |                                    ₹550 |
| Mini Bouquets            |                                    ₹650 |
| Large Statement Bouquets |                                  ₹1,250 |
| The Grand Bouquet        |                                  ₹1,250 |
| “Just For You” Hamper    |                                  ₹1,250 |
| Corporate & Bulk Orders  |                              On request |

Builder budget ranges (`Under ₹250`, `₹250–₹500`, `₹500–₹1,000`, `₹1,000+`) and all computed estimates derive from these values. Confirm every amount before launch.

### Other owner launch inputs

- Catalogue PDF: absent; `cataloguePath` is intentionally `null`, so no broken public link is rendered.
- Client logo strip: empty and hidden until approved client marks are supplied.
- Privacy and terms: visibly draft and require legal approval, including retention, processors, cancellation/refund and jurisdiction policy.
- Canonical production origin: `https://studioviana.com` requires owner/domain confirmation.
- Analytics/consent provider: not configured in this no-new-feature audit.
- Optional licensed ambient audio: not supplied and therefore absent.

## Security and external checks still required after deployment

- Run the physical Instagram and WhatsApp apps on at least one current iPhone and one current Android device.
- Run Safari/WebKit, Samsung Internet and Android System WebView smoke tests.
- Perform VoiceOver + Safari and NVDA + Chrome manual assistive-technology checks.
- Verify 200% zoom manually.
- Verify live HTTPS/TLS, redirects, DNS, CDN compression/cache behavior, CSP console output and `securityheaders.com` against the real domain.
- Add production RUM and observe field LCP/CLS/INP before making launch-performance claims.

## Final command evidence

- `npm run check`: passed — Prettier, zero-warning ESLint, TypeScript, 51 test files / 210 tests and the final production build.
- Full production Playwright suite: 85/85 passed in 4.0 minutes against `next start` with one system-Chrome worker.
- Phase 7 focused production suite: 22/22 passed.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- `npm run images:optimize -- --dry-run`: 388 planned derivatives, no writes.
- Production response: gzip enabled; security headers present; `X-Powered-By` absent.

## Full updated code

The repository files below are the complete updated source; no excerpts are substituted for implementation. Deleted files are listed separately.

Production/configuration:

- `.env.example`
- `app/globals.css`
- `app/layout.tsx`
- `components/intro/BrandMoment.tsx`
- `components/intro/FlowerDive.tsx`
- `components/intro/IntroSection.tsx`
- `components/layout/BigWordmark.tsx`
- `components/layout/FloatingWhatsApp.tsx`
- `components/layout/Footer.tsx`
- `components/layout/OrderBagButton.tsx`
- `components/layout/OrderBagDrawer.tsx`
- `components/product/ProductDetail.tsx`
- `components/sections/contact/ContactRow.tsx`
- `components/sections/collection/CollectionIndex.tsx`
- `components/sections/collection/CorporateCTAPanel.tsx`
- `components/sections/collection/MobileProductCard.tsx`
- `components/sections/collection/ProductPanel.tsx`
- `components/sections/gallery/GalleryFilters.tsx`
- `components/sections/home/ServiceColumn.tsx`
- `components/sections/home/ValuesStrip.tsx`
- `components/sections/home/WordScrubText.tsx`
- `components/sections/instagram/InstagramStrip.tsx`
- `components/sections/order/OrderBuilder.tsx`
- `components/sections/order/StepPiece.tsx`
- `components/sections/order/StepReview.tsx`
- `components/sections/pricing/CustomisationNote.tsx`
- `components/sections/pricing/PricingRow.tsx`
- `components/sections/testimonials/TrustStats.tsx`
- `lib/data/site.ts`
- `lib/utils.ts`
- `lib/utils/whatsapp.ts`
- `next.config.mjs`
- `package.json`
- `package-lock.json`
- `tailwind.config.ts`

Tests/evidence source:

- `tests/about-studio.test.tsx`
- `tests/browser/intro.spec.ts`
- `tests/browser/phase-two.spec.ts`
- `tests/browser/phase-three.spec.ts`
- `tests/browser/phase-four.spec.ts`
- `tests/browser/phase-five.spec.ts`
- `tests/browser/phase-seven-audit.spec.ts`
- `tests/collection-intro.test.tsx`
- `tests/contact-phase-five.test.tsx`
- `tests/data.test.ts`
- `tests/footer-phase-five.test.tsx`
- `tests/intro-components.test.tsx`
- `tests/phase-five-foundations.test.ts`
- `tests/phase-six-performance.test.ts`
- `tests/pricing-phase-five.test.tsx`
- `tests/utils.test.ts`
- `docs/superpowers/plans/2026-09-26-studio-viana-phase-7-predeploy-audit.md`

Deleted because they had no route/import/runtime owner:

- `app/showcase/AnimationShowcase.tsx`
- `public/images/gallery/placeholder-botanical-01.svg`
- `public/images/gallery/placeholder-botanical-02.svg`
- `public/images/hero/flower-macro-placeholder.svg`
- `public/images/hero/flower-macro-mobile-placeholder.svg`
- Empty `.gitkeep` files in populated public asset directories.

The complete baseline-to-audit patch is reproducible with:

```bash
git diff 3f97ad1..phase-7-launch
```

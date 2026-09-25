# Phase 3 — Collection operations guide

Phase 3 replaces the Collection shell with an editorial index, an eight-product gallery, URL-addressable product configuration, a Corporate & Bulk Orders panel, and a dark Grand Bouquet finale. Pricing and Contact remain semantic shells for later phases.

## Run and verify

```bash
npm run dev
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
PLAYWRIGHT_PRODUCTION=true npx playwright test
```

The final Phase 3 gate is 105 unit tests plus 29 production Chromium tests spanning Phases 1–3. Production browser files run serially because their real-time animation and Chrome trace budgets must not compete for the same CPU.

## Runtime ownership

- `lib/data/products.ts` is the canonical catalogue. `catalogueProducts` contains eight orderable products; `corporateProduct` is the separate bulk-order record.
- `components/sections/collection/CollectionSection.tsx` composes the intro, index, gallery, signature finale, URL state and one lazy product-detail instance.
- `HorizontalGallery.tsx` owns the only Collection pin and maps vertical progress to one horizontal track. At reduced motion it yields to the semantic vertical cards.
- `ProductPanel.tsx` and `MobileProductCard.tsx` expose the same variants, order context and detail actions in breakpoint-specific compositions.
- `components/product/useProductQueryParam.ts` owns `?product=<slug>` push/replace/popstate behavior while retaining unrelated query parameters.
- `components/product/ProductDetail.tsx` owns focus, Escape/backdrop/Close behavior, Lenis suspension and internal scrolling. Native controls remain the state authority.
- `lib/utils/whatsapp.ts` owns totals and encoded order/enquiry messages. Change pricing there only through the typed product/configuration inputs.
- `GrandBouquetShowcase.tsx` and `PearlParticles.tsx` own the dark finale. Pearls render only for fine pointers without reduced motion and pause while off-screen.

## Exact product image inventory

All 19 files live in `public/images/products/` and use static imports for dimensions and blur placeholders. The current files are development placeholders duplicated from the approved Phase 2 photography; replace them in place and preserve the filenames.

| Filename                          | Current placeholder | Final source target |
| --------------------------------- | ------------------: | ------------------: |
| `flower-cards-hero.jpg`           |           1122×1402 |           1600×2000 |
| `flower-cards-lily-bookmarks.jpg` |           1122×1402 |           1200×1500 |
| `single-stem-hero.jpg`            |           1254×1254 |           1600×2000 |
| `small-bouquets-hero.jpg`         |           1122×1402 |           1600×2000 |
| `small-bouquets-noir-orchid.jpg`  |           1086×1448 |           1200×1500 |
| `medium-bouquets-hero.jpg`        |           1086×1448 |           1600×2000 |
| `medium-tulip-lily.jpg`           |           1536×1024 |           1200×1500 |
| `medium-noir-wrap.jpg`            |           1122×1402 |           1200×1500 |
| `medium-violet-edit.jpg`          |           1086×1448 |           1200×1500 |
| `mini-bouquets-hero.jpg`          |           1254×1254 |           1600×2000 |
| `mini-rose-duet.jpg`              |           1122×1402 |           1200×1500 |
| `large-hero.jpg`                  |           1122×1402 |           1600×2000 |
| `large-blush-lily.jpg`            |           1254×1254 |           1200×1500 |
| `large-anniversary.jpg`           |           1536×1024 |           1200×1500 |
| `large-birthday-edit.jpg`         |           1448×1086 |           1200×1500 |
| `grand-bouquet-hero.jpg`          |           1122×1402 |  at least 2560×1440 |
| `grand-bouquet-mobile.jpg`        |           1086×1448 |           1440×2560 |
| `hamper-hero.jpg`                 |           1448×1086 |           1600×2000 |
| `hamper-lilac-edition.jpg`        |           1086×1448 |           1200×1500 |

Final files should be sRGB JPEGs with the subject inside the centre 70% crop-safe region. Keep hero/detail files below roughly 1.5 MB and variants below roughly 900 KB. Landscape development placeholders intentionally do not match every final aspect target, so crop review is required after replacement.

## Tweakable values

- Collection intro: `pt-[clamp(7rem,13vw,12rem)]`; heading `clamp(4rem,9vw,8.6rem)`; index bottom interval `clamp(7rem,12vw,11rem)`.
- Horizontal gallery: `75vw` desktop panels, `85vw` tablet panels, `6vw` gap, and `12vw` trailing space. Vertical pin distance is exactly `track.scrollWidth - innerWidth`; scrub is `1`.
- Panel motion: scale `0.9 → 1`, saturation `0.8 → 1`, image parallax `-12 → 12 xPercent`, copy entrance `28px → 0` over `0.8s`.
- Index preview: `208×256px`, pointer offset `+24/-120px`, rotation clamp `±6deg`, `quickTo` duration `0.45–0.5s`.
- Detail: desktop `55/45` media/content split; lens `176px` with `220%` background size; message limit `120`; quantity clamp `1–25`.
- Small Bouquet mapping: one bloom ₹150; two blooms ₹250. Single Stem quantity multiplies the ₹120 base.
- Grand Bouquet: image scale `1.15 → 1`, veil opacity `0.76 → 0.48`, 32px desktop / 16px mobile inset frame.
- Pearls: exactly 18, sizes `3–8px`, durations `14–24s`; no pearl DOM on coarse pointers or reduced motion.
- Detail chunk preloads on `pointerover`/`focusin` of `[data-preload-product-detail]` and otherwise remains lazy via `next/dynamic`.

## Asset replacement procedure

1. Export the final image at the target size, sRGB, with no embedded text or border.
2. Replace the existing file without renaming it. Do not change imports or product slugs.
3. Check the Collection index preview, horizontal panel, mobile card, detail gallery and any variant thumbnail using that asset.
4. Check the Grand Bouquet desktop and mobile sources separately.
5. Run the complete production browser suite. Image dimensions, decode timing and crop changes can alter ScrollTrigger measurements, so a build-only check is insufficient.

## Testing checklist

- [x] Index rows scroll to the matching horizontal panel; focused gallery Arrow Left/Right moves backward and forward.
- [x] Desktop/tablet use one horizontal pin; mobile and reduced motion use eight vertical cards plus the Corporate panel.
- [x] Variants swap the primary image and flow into the WhatsApp order context.
- [x] Detail open, direct URL, related replacement, browser Back, Escape, backdrop and Close keep URL/dialog state synchronized.
- [x] Detail traps focus, focuses Close on entry and restores the invoking control on exit.
- [x] Small Bouquet size, Single Stem quantity, palette, occasion and personal message produce the correct total and encoded WhatsApp message.
- [x] Fine pointers receive lens and pearl treatments; touch and reduced-motion users do not.
- [x] Grand Bouquet uses the shared canonical record and exposes both detail and WhatsApp actions.
- [x] 360, 390, 768, 1024, 1440 and 1920px have no horizontal document overflow or failed owning-section media.
- [x] Resizing an active horizontal gallery rebuilds its ScrollTrigger without a `NaN` transform.
- [x] Production traces contain no main-thread task at or above 50ms for the intro, Home/About/Craft or Collection measured paths.
- [x] No same-origin 4xx/5xx response, console error or hydration error occurs in the production suite.

## Phase 4 handoff

Phase 4 should replace only the `#pricing` shell in `app/page.tsx`. Preserve `#collection`, its query parameter, catalogue types and WhatsApp helpers. If Phase 4 introduces shared package/price data, derive its display from `priceFrom`, `priceLabel`, `sizes` and `orderTotal` rather than creating a second pricing authority. Re-run all 29 production browser tests after changing page height because the intro and Collection both own pins.

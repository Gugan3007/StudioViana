# Phase 2 — Home story operations guide

Phase 2 delivers the seamless intro hand-off, responsive navigation, Home editorial hero, About story, What We Do band/services, and semantic shells for Collection, Pricing, and Contact.

## Run and verify

```bash
npm run dev
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
PLAYWRIGHT_PRODUCTION=true npx playwright test tests/browser/intro.spec.ts tests/browser/phase-two.spec.ts
```

## Exact product image inventory

All six files live in `public/images/products/` and are imported statically so Next Image can generate responsive formats and blur placeholders.

| Filename                   | Product / use                        | Aspect ratio | Recommended source size |
| -------------------------- | ------------------------------------ | -----------: | ----------------------: |
| `grand-bouquet.jpg`        | Main Home collage / Bouquets preview |          4:5 |               1600×2000 |
| `blush-lily.jpg`           | Home side image                      |          1:1 |               1600×1600 |
| `just-for-you-hamper.jpg`  | Home collage / Hampers preview       |          4:3 |               1600×1200 |
| `flower-card.jpg`          | Home collage / Return Gifts preview  |          4:5 |               1200×1500 |
| `lilac-pearl-dome.jpg`     | About panel / Corporate preview      |          3:4 |               1800×2400 |
| `i-love-you-lily-band.jpg` | What We Do expanding band            |          3:2 |               2400×1600 |

Replace an image without changing its filename or aspect ratio, then rerun the production browser suite. Crop, decode time, layout stability, and motion framing are part of the contract.

## Tweakable motion values

- Hero float amplitudes: `7`, `10`, `13`, `16px`; durations `4.8–7.2s`; delays `0–1.1s` in `HeroCollage.tsx`.
- Hero cursor depths: `8`, `14`, `22`, `30px`; scroll travel `-10`, `-18`, `-28`, `-40 yPercent`.
- Hero entrance labels: headline `0.12`, copy `0.55`, images `0.72`, badge `1.45`, navigation event `1.7s`.
- About image parallax: `0.15`; word scrub `top 82%` to `bottom 58%`, opacity `0.15 → 1`.
- Expanding band: scrub `1`, start `top 92%`, end `top 15%`, frame `10% 12% → 0`, image scale `1.2 → 1`.
- Service entrance stagger: `0.12s`; hover lift `6px`; preview rotation clamp `±6deg`.
- Marquee duration: `24s`; velocity timeScale clamp `0.6–3` with direction reversal on upward scroll.
- Navbar: `0.5s` movement; Lenis anchor duration `1.4s` with `-84px` fixed-header offset.

## Testing checklist

- [x] Intro light and Home use the same cream with no seam or flash.
- [x] Normal completion, Skip, first-view native jump, and post-intro reload reveal a final Home hero.
- [x] Navbar appears with Home, hides down, returns up, tracks active sections, and switches to cream over the dark marquee.
- [x] All five desktop and mobile links land at their labelled section.
- [x] Mobile overlay opens with a clip reveal, stops Lenis, traps forward/backward focus, closes on Escape, and restores trigger focus.
- [x] Hero collage floats and parallax layers are fine-pointer only where required; scroll depths remain transform-only.
- [x] About image, paragraphs, signature, magnolia and values finish correctly under normal and reduced motion.
- [x] Craft band, service count-up, cursor preview, Discover links and marquee behave in both directions.
- [x] 360, 390, 768, 1024, 1440 and 1920px layouts have no horizontal overflow.
- [x] Images decode without failed requests; below-fold assets remain lazy and hero assets are eager.
- [x] No console errors, hydration warnings, or missing images in production tests.
- [x] Production traces contain no main-thread task at or above 50ms during the measured intro and Home/About/Craft scrolls.
- [x] Keyboard focus is visible and body copy retains the approved accessible contrast.

## Section ownership

- `components/layout/` owns desktop/mobile navigation and theme/direction hooks.
- `components/sections/home/` owns Home, About and Craft composition and motion.
- `lib/context/IntroContext.tsx` owns the completion signal shared by the intro, hero and navbar.
- `lib/data/products.ts` remains the canonical product/service source.
- `tests/browser/phase-two.spec.ts` owns Phase 2 integration, responsive, image and performance checks.

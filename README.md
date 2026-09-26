# Studio Viana — Editorial floral experience

Studio Viana is a Next.js App Router experience for handcrafted chenille florals. Phases 0–5 established the editorial design, cinematic intro, catalogue, craft story, gallery and conversion flow. Phase 6 production-hardens that approved experience with shared motion and overlay systems, crawlable product routes, accessibility controls, metadata and performance tooling.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The first visit has a short 450 ms minimum loader while real asset progress is reported; repeat visits have no artificial minimum delay.

Quality commands:

```bash
npm run test
npm run test:browser
npm run test:performance
npm run images:optimize -- --dry-run
npm run analyze
npm run check
PLAYWRIGHT_PRODUCTION=true npx playwright test
```

Phase 2's story inventory is documented in [`docs/phase-2-home-story.md`](docs/phase-2-home-story.md), Phase 3's catalogue contract in [`docs/phase-3-collection.md`](docs/phase-3-collection.md), Phase 4's image inventory in [`docs/phase-4-craft-gallery.md`](docs/phase-4-craft-gallery.md), and the final production system in [`docs/phase-6-final-polish.md`](docs/phase-6-final-polish.md). Preserve documented filenames when replacing commissioned photography.

## Architecture and content maintenance

- `app/page.tsx` retains the approved one-page experience. `app/collection/[slug]` provides eight statically generated, crawlable product routes; `app/privacy` and `app/terms` are draft legal routes.
- `lib/data/products.ts`, `lib/data/site.ts`, `lib/data/gallery.ts` and `lib/data/faq.ts` are the content sources of truth. Update data there rather than duplicating copy inside views.
- `MotionProvider` resolves system, saved visitor and low-power preferences. `OverlayManager` owns the ordered modal stack, focus, Escape and scroll lock.
- `ORDER_MODE` in `lib/data/site.ts` switches product-order entry points between the five-step builder and direct WhatsApp without changing call sites.
- `INTRO_MODE` in `components/intro/intro.config.ts` switches the layered intro and optional numbered WebP sequence.
- `npm run images:optimize -- --input public/images --dry-run` plans capped AVIF/WebP derivatives. Originals are never overwritten unless `--overwrite` is explicit.
- `npm run analyze` creates bundle reports in `.next/analyze`. The production domain, legal copy, catalogue PDF, analytics provider and optional licensed audio remain owner inputs.

## Motion contract

Shared timing lives in `lib/animations/tokens.ts`: fast UI feedback is 0.4 s, base reveals 0.8 s, slow sequences 1.2 s, cinematic moments 1.8 s, item stagger 0.08 s, and overlay enter/exit are 0.5/0.35 s. Scroll-scrubbed timelines intentionally use linear easing because scroll position owns their progress. Reduced motion makes overlays instant, disables the custom cursor, magnetic movement, grain, loops and intro pinning, and remains user-selectable from the footer.

## Intro configuration

All creative tuning lives in `components/intro/intro.config.ts`.

| Setting                 |                            Default | Effect                                                                                             |
| ----------------------- | ---------------------------------: | -------------------------------------------------------------------------------------------------- |
| `INTRO_MODE`            |                         `"layers"` | Selects layered `next/image` art or the WebP canvas sequence.                                      |
| `focalPoint`            |                 `{ x: 50, y: 48 }` | Flower center in percentage coordinates for `object-position`, transforms, and canvas cover crops. |
| `scrub`                 |                             `0.35` | ScrollTrigger catch-up time; lower is more immediate, higher is more liquid.                       |
| `preload.firstVisitMs`  |                              `450` | Minimum first-session loader duration.                                                             |
| `preload.repeatVisitMs` |                                `0` | Repeat sessions wait only for required asset progress.                                             |
| `preload.maximumMs`     |                             `2500` | Hard release deadline when an asset stalls or fails.                                               |
| `sequence.frameCount`   |                              `150` | Total numbered WebP frames expected in `/public/sequence`.                                         |
| Desktop                 |    `260vh`, scale `2`, 9 particles | Full experience at widths of 1024px and above.                                                     |
| Tablet                  | `220vh`, scale `1.85`, 6 particles | Medium experience from 768px through 1023px.                                                       |
| Mobile                  |  `180vh`, scale `1.7`, 4 particles | Portrait image, one petal layer, and no blurred middle duplicate below 768px.                      |
| `poem`                  |                        Three lines | Dive copy and order: “Shaped stem by stem…”, “petal by petal…”, “made to last forever.”            |

To enable frame-sequence rendering, change this one line:

```ts
export const INTRO_MODE = "sequence" as IntroMode;
```

Set it back to `"layers"` to restore the layered image dive. Preloader, brand copy, poem, vignette, skip control, and light transition are shared by both modes.

## Final asset contract

Phase 1 currently uses original local SVG fixtures so every animation can be tested without external artwork. They are intentionally named `*-placeholder.svg`; they are not production brand assets.

Supply and optimize these final files:

| Path                                          | Required specification                                                                                                           |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `/public/images/hero/flower-macro.jpg`        | Landscape macro image, at least 3840×2160, high-quality JPEG, sRGB, clear flower center, ideally below 1.5 MB.                   |
| `/public/images/hero/flower-macro-mobile.jpg` | Portrait crop, 1440×2560, high-quality JPEG, sRGB, same focal center, ideally below 900 KB.                                      |
| `/public/images/hero/petal-layer-1.png`       | Transparent PNG, 2400×1600 recommended, large isolated edge petals, clean alpha, ideally below 1 MB.                             |
| `/public/images/hero/petal-layer-2.png`       | Transparent PNG, 2400×1600 recommended, distinct middle-depth petals and sparse bokeh, clean alpha, ideally below 1 MB.          |
| `/public/brand/logo.svg`                      | Cropped-viewBox vector Studio Viana wordmark plus ornamental mandala, outlined shapes, with no linked font or raster dependency. |

After adding them, update only `introConfig.assets`:

```ts
assets: {
  desktopFlower: "/images/hero/flower-macro.jpg",
  mobileFlower: "/images/hero/flower-macro-mobile.jpg",
  petals: [
    "/images/hero/petal-layer-1.png",
    "/images/hero/petal-layer-2.png",
  ],
  logo: "/brand/logo.svg",
},
```

Re-run the full browser and performance checklist after replacing fixtures. Large final assets can change decode time, GPU memory, crop behavior, and scrub smoothness.

## Create a WebP sequence

Place a source video named `flower-dive.mp4` in the project root, then run:

```bash
ffmpeg -i flower-dive.mp4 -vf "fps=30,scale=1920:-2:flags=lanczos" -c:v libwebp -quality 82 -compression_level 6 -start_number 1 public/sequence/flower_%04d.webp
```

This produces `/public/sequence/flower_0001.webp`, `/public/sequence/flower_0002.webp`, and so on. Set `introConfig.sequence.frameCount` to the exact number of generated frames; numbering must begin at `0001`. The loader requests frame 1 first, then every tenth frame, then the remaining frames with bounded concurrency.

## AI image-generation prompts

### 1. Desktop macro flower

```text
Create an ultra-detailed 16:9 macro photograph of a single handcrafted chenille pipe-cleaner flower for a luxury Indian floral studio. Camera looks directly into a precise, clearly visible flower center positioned at 50% horizontal and 48% vertical. Build every petal from tactile fuzzy chenille fibers with believable hand-shaped bends, tiny fiber detail, and elegant natural asymmetry. Palette: blush pink #E9C9C9, soft lilac #C9B6E4, warm cream #F7F0E6, restrained muted-gold highlights #B8925A, and deep forest-green #1F3326 shadows. Cinematic shallow depth of field, soft diffused studio light, premium editorial mood, calm and romantic rather than bright or commercial. Fill the frame with layered petals while preserving generous crop safety around the center for a 6× digital camera push-in. No text, no logo, no vase, no hands, no real botanical petals, no water droplets, no border. Photoreal material fidelity, clean central detail, 3840×2160 output, sRGB.
```

For the mobile source, reuse the same seed and art direction at 1440×2560 with the flower center held at 50% horizontal and 48% vertical.

### 2. Foreground petal layer

```text
Create a transparent foreground depth layer for a cinematic camera dive through a handcrafted chenille flower. Output only four to six large, isolated pipe-cleaner petals entering from the far left, far right, and lower corners; keep the central 55% of the canvas mostly empty. Petals use fuzzy blush pink #E9C9C9 and warm cream #F7F0E6 chenille fibers, very shallow depth of field, soft edge blur, believable handcrafted bends, and subtle forest-green reflected shadow. Objects must remain fully separated with clean antialiased alpha edges. Transparent background with true alpha, no full flower, no center, no stems, no text, no border, no opaque backdrop, no checkerboard. Premium editorial photographic realism, 3:2 composition, 2400×1600 transparent PNG.
```

### 3. Middle-depth petals and bokeh

```text
Create a second transparent depth layer for a luxury chenille-flower fly-through, visually distinct from the foreground layer. Arrange six to nine smaller handcrafted pipe-cleaner petals sparsely near the top-left, upper-right, and lower-right edges, leaving the center open. Use soft lilac #C9B6E4, warm cream #F7F0E6, and very restrained muted-gold #B8925A bokeh accents. Show detailed fuzzy fibers with moderate depth of field and gentler blur than a foreground layer; preserve natural asymmetry and calm motion-ready spacing. Clean true-alpha edges around every separate object. No complete flower, no flower center, no stems, no text, no logo, no border, no opaque or checkerboard background. High-end editorial photographic realism, 3:2 composition, 2400×1600 transparent PNG.
```

## Asset destinations

- `/public/brand` — logo, favicon, and approved marks
- `/public/images/hero` — Phase 1 flower and transparent depth layers
- `/public/images/products` — approved and retouched catalogue imagery
- `/public/images/craft` — Phase 4 framed flower and high-resolution macro
- `/public/images/process` — five 4:5 making-process photographs
- `/public/images/gallery` — editorial and lifestyle photography
- `/public/images/instagram` — ten square social-strip photographs
- `/public/sequence` — numbered WebP dive frames

## Verification checklist

- [ ] Desktop at 1440px: first loader lasts at least 450 ms, reports real progress, becomes the gold frame, and releases scrolling.
- [ ] Repeat visit in the same tab: loader adds no artificial delay and still reports asset progress.
- [ ] Desktop: 260vh pin, all depth layers, poem timing, scale-2 dive, light bloom, and seamless cream release.
- [ ] Tablet at 768–1023px: 220vh pin, reduced particle field, scale-1.85 dive, and no clipped corner copy.
- [ ] Mobile at 320px: 180vh pin, `100svh`, portrait artwork, one petal layer, scale-1.7 dive, safe-area skip position, and no horizontal overflow.
- [ ] Scroll from start to finish and back: every master-timeline state reverses without a jump or stale layer.
- [ ] Activate “Skip intro” by pointer and keyboard: Lenis reaches `#home` in 1.6 seconds and focus remains visible.
- [ ] Reload at a mid-intro and post-intro position: the browser-restored position remains intact after preload and ScrollTrigger refresh.
- [ ] Enable `prefers-reduced-motion: reduce`: no pin, Lenis smoothing, canvas sequence, particle loop, blur, or dive; static brand/flower and Home headline remain visible.
- [ ] Test `INTRO_MODE = "layers"` with all final layered assets and both responsive flower crops.
- [ ] Test `INTRO_MODE = "sequence"` with the configured frame count; remove selected frames temporarily and confirm the last/nearest decoded frame remains visible without a crash.
- [ ] Confirm all images decode, the page has zero layout shift in the intro, and the console has no errors, hydration warnings, or failed same-origin asset requests.
- [ ] Run `npm run test:performance` against the production server, then record Chrome DevTools Performance while scrubbing 0%→100%→0%: verify no React commits during scrub, no repeated layout reads in `onUpdate`, no post-preload image decode, no intro-attributable long tasks, and smooth target-device frame delivery.

## Phase 0 foundation retained

- Strict Next.js App Router and TypeScript configuration
- Lora and Poppins through `next/font`
- Exact semantic palette and responsive type scale
- Reusable interface and animation primitives
- Centralized GSAP/ScrollTrigger setup with scoped cleanup
- Lenis synchronized to the GSAP ticker
- Live reduced-motion handling
- Typed catalogue and service records

`SplitTextReveal` continues to use the local accessible word/newline splitter, avoiding a dependency on the separately licensed GSAP SplitText plugin.

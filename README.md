# Studio Viana — Phase 0

The Phase 0 application is a temporary, responsive design-system preview for Studio Viana. It validates the approved palette, typography, UI primitives, typed catalogue data, smooth scrolling, and reusable motion foundations before public website sections are built.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route is the temporary design-system preview, not the final homepage.

Useful quality commands:

```bash
npm run test
npm run check
```

## Asset destinations

- `/public/brand` — logo, favicon, and approved brand marks
- `/public/images/hero` — the Phase 1 ultra-HD hero flower
- `/public/images/products` — approved and retouched catalogue imagery
- `/public/images/gallery` — editorial and lifestyle photography
- `/public/sequence` — optimized image sequences for later scroll storytelling

The two botanical SVGs in `/public/images/gallery` are neutral, fixed-dimension animation fixtures. They should be replaced when final art direction and retouched assets are approved.

## Phase 0 checklist

- [x] Strict Next.js and TypeScript foundation
- [x] Lora and Poppins font integration
- [x] Exact semantic palette and responsive type scale
- [x] Eight reusable interface primitives
- [x] GSAP and ScrollTrigger setup with scoped cleanup
- [x] Lenis synchronized to the GSAP ticker
- [x] Live reduced-motion handling
- [x] Six reusable animation primitives
- [x] Typed catalogue and service records
- [x] Responsive temporary showcase and placeholder asset structure
- [x] Unit, lifecycle, accessibility-contract, lint, type, format, and production-build gates

`SplitTextReveal` deliberately uses a small local word/newline splitter. It preserves one unsplit accessible string and avoids depending on the separately licensed GSAP SplitText plugin or hydration-sensitive line measurement.

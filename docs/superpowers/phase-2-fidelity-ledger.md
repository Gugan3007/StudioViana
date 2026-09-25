# Phase 2 fidelity ledger

Date: 2026-09-25  
Branch: `feature/phase-2`

## Evidence

Approved concepts:

- `docs/superpowers/concepts/phase-2/home-desktop.jpg`
- `docs/superpowers/concepts/phase-2/home-mobile.jpg`
- `docs/superpowers/concepts/phase-2/about-desktop.jpg`
- `docs/superpowers/concepts/phase-2/craft-desktop.jpg`

Final production renders:

- `/tmp/studio-viana-phase2-evidence-home-1440.png`
- `/tmp/studio-viana-phase2-evidence-home-390.png`
- `/tmp/studio-viana-phase2-evidence-about-1440.png`
- `/tmp/studio-viana-phase2-evidence-craft-1440.png`
- `/tmp/studio-viana-phase2-evidence-full-{360,768,1024,1920}.png`

The render and its matching concept were inspected together with `view_image` at original detail. Browser/IAB was unavailable, so the production Playwright Chromium runtime supplied the render evidence.

## Home desktop comparison

1. Copy: the label, exact headline, supporting paragraph, two actions, trust row, scroll cue, and `2026–27 Collection` line all match the approved content hierarchy.
2. Composition: the live 12-column layout preserves the concept's text-led left half and asymmetric four-image collage on the right without overlap into the copy.
3. Typography: the Lora headline holds the intended three-line rhythm; `forever` remains italic and gold, with Poppins used for utility and body copy.
4. Palette: cream `#F7F0E6`, charcoal, muted gold, forest, and the restrained blush glow match the concept. The intro and Home share the exact cream surface.
5. Asset treatment: the main portrait has an offset hairline frame; three secondary crops overlap at distinct scales and the circular badge sits over the primary image.
6. Spacing: actions and trust copy retain an editorial pause beneath the paragraph, while bottom utility copy stays anchored without crowding.
7. Navigation: the live render includes the complete 84px desktop navigation, its ornamental wordmark, five links, and outlined WhatsApp action.

## Home mobile comparison

1. The wordmark and two-line menu trigger fit inside the 390px header with no overflow.
2. The headline preserves the concept's three-line stack and gold italic emphasis without clipping at 360px or 390px.
3. Body measure stays readable and both calls to action become full-width in the approved order.
4. The trust row remains a single compact editorial line at 390px and wraps safely at 360px.
5. The image collage follows the text, keeps the primary bouquet dominant, and retains the badge and asymmetric secondary image.
6. Mouse parallax is absent and the hidden fourth image reduces density as specified for touch layouts.

## About comparison

1. The desktop section retains the approved 45/55 image-to-copy split and stacks the 70svh image first on mobile.
2. The portrait crop keeps the bouquet and ceramic vessel as the focal point; the translucent forest caption remains legible at the lower edge.
3. The quote mark, label, headline, divider, exact two paragraphs, signature, underline, and founder label follow the approved reading order.
4. The live headline uses a responsive three-line wrap appropriate to its 55% column, while preserving the concept's scale and generous negative space.
5. The magnolia line art remains gold at low opacity and occupies the lower-right corner without interfering with copy.
6. The values strip has four equal columns, gold type and hairline dividers; reduced motion now guarantees final `100%`, while normal motion counts from zero.
7. Word-scrub copy keeps one semantic paragraph per passage and a separate `aria-hidden` visual layer.

## Craft comparison

1. The 70svh band uses the approved lily image, full-bleed crop, bottom gradient and one-line cream headline on desktop.
2. Normal motion expands from `inset(10% 12% round 4px)` and scale `1.2`; reduced motion renders the final full-bleed state.
3. The centred label and `What We Do` heading preserve the concept's typographic scale and calm vertical interval.
4. Four service columns retain `01–04`, gold rules, exact descriptions and bottom-aligned Discover links; tablet becomes 2×2 and mobile becomes a stack.
5. Fine-pointer previews stay decorative, follow the pointer with `quickTo`, and are absent on touch and reduced-motion layouts.
6. The forest marquee matches the concept's cream italic cadence and is the only dark theme region in this section.
7. Navigation switches to the dark theme over the marquee, and its direction behavior was verified with real wheel input.

## Changes made during comparison

- Reduced the Home desktop headline scale so its explicit lines do not wrap into five visual lines.
- Tightened the About headline measure and Craft band headline scale to match the concept rhythm.
- Reduced service-section excess height while preserving the editorial spacing.
- Forced animated values back to `100%` and `01–04` if reduced motion settles after initial mount.
- Removed the underlying SSR split-text transform after the hero enters, preventing a residual 110% offset beneath GSAP.
- Added first-view hero entry for native jumps across the pinned intro and kept its one-shot timeline alive when intro state settles.
- Corrected Lenis anchor math so CSS scroll margin and the explicit `-84px` offset are not applied twice.
- Made active-link sampling robust around the pinned intro and allowed nested dark theme regions such as the marquee.

## Responsive and runtime evidence

- No horizontal overflow at 360, 390, 768, 1024, 1440, or 1920px.
- All images decoded after their owning section was brought into view; no failed same-origin responses, console errors, or hydration warnings were recorded.
- Mobile focus trap, Shift+Tab wrap, Escape close, and focus return passed.
- Production Chrome traces for the intro and Home/About/Craft scroll contained no main-thread task at or above 50ms.
- Reduced motion has no pin, cursor preview, float/parallax loop, word scrub, or frame expansion and shows all final values.

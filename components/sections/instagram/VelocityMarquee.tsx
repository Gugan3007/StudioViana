import { Marquee } from "@/components/animations/Marquee";

const primary = "Handcrafted ✿ Made to order ✿ Curated with love ✿";
const secondary =
  "BOUQUETS · HAMPERS · FLOWER CARDS · RETURN GIFTS · CORPORATE EVENTS ·";

export function VelocityMarquee() {
  return (
    <section
      aria-label="Studio Viana services"
      className="overflow-hidden bg-forest-deep py-9 text-cream md:py-12"
      data-theme="dark"
    >
      <p className="sr-only">
        Handcrafted, made to order and curated with love. Bouquets, hampers,
        flower cards, return gifts and corporate events.
      </p>
      <div aria-hidden="true">
        <Marquee
          skew
          className="font-display text-[clamp(3rem,6vw,5.25rem)] italic leading-none"
          speed={26}
          text={primary}
          velocityFactor={1}
        />
        <Marquee
          reverse
          skew
          className="mt-5 font-body text-sm font-medium uppercase tracking-[0.22em] text-gold-light md:text-lg"
          speed={34}
          text={secondary}
          velocityFactor={1}
        />
      </div>
    </section>
  );
}

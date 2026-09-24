import { Marquee } from "@/components/animations/Marquee";
import { Reveal } from "@/components/animations/Reveal";
import { SplitTextReveal } from "@/components/animations/SplitTextReveal";
import { ExpandingImageBand } from "@/components/sections/home/ExpandingImageBand";
import { ServiceColumn } from "@/components/sections/home/ServiceColumn";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { services } from "@/lib/data/products";
import flowerCard from "@/public/images/products/flower-card.jpg";
import grandBouquet from "@/public/images/products/grand-bouquet.jpg";
import hamper from "@/public/images/products/just-for-you-hamper.jpg";
import lilacDome from "@/public/images/products/lilac-pearl-dome.jpg";

const previewImages = [hamper, grandBouquet, lilacDome, flowerCard] as const;

export function WhatWeDo() {
  return (
    <section
      id="craft"
      aria-labelledby="craft-heading"
      className="scroll-mt-[84px] bg-cream-soft text-charcoal"
    >
      <ExpandingImageBand />

      <Container className="py-section">
        <header className="mx-auto max-w-3xl text-center">
          <SectionLabel>Our Craft</SectionLabel>
          <div className="mt-5">
            <SplitTextReveal
              as="h2"
              className="font-display text-[clamp(3rem,6vw,5.8rem)] font-medium leading-none tracking-[-0.045em]"
              id="craft-heading"
              type="lines"
            >
              What We Do
            </SplitTextReveal>
          </div>
        </header>

        <Reveal
          className="mt-[clamp(4rem,8vw,7rem)] grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4"
          stagger={0.12}
        >
          {services.map((service, index) => (
            <ServiceColumn
              key={service.number}
              image={previewImages[index]}
              service={service}
            />
          ))}
        </Reveal>
      </Container>

      <div
        className="bg-forest py-9 text-cream"
        data-theme="dark"
        data-testid="craft-marquee"
      >
        <Marquee
          className="font-display text-[clamp(2.7rem,6vw,4.4rem)] italic leading-none"
          speed={24}
          text="Handcrafted ✿ Made to order ✿ Never fades ✿ Curated with love ✿"
        />
      </div>
    </section>
  );
}

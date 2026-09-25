import { IntroSection } from "@/components/intro/IntroSection";
import { AboutStudio } from "@/components/sections/home/AboutStudio";
import { HomeHero } from "@/components/sections/home/HomeHero";
import { WhatWeDo } from "@/components/sections/home/WhatWeDo";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionLabel } from "@/components/ui/SectionLabel";

const shells = [
  {
    id: "collection",
    label: "Phase 3",
    heading: "The Collection",
    tone: "light" as const,
  },
  {
    id: "pricing",
    label: "Phase 4",
    heading: "Made for your moment",
    tone: "soft" as const,
  },
  {
    id: "contact",
    label: "Phase 5",
    heading: "Begin a conversation",
    tone: "light" as const,
  },
] as const;

export default function Home() {
  return (
    <main className="overflow-clip">
      <IntroSection />
      <HomeHero />
      <AboutStudio />
      <WhatWeDo />

      {shells.map((shell) => {
        const headingId = `${shell.id}-heading`;
        return (
          <Section
            key={shell.id}
            id={shell.id}
            aria-labelledby={headingId}
            className="flex min-h-[62svh] items-center"
            tone={shell.tone}
          >
            <Container>
              <div className="border-t border-gold/30 pt-8">
                <SectionLabel>{shell.label}</SectionLabel>
                <h2
                  className="mt-5 max-w-4xl font-display text-[clamp(2.7rem,6vw,5.8rem)] leading-[1.02] tracking-[-0.04em] text-charcoal"
                  id={headingId}
                >
                  {shell.heading}
                </h2>
              </div>
            </Container>
          </Section>
        );
      })}
    </main>
  );
}

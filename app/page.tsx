import { IntroSection } from "@/components/intro/IntroSection";
import { HomeHeroPlaceholder } from "@/components/sections/HomeHeroPlaceholder";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { SectionLabel } from "@/components/ui/SectionLabel";

export default function Home() {
  return (
    <main className="overflow-clip">
      <IntroSection />
      <HomeHeroPlaceholder />

      <Section
        className="flex min-h-[72svh] items-center"
        aria-labelledby="transition-check-heading"
        tone="soft"
      >
        <Container grid>
          <div className="col-span-12 md:col-span-8 md:col-start-3">
            <SectionLabel>Transition test surface / 01</SectionLabel>
            <Heading
              as="h2"
              className="mt-6"
              id="transition-check-heading"
              italic="flow"
              size="h1"
            >
              A quiet place to test the flow
            </Heading>
            <p className="mt-7 max-w-xl text-sm leading-7 text-muted">
              This neutral section provides scroll distance for validating the
              intro release. It will be replaced by the full Phase 2 story.
            </p>
          </div>
        </Container>
      </Section>

      <Section
        className="flex min-h-[72svh] items-center"
        aria-labelledby="continuity-check-heading"
      >
        <Container grid>
          <div className="col-span-12 border-t border-gold/35 pt-8 md:col-span-9 md:col-start-2">
            <SectionLabel>Transition test surface / 02</SectionLabel>
            <Heading
              as="h2"
              className="mt-6"
              id="continuity-check-heading"
              size="h2"
            >
              Natural scrolling resumes here
            </Heading>
          </div>
        </Container>
      </Section>
    </main>
  );
}

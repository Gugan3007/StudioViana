import { SplitTextReveal } from "@/components/animations/SplitTextReveal";
import { Container } from "@/components/ui/Container";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function HomeHeroPlaceholder() {
  return (
    <section
      id="home"
      aria-labelledby="home-hero-heading"
      className="relative flex min-h-[100svh] scroll-mt-0 items-center overflow-hidden bg-cream text-charcoal"
      data-home-hero
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_72%_32%,rgba(214,185,138,0.18),transparent_34%)]"
      />
      <Container className="relative z-10 py-[clamp(6rem,14vw,11rem)]" grid>
        <div className="col-span-12 md:col-span-10 md:col-start-2 lg:col-span-9">
          <SectionLabel>Phase 2 begins here</SectionLabel>
          <div className="mt-8">
            <SplitTextReveal
              controlled
              as="h1"
              className="font-display text-[clamp(3rem,8vw,7.75rem)] font-medium leading-[0.95] tracking-[-0.04em] text-charcoal"
              id="home-hero-heading"
              type="lines"
            >
              {"Where flowers become\nforever memories."}
            </SplitTextReveal>
          </div>
          <div className="mt-12 grid gap-7 sm:grid-cols-[auto_1fr] sm:items-start">
            <GoldDivider />
            <p className="max-w-md text-sm leading-7 text-muted">
              The complete Home hero, About story, and What We Do composition
              arrive in Phase 2. This surface completes the cinematic handoff.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

"use client";

import Image from "next/image";

import { Float } from "@/components/animations/Float";
import { ImageReveal } from "@/components/animations/ImageReveal";
import { Marquee } from "@/components/animations/Marquee";
import { ParallaxImage } from "@/components/animations/ParallaxImage";
import { Reveal } from "@/components/animations/Reveal";
import { SplitTextReveal } from "@/components/animations/SplitTextReveal";
import { Container } from "@/components/ui/Container";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { SectionLabel } from "@/components/ui/SectionLabel";

const specimenLabel =
  "font-body text-[0.62rem] font-medium uppercase tracking-[0.26em] text-muted";

export function AnimationShowcase() {
  return (
    <>
      <Section
        id="motion-specimens"
        tone="light"
        aria-labelledby="motion-heading"
      >
        <Container>
          <div className="mb-16 grid gap-8 border-b border-gold/30 pb-12 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <SectionLabel>05 / Motion language</SectionLabel>
              <Heading
                as="h2"
                id="motion-heading"
                className="mt-5 max-w-3xl"
                italic="quietly"
                size="h1"
              >
                Movement, considered quietly
              </Heading>
            </div>
            <p className="max-w-md text-sm leading-7 text-muted md:col-span-4">
              Scroll-triggered studies for copy and imagery. Every specimen
              resolves to the same final state when reduced motion is preferred.
            </p>
          </div>

          <div className="grid gap-x-8 gap-y-20 lg:grid-cols-2">
            <article className="border-t border-gold/40 pt-5">
              <p className={specimenLabel}>Reveal / stagger</p>
              <Reveal className="mt-12 space-y-4" stagger={0.1}>
                <p
                  data-reveal-item
                  className="font-display text-h3 text-charcoal"
                >
                  Soft entrances.
                </p>
                <p data-reveal-item className="max-w-lg text-muted">
                  Opacity and vertical movement share one deliberate rhythm
                  without hiding the underlying content.
                </p>
                <GoldDivider data-reveal-item animate className="mt-8" />
              </Reveal>
            </article>

            <article className="border-t border-gold/40 pt-5">
              <p className={specimenLabel}>Split text / words</p>
              <SplitTextReveal
                as="h3"
                className="mt-12 max-w-xl font-display text-h2 font-medium tracking-[-0.025em]"
                type="words"
              >
                Flowers that never fade
              </SplitTextReveal>
            </article>

            <article className="border-t border-gold/40 pt-5">
              <p className={specimenLabel}>Image reveal / clip</p>
              <ImageReveal
                alt="Abstract botanical study in forest, blush, and cream"
                className="mt-7 shadow-soft"
                src="/images/gallery/placeholder-botanical-01.svg"
              />
            </article>

            <article className="border-t border-gold/40 pt-5 lg:mt-24">
              <p className={specimenLabel}>Parallax image / scroll</p>
              <ParallaxImage
                alt="Abstract lilac botanical arrangement"
                className="mt-7 shadow-soft"
                speed={0.45}
                src="/images/gallery/placeholder-botanical-02.svg"
              />
            </article>
          </div>
        </Container>
      </Section>

      <Section
        tone="dark"
        className="overflow-hidden"
        aria-labelledby="ambient-heading"
      >
        <Container>
          <div className="grid min-h-[65rem] gap-20 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <SectionLabel>06 / Ambient motion</SectionLabel>
              <Heading
                as="h2"
                id="ambient-heading"
                className="mt-5 max-w-xl"
                italic="alive"
                light
                size="h1"
              >
                A system that feels alive
              </Heading>
              <p className="mt-7 max-w-md text-sm leading-7 text-cream/65">
                A restrained floating study tests continuous motion, pointer
                response, and graceful cleanup.
              </p>
            </div>

            <div className="relative flex min-h-[32rem] items-center justify-center lg:col-span-7">
              <div
                className="absolute inset-8 border border-gold/20"
                aria-hidden="true"
              />
              <Float
                className="relative w-[min(78vw,31rem)]"
                mouseParallax={18}
                strength={16}
              >
                <Image
                  alt="Floating abstract botanical fixture"
                  className="h-auto w-full shadow-[0_30px_90px_rgba(0,0,0,0.22)]"
                  height={1200}
                  src="/images/gallery/placeholder-botanical-01.svg"
                  width={1600}
                />
              </Float>
            </div>
          </div>
        </Container>

        <div className="border-y border-gold/20 py-10">
          <Marquee
            className="font-display text-[clamp(3rem,8vw,8rem)] leading-none tracking-[-0.04em] text-cream/90"
            speed={28}
            text="FLOWERS THAT NEVER FADE · "
          />
        </div>
      </Section>
    </>
  );
}

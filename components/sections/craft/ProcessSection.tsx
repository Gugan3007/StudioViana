"use client";

import { SplitTextReveal } from "@/components/animations/SplitTextReveal";
import { LineIcon } from "@/components/sections/craft/LineIcon";
import { ProcessStep } from "@/components/sections/craft/ProcessStep";
import { StemPath } from "@/components/sections/craft/StemPath";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { processSteps } from "@/lib/data/process";
import { whatsappLink } from "@/lib/utils";

const customOrderMessage =
  "Hi Studio Viana! 🌸 I'd like to start a custom order.";

export function ProcessSection() {
  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="overflow-hidden bg-cream px-gutter py-[clamp(6rem,12vw,11rem)]"
      data-theme="light"
    >
      <header className="mx-auto max-w-3xl text-center">
        <SectionLabel>The Process</SectionLabel>
        <SplitTextReveal
          as="h2"
          className="mt-5 font-display text-[clamp(3.2rem,7vw,6.5rem)] leading-[0.94] tracking-[-0.045em] text-forest"
          id="process-heading"
          type="words"
        >
          From Stem to Story
        </SplitTextReveal>
        <p className="mx-auto mt-7 max-w-2xl font-body text-sm font-light leading-7 text-charcoal/70 md:text-base">
          Every order is made just for you — here&apos;s how a Studio Viana
          piece comes to life.
        </p>
      </header>

      <div
        className="relative mx-auto mt-20 max-w-6xl md:mt-28"
        data-process-timeline
      >
        <StemPath />
        {processSteps.map((step, index) => (
          <ProcessStep key={step.number} index={index} step={step} />
        ))}
        <div className="relative z-10 mx-auto flex max-w-sm flex-col items-center bg-cream pt-6 text-center">
          <LineIcon icon="flower" />
          <p className="mt-4 font-display text-2xl italic text-forest">
            Begin with a feeling.
          </p>
          <Button
            className="mt-7"
            href={whatsappLink(customOrderMessage)}
            rel="noreferrer"
            target="_blank"
            variant="outline-gold"
          >
            Start your order
          </Button>
        </div>
      </div>
    </section>
  );
}

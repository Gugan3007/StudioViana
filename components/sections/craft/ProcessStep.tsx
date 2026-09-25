"use client";

import { ImageReveal } from "@/components/animations/ImageReveal";
import { LineIcon } from "@/components/sections/craft/LineIcon";
import type { ProcessStepData } from "@/lib/data/process";
import { cn } from "@/lib/utils";

interface ProcessStepProps {
  index: number;
  step: ProcessStepData;
}

export function ProcessStep({ index, step }: ProcessStepProps) {
  const reverse = index % 2 === 1;

  return (
    <article
      className="relative grid gap-7 pb-20 pl-12 last:pb-4 md:grid-cols-[1fr_5rem_1fr] md:items-center md:gap-8 md:pb-32 md:pl-0"
      data-process-step
    >
      <div
        className={cn(
          "md:col-start-1 md:row-start-1",
          reverse ? "md:col-start-3" : "md:col-start-1",
        )}
      >
        <ImageReveal
          alt={step.alt}
          className="aspect-[4/5] border border-gold/30"
          imageClassName="object-cover"
          parallaxSpeed={0.35}
          sizes="(min-width: 1024px) 34vw, (min-width: 768px) 40vw, 82vw"
          src={step.image}
        />
      </div>

      <span
        aria-hidden="true"
        className="absolute left-[0.95rem] top-8 z-10 h-3.5 w-3.5 rounded-full border border-gold bg-cream shadow-[0_0_0_7px_rgba(190,151,83,0.12)] md:static md:col-start-2 md:row-start-1 md:mx-auto"
        data-process-node
      />

      <div
        className={cn(
          "md:row-start-1",
          reverse ? "md:col-start-1 md:text-right" : "md:col-start-3",
        )}
      >
        <div className={cn("flex", reverse && "md:justify-end")}>
          <LineIcon icon={step.icon} />
        </div>
        <p
          aria-hidden="true"
          className="mt-5 font-display text-[clamp(3.5rem,6vw,5rem)] leading-none text-transparent [-webkit-text-stroke:1px_rgba(190,151,83,0.7)]"
        >
          {step.number}
        </p>
        <h3 className="mt-3 font-display text-[clamp(1.8rem,3vw,2.8rem)] leading-tight text-forest">
          {step.title}
        </h3>
        <p className="mt-4 max-w-md font-body text-sm font-light leading-7 text-charcoal/70 md:inline-block">
          {step.description}
        </p>
      </div>
    </article>
  );
}

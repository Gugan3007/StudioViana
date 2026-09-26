"use client";

import { SplitTextReveal } from "@/components/animations/SplitTextReveal";

export function BigWordmark() {
  return (
    <div className="overflow-hidden border-b border-gold/20 py-6 text-center">
      <SplitTextReveal
        as="p"
        className="whitespace-nowrap font-display text-[clamp(3.25rem,13.8vw,13rem)] leading-[0.78] tracking-[-0.075em] text-cream/[0.08]"
        type="characters"
      >
        STUDIO VIANA
      </SplitTextReveal>
    </div>
  );
}

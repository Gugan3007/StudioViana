import Image from "next/image";

import { introConfig } from "@/components/intro/intro.config";
import { AmbientParticles } from "@/components/intro/AmbientParticles";
import { ScrollCue } from "@/components/intro/ScrollCue";

interface BrandMomentProps {
  particleCount: number;
}

export function BrandMoment({ particleCount }: BrandMomentProps) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_46%,#294431_0%,#1f3326_46%,#16241b_100%)] text-cream"
      data-intro-brand
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-8 border border-gold/55 max-sm:inset-4"
        data-intro-frame
      />

      <AmbientParticles count={particleCount} />

      <p
        className="absolute left-10 top-9 font-body text-[0.55rem] font-medium uppercase tracking-[0.28em] text-gold-light max-sm:left-6 max-sm:top-6 max-sm:max-w-24 max-sm:leading-relaxed"
        data-intro-brand-copy
        data-intro-frame-meta
      >
        TAMIL NADU · INDIA
      </p>
      <p
        className="absolute right-10 top-9 text-right font-body text-[0.55rem] font-medium uppercase tracking-[0.28em] text-gold-light max-sm:right-6 max-sm:top-6 max-sm:max-w-28 max-sm:leading-relaxed"
        data-intro-brand-copy
        data-intro-frame-meta
      >
        2026–27 COLLECTION
      </p>

      <div className="relative z-10 flex w-[min(88vw,48rem)] flex-col items-center text-center">
        <p
          className="mb-8 font-body text-[0.58rem] font-medium uppercase tracking-[0.52em] text-gold max-sm:max-w-64 max-sm:text-[0.52rem] max-sm:leading-loose max-sm:tracking-[0.34em]"
          data-intro-brand-copy
        >
          HANDCRAFTED CHENILLE FLORALS
        </p>
        <div
          className="relative h-[clamp(12rem,30vw,21rem)] w-[clamp(17rem,46vw,35rem)]"
          data-intro-logo
        >
          <Image
            alt="Studio Viana"
            className="object-contain"
            fetchPriority="high"
            fill
            loading="eager"
            sizes="(max-width: 767px) 85vw, 560px"
            src={introConfig.assets.logo}
          />
        </div>
        <p
          className="text-cream/88 mt-7 max-w-xl font-display text-[clamp(1rem,1.8vw,1.4rem)] italic leading-relaxed"
          data-intro-brand-copy
        >
          Flowers that never fade, feelings that never end
        </p>
      </div>

      <ScrollCue />
    </div>
  );
}

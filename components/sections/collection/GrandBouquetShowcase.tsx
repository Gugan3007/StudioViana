"use client";

import Image from "next/image";
import { useRef } from "react";

import { SplitTextReveal } from "@/components/animations/SplitTextReveal";
import { PearlParticles } from "@/components/sections/collection/PearlParticles";
import { Button } from "@/components/ui/Button";
import { PriceTag } from "@/components/ui/PriceTag";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { gsap } from "@/lib/animations/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { getProductBySlug, type Product } from "@/lib/data/products";
import { whatsappLink } from "@/lib/utils";
import { orderMessage } from "@/lib/utils/whatsapp";

interface GrandBouquetShowcaseProps {
  onOpenDetail: (product: Product, trigger: HTMLElement) => void;
}

const grandBouquet = getProductBySlug("grand-bouquet")!;
const grandBouquetMobile = grandBouquet.gallery[1] ?? grandBouquet.gallery[0]!;

export function GrandBouquetShowcase({
  onOpenDetail,
}: GrandBouquetShowcaseProps) {
  const root = useRef<HTMLElement>(null);
  const image = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (shouldReduceMotion || !root.current) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        image.current,
        { scale: 1.15 },
        {
          ease: "none",
          scale: 1,
          scrollTrigger: {
            end: "bottom top",
            scrub: true,
            start: "top bottom",
            trigger: root.current,
          },
        },
      );
      gsap.fromTo(
        veil.current,
        { opacity: 0.76 },
        {
          ease: "none",
          opacity: 0.48,
          scrollTrigger: {
            end: "bottom top",
            scrub: true,
            start: "top bottom",
            trigger: root.current,
          },
        },
      );
    }, root);

    return () => context.revert();
  }, [shouldReduceMotion]);

  return (
    <section
      ref={root}
      aria-labelledby="grand-bouquet-heading"
      className="relative isolate min-h-[100svh] overflow-hidden bg-forest-deep text-cream"
      data-grand-bouquet
      data-theme="dark"
    >
      <div ref={image} className="absolute inset-0 will-change-transform">
        <Image
          fill
          alt={grandBouquet.heroAlt}
          className="hidden object-cover md:block"
          placeholder="blur"
          sizes="100vw"
          src={grandBouquet.heroImage}
        />
        <Image
          fill
          alt={grandBouquetMobile.alt}
          className="object-cover md:hidden"
          placeholder="blur"
          sizes="100vw"
          src={grandBouquetMobile.image}
        />
      </div>
      <div
        ref={veil}
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,18,12,0.3)_0%,rgba(9,18,12,0.48)_45%,rgba(9,18,12,0.92)_100%)]"
      />
      <PearlParticles />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-4 z-20 border border-gold/60 md:inset-8"
      />

      <div className="relative z-30 mx-auto flex min-h-[100svh] max-w-4xl flex-col items-center justify-end px-gutter pb-[clamp(5rem,9vw,8rem)] pt-32 text-center">
        <SectionLabel className="text-gold-light">Signature 07</SectionLabel>
        <SplitTextReveal
          as="h2"
          className="mt-5 text-balance font-display text-[clamp(3.6rem,9vw,8rem)] leading-[0.9] tracking-[-0.055em] text-cream"
          id="grand-bouquet-heading"
          type="characters"
        >
          The Grand Bouquet
        </SplitTextReveal>
        <p className="mt-7 max-w-2xl text-balance font-display text-[clamp(1.15rem,2vw,1.55rem)] italic leading-8 text-cream/90">
          Our most opulent creation — a full, rounded dome of blooms wrapped in
          imported sheer, for the moments that deserve a grand gesture.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <PriceTag className="border-gold-light/75 text-cream">
            {grandBouquet.priceLabel}
          </PriceTag>
          <Button
            className="border-gold-light text-cream before:bg-gold"
            data-preload-product-detail
            onClick={(event) => onOpenDetail(grandBouquet, event.currentTarget)}
            variant="outline-gold"
          >
            View Details
          </Button>
          <Button
            className="text-cream"
            href={whatsappLink(orderMessage(grandBouquet, {}))}
            rel="noreferrer"
            target="_blank"
            variant="text-link"
          >
            Order on WhatsApp <span aria-hidden="true">→</span>
          </Button>
        </div>
      </div>

      <p className="absolute bottom-5 left-6 z-30 hidden text-[0.52rem] uppercase tracking-[0.2em] text-cream/65 sm:block md:bottom-12 md:left-12">
        Handcrafted in Tamil Nadu · Made to last
      </p>
    </section>
  );
}

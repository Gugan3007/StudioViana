"use client";

import Image from "next/image";

import { Float } from "@/components/animations/Float";
import { BulkEnquiryForm } from "@/components/sections/corporate/BulkEnquiryForm";
import { ClientLogos } from "@/components/sections/corporate/ClientLogos";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import flowerCards from "@/public/images/products/flower-cards-lily-bookmarks.jpg";
import grandBouquet from "@/public/images/products/grand-bouquet-hero.jpg";
import hamper from "@/public/images/products/hamper-hero.jpg";

const useCases = [
  ["◇", "Weddings & receptions"],
  ["⌁", "Corporate events & launches"],
  ["✦", "Felicitations & awards"],
  ["◌", "Birthday & party return gifts"],
] as const;

const features = [
  "Custom branding & tags",
  "Bulk pricing",
  "Colour-matched to your theme",
] as const;

export function CorporateSection() {
  return (
    <section
      id="corporate"
      aria-labelledby="corporate-heading"
      className="relative scroll-mt-[84px] overflow-hidden bg-forest py-section text-cream"
      data-theme="dark"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-8 border border-gold/35"
      />
      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-[.92fr_1.08fr] lg:gap-16">
          <div>
            <SectionLabel className="text-gold-light">
              F O R &nbsp; B R A N D S &nbsp; &amp; &nbsp; C E L E B R A T I O N
              S
            </SectionLabel>
            <h2
              className="mt-6 max-w-3xl text-balance font-display text-[clamp(3.2rem,6vw,6.6rem)] leading-[0.94] tracking-[-0.05em]"
              id="corporate-heading"
            >
              Corporate gifting &amp; return gifts, made by hand.
            </h2>
            <p className="mt-7 max-w-2xl font-light leading-8 text-cream/70">
              Bespoke floral favours and centrepieces for launches,
              felicitations and milestone corporate moments — and delicate
              flower cards and keepsakes, thoughtfully priced for weddings,
              parties and bulk gifting.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-6">
              {useCases.map(([icon, label]) => (
                <div key={label} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="font-display text-2xl text-gold-light"
                  >
                    {icon}
                  </span>
                  <span className="text-sm leading-6 text-cream/85">
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <ul className="mt-9 grid gap-3 border-t border-gold/35 pt-6 text-xs uppercase tracking-[0.12em] text-cream/70 sm:grid-cols-3">
              {features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span aria-hidden="true" className="text-gold">
                    ✦
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="relative min-h-[36rem] sm:min-h-[44rem]"
            aria-label="Corporate gifting gallery"
          >
            <Float
              className="absolute left-0 top-[8%] w-[55%]"
              mouseParallax={10}
              strength={8}
            >
              <div className="relative aspect-[4/5] overflow-hidden border border-gold/35 bg-cream-soft">
                <Image
                  fill
                  alt="Flower cards arranged for thoughtful return gifting"
                  className="object-cover"
                  placeholder="blur"
                  sizes="32vw"
                  src={flowerCards}
                />
              </div>
            </Float>
            <Float
              className="absolute right-0 top-0 z-10 w-[52%]"
              delay={0.5}
              mouseParallax={17}
              strength={12}
            >
              <div className="relative aspect-square overflow-hidden border border-gold/35 bg-cream-soft">
                <Image
                  fill
                  alt="Grand handcrafted floral centrepiece for a celebration"
                  className="object-cover"
                  placeholder="blur"
                  sizes="30vw"
                  src={grandBouquet}
                />
              </div>
            </Float>
            <Float
              className="absolute bottom-[4%] left-[22%] z-20 w-[58%]"
              delay={0.9}
              mouseParallax={24}
              strength={16}
            >
              <div className="relative aspect-[4/3] overflow-hidden border border-gold/35 bg-cream-soft">
                <Image
                  fill
                  alt="Hand-filled floral hamper for a corporate gift"
                  className="object-cover"
                  placeholder="blur"
                  sizes="34vw"
                  src={hamper}
                />
              </div>
            </Float>
          </div>
        </div>

        <div className="mt-16">
          <SectionLabel className="text-gold-light">
            B U L K &nbsp; E N Q U I R Y
          </SectionLabel>
          <h3 className="mt-4 max-w-xl font-display text-4xl leading-tight sm:text-5xl">
            Let&apos;s create something meaningful together.
          </h3>
          <BulkEnquiryForm />
        </div>
        <ClientLogos logos={[]} />
      </Container>
    </section>
  );
}

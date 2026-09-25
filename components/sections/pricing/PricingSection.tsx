"use client";

import { useEffect, useRef } from "react";

import { Reveal } from "@/components/animations/Reveal";
import { SplitTextReveal } from "@/components/animations/SplitTextReveal";
import { CustomisationNote } from "@/components/sections/pricing/CustomisationNote";
import {
  PricingRow,
  type PricingRowData,
} from "@/components/sections/pricing/PricingRow";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { products } from "@/lib/data/products";

const details = [
  "One made-to-order stem, gift wrapped",
  "Single bloom on a keepsake card",
  "1–2 stems, hand-tied",
  "Statement bloom with accents",
  "Gathered multi-flower posy",
  "Full, generous multi-bloom wrap",
  "Our most opulent dome bouquet",
  "Structured basket, hand-filled",
  "Return gifts, favours, events",
] as const;

const pricingOrder = [
  "single-stem-florals",
  "flower-cards",
  "small-bouquets",
  "medium-bouquets",
  "mini-bouquets",
  "large-statement-bouquets",
  "grand-bouquet",
  "just-for-you-hamper",
  "corporate-bulk-orders",
] as const;

export const pricingRows: readonly PricingRowData[] = pricingOrder.map(
  (slug, index) => {
    const product = products.find((candidate) => candidate.slug === slug)!;
    return {
      details: details[index],
      highPrice: product.slug === "small-bouquets" ? 250 : undefined,
      lowPrice: product.priceFrom || undefined,
      product,
    };
  },
);

export function PricingSection() {
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!list.current || typeof IntersectionObserver === "undefined") return;
    const rows = Array.from(
      list.current.querySelectorAll<HTMLElement>("[data-pricing-row]"),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = rows.indexOf(entry.target as HTMLElement);
          window.setTimeout(
            () => entry.target.classList.add("pricing-visible"),
            Math.max(0, index) * 80,
          );
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 },
    );
    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, []);

  return (
    <Section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="overflow-hidden"
      data-theme="light"
    >
      <Container>
        <div className="grid gap-8 border-t border-gold/35 pt-8 lg:grid-cols-[.8fr_1fr] lg:items-end">
          <div>
            <SectionLabel>A T &nbsp; A &nbsp; G L A N C E</SectionLabel>
            <SplitTextReveal
              as="h2"
              className="mt-5 font-display text-[clamp(3.4rem,7vw,7.6rem)] leading-[0.92] tracking-[-0.05em]"
              id="pricing-heading"
            >
              Pricing Guide
            </SplitTextReveal>
          </div>
          <Reveal className="max-w-xl pb-2 lg:justify-self-end">
            <p className="font-light leading-8 text-muted">
              All pieces are handcrafted to order. Colours and flower types can
              be customised to your brief.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 hidden grid-cols-[minmax(13rem,1.1fr)_minmax(16rem,1.35fr)_minmax(7rem,.55fr)_minmax(5.5rem,.35fr)] border-b border-gold/60 pb-3 text-[0.55rem] uppercase tracking-[0.2em] text-[#765b34] md:grid">
          <span className="px-5">Collection</span>
          <span className="px-5">Details</span>
          <span className="px-5 text-right">Price</span>
          <span className="sr-only">Action</span>
        </div>
        <div ref={list}>
          {pricingRows.map((row) => (
            <PricingRow key={row.product.slug} {...row} />
          ))}
        </div>
        <CustomisationNote />
      </Container>
    </Section>
  );
}

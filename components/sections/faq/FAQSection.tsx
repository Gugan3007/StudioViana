"use client";

import { useState } from "react";

import { AccordionItem } from "@/components/sections/faq/AccordionItem";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { faqItems } from "@/lib/data/faq";

export function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(faqItems[0]?.id ?? null);
  return (
    <Section
      id="faq"
      aria-labelledby="faq-heading"
      className="overflow-visible"
      data-theme="light"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[.65fr_1.35fr] lg:gap-20">
          <div className="self-start lg:sticky lg:top-32">
            <SectionLabel>Q U E S T I O N S</SectionLabel>
            <h2
              className="mt-5 max-w-md font-display text-[clamp(4rem,8vw,8rem)] leading-[0.86] tracking-[-0.055em]"
              id="faq-heading"
            >
              Good to know
            </h2>
            <p className="mt-7 max-w-sm font-light leading-8 text-muted">
              Answers to the most common questions about your Studio Viana
              piece, from ordering to care.
            </p>
          </div>
          <div>
            {faqItems.map((item) => (
              <AccordionItem
                key={item.id}
                item={item}
                onToggle={() => setOpenId((current) => (current === item.id ? null : item.id))}
                open={openId === item.id}
              />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

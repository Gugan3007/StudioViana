"use client";

import { SplitTextReveal } from "@/components/animations/SplitTextReveal";
import { AmbientParticles } from "@/components/intro/AmbientParticles";
import { ContactRow } from "@/components/sections/contact/ContactRow";
import { RotatingRingImage } from "@/components/sections/contact/RotatingRingImage";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { site } from "@/lib/data/site";
import { whatsappLink } from "@/lib/utils";

const defaultMessage =
  "Hello Studio Viana! I’d love to know more about your handcrafted florals.";

export function ContactSection() {
  const whatsapp = whatsappLink(defaultMessage);
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-forest py-section text-cream [background-image:radial-gradient(circle_at_50%_35%,rgba(214,185,138,0.14),transparent_34%)]"
      data-theme="dark"
    >
      <AmbientParticles className="opacity-50 motion-reduce:hidden" count={6} />
      <Container className="relative text-center">
        <RotatingRingImage />
        <SectionLabel className="mt-9 text-gold-light">
          G E T &nbsp; I N &nbsp; T O U C H
        </SectionLabel>
        <SplitTextReveal
          as="h2"
          className="mx-auto mt-5 max-w-5xl text-balance font-display text-[clamp(3.3rem,7vw,7.3rem)] leading-[0.94] tracking-[-0.05em] text-cream"
          id="contact-heading"
          type="lines"
        >
          {"Let's create something\nbeautiful together."}
        </SplitTextReveal>

        <div className="mx-auto mt-12 grid max-w-6xl gap-x-10 text-left md:grid-cols-3">
          <ContactRow
            copyLabel="Copy email"
            href={`mailto:${site.email}`}
            label="Email"
            value={site.email}
          />
          <ContactRow
            copyLabel="Copy Instagram"
            href={site.instagramUrl}
            label="Instagram"
            value={site.instagramHandle}
          />
          <ContactRow
            copyLabel="Copy WhatsApp"
            href={whatsappLink()}
            label="WhatsApp"
            value={site.whatsappDisplay}
          />
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
          <Button
            className="border-gold bg-gold text-forest before:bg-cream hover:border-cream"
            href={whatsapp}
            rel="noreferrer"
            target="_blank"
            variant="solid-forest"
          >
            Chat on WhatsApp
          </Button>
          <Button
            className="border-cream text-cream"
            href={`mailto:${site.email}`}
            variant="outline-gold"
          >
            Send an Email
          </Button>
        </div>

        <div className="mx-auto mt-10 flex max-w-4xl flex-col items-center justify-center gap-3 text-xs tracking-[0.08em] text-cream/70 sm:flex-row sm:gap-8">
          <p>
            Handcrafted in {site.location} · Delivering across{" "}
            {site.deliveryRegions.join(", ")}
          </p>
          <span
            aria-hidden="true"
            className="hidden h-4 w-px bg-gold/45 sm:block"
          />
          <p>{site.businessHours}</p>
        </div>
      </Container>
    </section>
  );
}

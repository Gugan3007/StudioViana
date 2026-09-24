import { AnimationShowcase } from "@/app/showcase/AnimationShowcase";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { Heading } from "@/components/ui/Heading";
import { PillTag } from "@/components/ui/PillTag";
import { PriceTag } from "@/components/ui/PriceTag";
import { Section } from "@/components/ui/Section";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { products, services } from "@/lib/data/products";
import { site } from "@/lib/data/site";

const palette = [
  { name: "Forest", value: "#1F3326", className: "bg-forest text-cream" },
  { name: "Cream", value: "#F7F0E6", className: "bg-cream text-charcoal" },
  {
    name: "Cream soft",
    value: "#FBF7F1",
    className: "bg-cream-soft text-charcoal",
  },
  { name: "Gold", value: "#B8925A", className: "bg-gold text-forest-deep" },
  { name: "Charcoal", value: "#2A2A26", className: "bg-charcoal text-cream" },
] as const;

export default function Home() {
  return (
    <main className="overflow-clip">
      <Section
        className="flex min-h-[92svh] items-center"
        aria-labelledby="showcase-title"
      >
        <Container grid>
          <div className="border-gold/50 col-span-12 border-t pt-6 md:col-span-10 md:col-start-2">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <SectionLabel>Studio Viana / Phase 0</SectionLabel>
              <p className="font-body text-[0.62rem] font-medium uppercase tracking-[0.24em] text-muted">
                Foundation specimen / 2026
              </p>
            </div>

            <div className="mt-[clamp(5rem,12vw,10rem)] grid gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-9">
                <Heading
                  as="h1"
                  id="showcase-title"
                  italic="System"
                  size="display"
                >
                  Design System
                </Heading>
                <p className="mt-8 max-w-2xl font-display text-[clamp(1.25rem,2vw,1.75rem)] italic leading-relaxed text-muted">
                  {site.secondaryLine}.
                </p>
              </div>
              <div className="lg:col-span-3">
                <GoldDivider />
                <p className="mt-6 text-sm leading-7 text-muted">
                  Brand foundations, interface primitives, and motion studies
                  for {site.name}.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="soft" aria-labelledby="palette-heading">
        <Container>
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <SectionLabel>01 / Colour</SectionLabel>
              <Heading as="h2" id="palette-heading" className="mt-5" size="h1">
                The Studio palette
              </Heading>
            </div>
            <p className="max-w-sm text-sm leading-7 text-muted md:col-span-4 md:col-start-9">
              Warm paper neutrals, botanical greens, and one restrained metallic
              accent.
            </p>
          </div>

          <div className="border-gold/30 mt-16 grid border-l border-t sm:grid-cols-2 lg:grid-cols-5">
            {palette.map((colour) => (
              <div
                key={colour.name}
                className={`${colour.className} border-gold/30 flex aspect-[4/3] flex-col justify-between border-b border-r p-5`}
              >
                <span className="font-body text-[0.62rem] font-medium uppercase tracking-[0.24em]">
                  {colour.name}
                </span>
                <span className="font-body text-xs tracking-[0.14em] opacity-75">
                  {colour.value}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="type-heading">
        <Container>
          <div className="border-gold/30 border-b pb-12">
            <SectionLabel>02 / Typography</SectionLabel>
            <Heading as="h2" id="type-heading" className="mt-5" size="h1">
              Editorial hierarchy
            </Heading>
          </div>

          <div className="divide-gold/25 divide-y">
            <div className="grid gap-6 py-12 md:grid-cols-12 md:items-baseline">
              <p className="text-label uppercase tracking-label text-muted md:col-span-2">
                Display
              </p>
              <p className="font-display text-display leading-[0.98] tracking-[-0.025em] md:col-span-10">
                Everlasting
              </p>
            </div>
            <div className="grid gap-6 py-12 md:grid-cols-12 md:items-baseline">
              <p className="text-label uppercase tracking-label text-muted md:col-span-2">
                Heading 01
              </p>
              <p className="font-display text-h1 tracking-[-0.025em] md:col-span-10">
                Handcrafted florals
              </p>
            </div>
            <div className="grid gap-6 py-12 md:grid-cols-12 md:items-baseline">
              <p className="text-label uppercase tracking-label text-muted md:col-span-2">
                Heading 02
              </p>
              <p className="font-display text-h2 italic tracking-[-0.025em] md:col-span-10">
                Curated with love
              </p>
            </div>
            <div className="grid gap-6 py-12 md:grid-cols-12 md:items-start">
              <p className="text-label uppercase tracking-label text-muted md:col-span-2">
                Body / label
              </p>
              <div className="max-w-2xl space-y-5 md:col-span-8">
                <p className="text-body text-charcoal">
                  Poppins keeps supporting information precise and quiet while
                  Lora gives every editorial statement warmth.
                </p>
                <SectionLabel>Made slowly / kept forever</SectionLabel>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="soft" aria-labelledby="components-heading">
        <Container>
          <SectionLabel>03 / Interface details</SectionLabel>
          <Heading as="h2" id="components-heading" className="mt-5" size="h1">
            Essential primitives
          </Heading>

          <div className="border-gold/30 mt-16 grid gap-x-8 gap-y-14 border-y py-14 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="mb-7 text-label uppercase tracking-label text-muted">
                Divider
              </p>
              <GoldDivider animate />
            </div>
            <div>
              <p className="mb-7 text-label uppercase tracking-label text-muted">
                Tag
              </p>
              <PillTag>Handmade · Made to order</PillTag>
            </div>
            <div>
              <p className="mb-7 text-label uppercase tracking-label text-muted">
                Price
              </p>
              <PriceTag>₹1,250</PriceTag>
            </div>
            <div>
              <p className="mb-7 text-label uppercase tracking-label text-muted">
                Editorial detail
              </p>
              <p className="font-display text-h3 italic">Forever in bloom</p>
            </div>
          </div>

          <div className="mt-14">
            <p className="mb-7 text-label uppercase tracking-label text-muted">
              Button variants
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <Button href="#motion-specimens" variant="outline-gold">
                Outline gold
              </Button>
              <Button type="button" variant="solid-forest">
                Solid forest
              </Button>
              <Button href="#data-specimen" variant="text-link">
                Text link
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <AnimationShowcase />

      <Section id="data-specimen" tone="soft" aria-labelledby="data-heading">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionLabel>07 / Typed content</SectionLabel>
              <Heading as="h2" id="data-heading" className="mt-5" size="h2">
                Catalogue records
              </Heading>
              <p className="mt-6 max-w-sm text-sm leading-7 text-muted">
                A compact data check only—these records are ready for later
                catalogue compositions.
              </p>
            </div>

            <div className="lg:col-span-8">
              <div className="border-gold/40 border-t">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="border-gold/25 grid grid-cols-[2.5rem_1fr] gap-4 border-b py-4 sm:grid-cols-[3rem_1fr_auto] sm:items-center"
                  >
                    <span className="text-xs tracking-[0.18em] text-gold">
                      {product.number}
                    </span>
                    <span className="font-display text-lg">{product.name}</span>
                    <span className="col-start-2 text-xs text-muted sm:col-start-auto">
                      {product.priceLabel}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className="mt-12 flex flex-wrap gap-x-8 gap-y-3"
                aria-label="Service records"
              >
                {services.map((service) => (
                  <span
                    key={service.number}
                    className="text-xs font-medium uppercase tracking-[0.18em] text-muted"
                  >
                    {service.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}

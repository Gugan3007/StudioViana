import { SplitTextReveal } from "@/components/animations/SplitTextReveal";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function CollectionIntro() {
  return (
    <Container className="pb-16 pt-[clamp(7rem,13vw,12rem)]" grid>
      <div className="col-span-12 lg:col-span-7">
        <SectionLabel>Inside This Edit</SectionLabel>
        <div className="mt-5 overflow-hidden pb-2">
          <SplitTextReveal
            as="h2"
            className="font-display text-[clamp(4rem,9vw,8.6rem)] leading-[0.9] tracking-[-0.055em] text-charcoal"
            id="collection-heading"
            type="characters"
          >
            The Collection
          </SplitTextReveal>
        </div>
      </div>

      <div className="col-span-12 mt-9 flex max-w-[25rem] flex-col justify-end lg:col-span-4 lg:col-start-9 lg:mt-0 lg:pb-3">
        <p className="text-[0.95rem] font-light leading-8 text-muted">
          Eight handcrafted forms, from a single keepsake stem to our grandest
          dome bouquet. Every piece is made to order and can be re-imagined in
          your palette.
        </p>
        <p className="mt-6 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-charcoal">
          08 Pieces <span className="px-2 text-gold">·</span> From ₹120
        </p>
      </div>
    </Container>
  );
}

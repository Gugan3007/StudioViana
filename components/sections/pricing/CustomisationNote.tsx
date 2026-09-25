import { MandalaMark } from "@/components/decor/MandalaMark";
import { Button } from "@/components/ui/Button";
import { phaseFiveConfig } from "@/lib/data/site";

const chips = [
  "Made to order",
  "Custom palettes",
  phaseFiveConfig.leadTimeLabel,
] as const;

export function CustomisationNote() {
  return (
    <div className="mt-12 grid gap-6 border border-gold/45 p-6 sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-8">
      <MandalaMark className="h-12 w-12 text-gold" />
      <div>
        <p className="font-display text-xl leading-8 text-charcoal sm:text-2xl">
          <span className="text-gold">A note on customisation</span> — every
          piece in this collection can be re-imagined in your preferred colour
          palette and flower selection.
        </p>
        <p className="mt-3 max-w-3xl text-sm font-light leading-7 text-muted">
          For weddings, corporate gifting or bulk orders, write to us for a
          tailored quote and lead time.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-gold/35 px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.12em] text-[#765b34]"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
      <Button
        className="group min-h-12 justify-self-start lg:justify-self-end"
        download
        href={phaseFiveConfig.cataloguePath}
        variant="outline-gold"
      >
        Download Catalogue (PDF)
        <span
          aria-hidden="true"
          className="ml-2 inline-block transition-transform duration-300 group-hover:translate-y-1"
        >
          ↓
        </span>
      </Button>
    </div>
  );
}

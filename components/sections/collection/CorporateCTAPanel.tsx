import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { corporateProduct } from "@/lib/data/products";
import { site } from "@/lib/data/site";
import { whatsappLink } from "@/lib/utils";

export function CorporateCTAPanel({ mobile = false }: { mobile?: boolean }) {
  return (
    <article
      className={
        mobile
          ? "relative min-h-[38rem] overflow-hidden bg-forest px-gutter py-20 text-cream"
          : "relative flex h-[100svh] w-[75vw] shrink-0 items-center overflow-hidden bg-forest px-[clamp(4rem,9vw,9rem)] text-cream"
      }
      data-corporate-panel
      data-horizontal-panel={mobile ? undefined : true}
      data-mobile-card={mobile || undefined}
      data-theme="dark"
    >
      <div className="absolute inset-6 border border-gold/45" />
      <div className="relative z-10 max-w-3xl">
        <SectionLabel>Corporate & Bulk Orders</SectionLabel>
        <h3 className="mt-7 text-balance font-display text-[clamp(3.6rem,7vw,7.5rem)] leading-[0.92] tracking-[-0.045em]">
          Weddings, events & return gifts
        </h3>
        <p className="mt-8 max-w-xl font-light leading-8 text-cream/75">
          Every piece can be re-imagined in your palette. Write to us for a
          tailored quote and lead time.
        </p>
        <div className="mt-9 flex flex-wrap gap-5">
          <Button
            className="border-gold text-cream"
            href={whatsappLink(
              "Hi Studio Viana! 🌸 I'd love a tailored quote for corporate, event or return-gift florals. Could you share options and lead times?",
            )}
            rel="noreferrer"
            target="_blank"
            variant="outline-gold"
          >
            Request a Quote
          </Button>
          <Button
            className="text-cream"
            href={`mailto:${site.email}?subject=${encodeURIComponent(corporateProduct.name)}`}
            variant="text-link"
          >
            {site.email}
          </Button>
        </div>
      </div>
    </article>
  );
}

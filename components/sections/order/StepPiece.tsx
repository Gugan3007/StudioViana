import Image from "next/image";

import { catalogueProducts, type Product } from "@/lib/data/products";
import { useOrderStore } from "@/lib/store/orderStore";
import { cn } from "@/lib/utils";

export function StepPiece() {
  const selected = useOrderStore((state) => state.pieceSlug);
  const update = useOrderStore((state) => state.update);

  return (
    <div>
      <p className="text-[0.58rem] uppercase tracking-[0.2em] text-[#765b34]">
        01 · Piece
      </p>
      <h3 className="mt-3 font-display text-4xl tracking-[-0.03em]">
        Choose your piece
      </h3>
      <p className="mt-3 text-sm font-light text-muted">
        Begin with a favourite. Every detail can be made yours.
      </p>
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(catalogueProducts as readonly Product[]).map((product) => {
          const active = selected === product.slug;
          return (
            <button
              key={product.slug}
              aria-pressed={active}
              className={cn(
                "relative min-h-48 border bg-cream-soft p-2 text-left transition-[border-color,transform] duration-300",
                active
                  ? "scale-[1.02] border-gold"
                  : "border-gold/20 hover:border-gold/60",
              )}
              onClick={() =>
                update({
                  bagItems: [],
                  pieceSlug: product.slug,
                  quantity: 1,
                  size: product.sizes?.[0]?.label,
                  submitted: false,
                  variant: undefined,
                })
              }
              type="button"
            >
              <span className="relative block aspect-[4/3] overflow-hidden bg-cream">
                <Image
                  fill
                  alt=""
                  className="object-cover"
                  placeholder="blur"
                  sizes="(min-width: 640px) 14vw, 42vw"
                  src={product.heroImage}
                />
              </span>
              {active ? (
                <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-gold text-xs text-forest">
                  ✓
                </span>
              ) : null}
              <span className="mt-3 block font-display text-lg leading-5">
                {product.name}
              </span>
              <span className="mt-1 block text-[0.55rem] uppercase tracking-[0.12em] text-muted">
                {product.priceLabel}
              </span>
            </button>
          );
        })}
        <button
          aria-pressed={selected === "something-custom"}
          className={cn(
            "relative min-h-48 border p-4 text-left transition-[border-color,transform] duration-300",
            selected === "something-custom"
              ? "scale-[1.02] border-gold"
              : "border-gold/20 hover:border-gold/60",
          )}
          onClick={() =>
            update({
              bagItems: [],
              pieceSlug: "something-custom",
              quantity: 1,
              submitted: false,
            })
          }
          type="button"
        >
          <span className="grid aspect-[4/3] place-items-center border border-dashed border-gold/40 font-display text-4xl text-gold-ink">
            +
          </span>
          <span className="mt-3 block font-display text-lg">
            Something custom
          </span>
          <span className="mt-1 block text-[0.55rem] uppercase tracking-[0.12em] text-muted">
            Tailored quote
          </span>
        </button>
      </div>
    </div>
  );
}

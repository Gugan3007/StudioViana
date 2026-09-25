import Image from "next/image";

import { catalogueProducts, type Product } from "@/lib/data/products";
import { builderOptions, phaseFiveConfig } from "@/lib/data/site";
import { useOrderStore } from "@/lib/store/orderStore";
import { cn } from "@/lib/utils";

export function StepFlowers() {
  const order = useOrderStore();
  const product = (catalogueProducts as readonly Product[]).find(
    (candidate) => candidate.slug === order.pieceSlug,
  );
  const showsQuantity =
    order.pieceSlug === "single-stem-florals" ||
    order.pieceSlug === "flower-cards";

  return (
    <div>
      <p className="text-[0.58rem] uppercase tracking-[0.2em] text-[#765b34]">
        02 · Flowers
      </p>
      <h3 className="mt-3 font-display text-4xl tracking-[-0.03em]">
        Choose your flowers
      </h3>
      <p className="mt-3 text-sm font-light text-muted">
        Pick one or more favourites, or leave the composition to the studio.
      </p>

      <div className="mt-7 flex flex-wrap gap-2" role="group" aria-label="Flowers">
        {builderOptions.flowers.map((flower) => (
          <button
            key={flower}
            aria-pressed={order.flowers.includes(flower)}
            className={cn(
              "min-h-11 rounded-full border px-4 text-[0.6rem] uppercase tracking-[0.12em] transition-colors",
              order.flowers.includes(flower)
                ? "border-gold bg-gold text-forest"
                : "border-gold/35 text-charcoal hover:border-gold",
            )}
            onClick={() => order.toggleFlower(flower)}
            type="button"
          >
            {flower}
          </button>
        ))}
      </div>

      {product?.variants.length ? (
        <fieldset className="mt-8">
          <legend className="text-[0.58rem] uppercase tracking-[0.18em] text-muted">
            Collection variant
          </legend>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {product.variants.map((variant) => (
              <button
                key={variant.name}
                aria-label={variant.name}
                aria-pressed={order.variant === variant.name}
                className={cn(
                  "min-w-28 border p-2 text-left",
                  order.variant === variant.name
                    ? "border-gold"
                    : "border-gold/25",
                )}
                onClick={() => order.update({ variant: variant.name })}
                type="button"
              >
                <span className="relative block aspect-square overflow-hidden">
                  <Image
                    fill
                    alt={variant.alt}
                    className="object-cover"
                    placeholder="blur"
                    sizes="112px"
                    src={variant.image}
                  />
                </span>
                <span className="mt-2 block text-xs">{variant.name}</span>
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {showsQuantity ? (
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <span className="text-[0.58rem] uppercase tracking-[0.18em] text-muted">
            Quantity
          </span>
          <button
            aria-label="Decrease quantity"
            className="grid h-11 w-11 place-items-center border border-gold/40"
            disabled={order.quantity <= 1}
            onClick={() => order.update({ quantity: order.quantity - 1 })}
            type="button"
          >
            −
          </button>
          <output aria-live="polite" className="w-8 text-center font-display text-xl">
            {order.quantity}
          </output>
          <button
            aria-label="Increase quantity"
            className="grid h-11 w-11 place-items-center border border-gold/40"
            onClick={() => order.update({ quantity: Math.min(500, order.quantity + 1) })}
            type="button"
          >
            +
          </button>
          {order.quantity >= phaseFiveConfig.bulkThreshold ? (
            <a className="text-xs text-[#765b34] underline" href="#corporate">
              Ordering in bulk? Get a tailored quote →
            </a>
          ) : null}
        </div>
      ) : null}

      {product?.sizes ? (
        <fieldset className="mt-8">
          <legend className="text-[0.58rem] uppercase tracking-[0.18em] text-muted">
            Bouquet size
          </legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {product.sizes.map((size) => (
              <label key={size.label} className="cursor-pointer">
                <input
                  aria-label={size.label}
                  checked={order.size === size.label}
                  className="peer sr-only"
                  name="builder-size"
                  onChange={() => order.update({ size: size.label })}
                  type="radio"
                />
                <span className="block min-h-11 border border-gold/30 px-4 py-2 peer-checked:border-gold peer-checked:bg-gold peer-checked:text-forest">
                  {size.label} · ₹{size.price}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
    </div>
  );
}

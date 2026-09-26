"use client";

import { type MouseEvent, useId } from "react";

import { VariantThumbs } from "@/components/sections/collection/VariantThumbs";
import { Button } from "@/components/ui/Button";
import { PriceTag } from "@/components/ui/PriceTag";
import type { Product, ProductVariant } from "@/lib/data/products";
import { ORDER_MODE } from "@/lib/data/site";
import { useBagStore } from "@/lib/store/bagStore";
import { whatsappLink } from "@/lib/utils";
import { openProductOrder } from "@/lib/utils/orderEntry";
import {
  enquiryMessage,
  type OrderConfiguration,
  orderMessage,
  orderTotal,
  type PaletteName,
} from "@/lib/utils/whatsapp";
import { cn } from "@/lib/utils";

const palettes: readonly { color: string; name: PaletteName }[] = [
  { name: "Blush Pink", color: "#e9c9c9" },
  { name: "Lilac", color: "#c9b6e4" },
  { name: "Ruby Red", color: "#9f2f3c" },
  { name: "Ivory", color: "#f7f0e6" },
  { name: "Sunshine Yellow", color: "#e3bd4f" },
  {
    name: "Custom",
    color: "conic-gradient(#e9c9c9, #c9b6e4, #e3bd4f, #e9c9c9)",
  },
] as const;

interface ProductOptionsProps {
  configuration: OrderConfiguration;
  onChange: (configuration: OrderConfiguration) => void;
  product: Product;
}

export function ProductOptions({
  configuration,
  onChange,
  product,
}: ProductOptionsProps) {
  const addItem = useBagStore((state) => state.addItem);
  const occasionId = useId();
  const messageId = useId();
  const selectedVariant = product.variants.find(
    (variant) => variant.name === configuration.variant,
  );
  const quantity = configuration.quantity ?? 1;
  const total = orderTotal(product, configuration);
  const update = (patch: Partial<OrderConfiguration>) =>
    onChange({ ...configuration, ...patch });
  const selectVariant = (variant: ProductVariant) =>
    update({ variant: variant.name });

  return (
    <div className="mt-8" data-product-options>
      <VariantThumbs
        onSelect={selectVariant}
        selectedName={selectedVariant?.name}
        variants={product.variants}
      />

      {product.flowers ? (
        <fieldset className="mt-7">
          <legend className="text-[0.58rem] uppercase tracking-[0.2em] text-muted">
            Flower type
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.flowers.map((flower) => (
              <button
                key={flower}
                aria-pressed={configuration.flower === flower}
                className={cn(
                  "min-h-11 rounded-full border px-3 py-2 text-[0.58rem] uppercase tracking-[0.12em]",
                  configuration.flower === flower
                    ? "border-gold bg-gold text-forest"
                    : "border-gold/35 text-muted",
                )}
                onClick={() => update({ flower })}
                type="button"
              >
                {flower}
              </button>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-4">
            <span className="text-xs uppercase tracking-[0.16em] text-muted">
              Quantity
            </span>
            <button
              aria-label="Decrease quantity"
              className="grid h-11 w-11 place-items-center border border-gold/40"
              disabled={quantity <= 1}
              onClick={() => update({ quantity: Math.max(1, quantity - 1) })}
              type="button"
            >
              −
            </button>
            <output
              aria-live="polite"
              className="w-6 text-center font-display text-xl"
            >
              {quantity}
            </output>
            <button
              aria-label="Increase quantity"
              className="grid h-11 w-11 place-items-center border border-gold/40"
              onClick={() => update({ quantity: Math.min(25, quantity + 1) })}
              type="button"
            >
              +
            </button>
          </div>
        </fieldset>
      ) : null}

      {product.sizes ? (
        <fieldset className="mt-7">
          <legend className="text-[0.58rem] uppercase tracking-[0.2em] text-muted">
            Bouquet size
          </legend>
          <div className="mt-3 flex gap-3">
            {product.sizes.map((size) => (
              <label key={size.label} className="cursor-pointer text-sm">
                <input
                  aria-label={size.label}
                  checked={configuration.size === size.label}
                  className="peer sr-only"
                  name="bouquet-size"
                  onChange={() => update({ size: size.label })}
                  type="radio"
                />
                <span
                  className={cn(
                    "block border px-4 py-3 peer-focus-visible:ring-2 peer-focus-visible:ring-[#765b34] peer-focus-visible:ring-offset-4 peer-focus-visible:ring-offset-cream",
                    configuration.size === size.label
                      ? "border-gold text-charcoal"
                      : "border-gold/25 text-muted",
                  )}
                >
                  {size.label} · ₹{size.price}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <fieldset className="mt-8">
        <legend className="text-[0.58rem] uppercase tracking-[0.2em] text-muted">
          Colour palette
        </legend>
        <div className="mt-3 flex flex-wrap gap-4">
          {palettes.map((palette) => (
            <label key={palette.name} className="cursor-pointer text-center">
              <input
                checked={configuration.palette === palette.name}
                className="peer sr-only"
                name="palette"
                onChange={() => update({ palette: palette.name })}
                type="radio"
              />
              <span
                aria-hidden="true"
                className="mx-auto block h-9 w-9 rounded-full border border-charcoal/10 ring-[#765b34] ring-offset-2 ring-offset-cream peer-checked:ring-2 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-4 peer-focus-visible:ring-offset-cream"
                style={{ background: palette.color }}
              />
              <span className="mt-2 block max-w-16 text-[0.48rem] uppercase leading-3 tracking-[0.1em] text-muted">
                {palette.name}
              </span>
            </label>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">Custom palette on request</p>
      </fieldset>

      <div className="mt-8 grid gap-5">
        <label
          className="grid gap-2 text-xs uppercase tracking-[0.16em] text-muted"
          htmlFor={occasionId}
        >
          Occasion
          <select
            id={occasionId}
            className="min-h-12 border border-gold/35 bg-transparent px-4 text-sm normal-case tracking-normal text-charcoal"
            onChange={(event) => update({ occasion: event.target.value })}
            value={configuration.occasion ?? ""}
          >
            <option value="">Select an occasion</option>
            {product.occasions.map((occasion) => (
              <option key={occasion} value={occasion}>
                {occasion}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-2 text-xs uppercase tracking-[0.16em] text-muted">
          <label htmlFor={messageId}>Personal message</label>
          <textarea
            id={messageId}
            className="min-h-28 resize-y border border-gold/35 bg-transparent p-4 text-sm normal-case leading-6 tracking-normal text-charcoal"
            maxLength={120}
            onChange={(event) =>
              update({ personalMessage: event.target.value })
            }
            placeholder="Optional message for the card"
            value={configuration.personalMessage ?? ""}
          />
          <span className="justify-self-end text-[0.58rem] tracking-normal">
            {configuration.personalMessage?.length ?? 0} / 120
          </span>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <PriceTag data-testid="configured-total">
          ₹{new Intl.NumberFormat("en-IN").format(total)}
        </PriceTag>
        <Button
          href={whatsappLink(orderMessage(product, configuration))}
          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            if (ORDER_MODE !== "builder") return;
            event.preventDefault();
            openProductOrder(product, configuration);
          }}
          rel="noreferrer"
          target="_blank"
          variant="solid-forest"
        >
          Order on WhatsApp
        </Button>
        <Button
          onClick={() =>
            addItem({
              flower: configuration.flower,
              palette: configuration.palette,
              productSlug: product.slug,
              quantity: configuration.quantity ?? 1,
              size: configuration.size,
              unitPrice:
                product.slug === "single-stem-florals"
                  ? product.priceFrom
                  : orderTotal(product, { ...configuration, quantity: 1 }),
              variant: configuration.variant,
            })
          }
          variant="outline-gold"
        >
          Add to order
        </Button>
        <Button
          href={whatsappLink(enquiryMessage(product))}
          rel="noreferrer"
          target="_blank"
          variant="text-link"
        >
          Ask a question
        </Button>
      </div>
    </div>
  );
}

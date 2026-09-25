"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

import { VariantThumbs } from "@/components/sections/collection/VariantThumbs";
import { Button } from "@/components/ui/Button";
import { PillTag } from "@/components/ui/PillTag";
import { PriceTag } from "@/components/ui/PriceTag";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { Product, ProductVariant } from "@/lib/data/products";
import { setCursorState } from "@/lib/store/cursorStore";
import { whatsappLink } from "@/lib/utils";
import { orderMessage } from "@/lib/utils/whatsapp";
import { cn } from "@/lib/utils";

interface ProductPanelProps {
  onOpenDetail: (product: Product, trigger: HTMLElement) => void;
  product: Product;
}

export function ProductPanel({ onOpenDetail, product }: ProductPanelProps) {
  const [selectedVariant, setSelectedVariant] = useState<
    ProductVariant | undefined
  >();
  const [selectedFlower, setSelectedFlower] = useState<string | undefined>(
    product.flowers?.[0],
  );
  const activeImage = selectedVariant?.image ?? product.heroImage;
  const activeAlt = selectedVariant?.alt ?? product.heroAlt;
  const message = orderMessage(product, {
    flower: selectedFlower,
    variant: selectedVariant?.name,
  });

  return (
    <article
      className="relative grid h-[100svh] w-[85vw] shrink-0 grid-cols-[56%_44%] items-center gap-[clamp(2rem,4vw,5rem)] overflow-hidden px-[clamp(2rem,4vw,5rem)] py-24 lg:w-[75vw] lg:grid-cols-[58%_42%]"
      data-horizontal-panel
      data-product-slug={product.slug}
    >
      <button
        aria-label={`View details for ${product.name}`}
        className="group relative block h-[min(76svh,50rem)] w-full cursor-pointer"
        data-cursor="view"
        data-preload-product-detail
        onClick={(event) => onOpenDetail(product, event.currentTarget)}
        onPointerEnter={() => setCursorState("view")}
        onPointerLeave={() => setCursorState("default")}
        type="button"
      >
        <span className="pointer-events-none absolute -inset-3 translate-x-1.5 translate-y-1.5 border border-gold/65" />
        <span
          className="relative block h-full overflow-hidden bg-cream-soft"
          data-panel-image-frame
        >
          <AnimatePresence initial={false} mode="sync">
            <motion.span
              key={`${product.slug}-${selectedVariant?.name ?? "hero"}`}
              layoutId={`product-image-${product.slug}`}
              animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
              className="absolute inset-0"
              exit={{ clipPath: "inset(0 0 100% 0)", opacity: 0 }}
              initial={{ clipPath: "inset(100% 0 0 0)", opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                fill
                priority={Number(product.number) <= 3}
                alt={activeAlt}
                className="scale-[1.12] object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                data-panel-image
                placeholder="blur"
                sizes="(min-width: 1024px) 44vw, 48vw"
                src={activeImage}
              />
            </motion.span>
          </AnimatePresence>
        </span>
      </button>

      <div className="relative z-10 max-w-[29rem]" data-panel-copy>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-8 -top-24 -z-10 font-display text-[clamp(9rem,16vw,14rem)] leading-none text-transparent opacity-25"
          data-panel-number
          style={{ WebkitTextStroke: "1px var(--gold)" }}
        >
          {product.number}
        </span>
        <SectionLabel>Category {product.number}</SectionLabel>
        <h3 className="mt-5 text-balance font-display text-[clamp(2.8rem,4.8vw,5.6rem)] leading-[0.95] tracking-[-0.045em] text-charcoal">
          {product.name}
        </h3>
        <PillTag className="mt-6">Handmade · Made to Order</PillTag>
        <p className="mt-6 font-display text-[1.35rem] italic leading-7 text-gold">
          {product.tagline}
        </p>
        <p className="mt-5 text-sm font-light leading-7 text-muted lg:text-[0.95rem]">
          {product.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {product.occasions.map((occasion) => (
            <span
              key={occasion}
              className="rounded-full border border-gold/30 px-3 py-1 text-[0.52rem] uppercase tracking-[0.14em] text-muted"
            >
              {occasion}
            </span>
          ))}
        </div>

        {product.flowers ? (
          <div
            className="mt-6 flex flex-wrap gap-2"
            role="group"
            aria-label="Flower type"
          >
            {product.flowers.map((flower) => (
              <button
                key={flower}
                aria-pressed={flower === selectedFlower}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[0.55rem] uppercase tracking-[0.12em] transition-colors",
                  flower === selectedFlower
                    ? "border-gold bg-gold text-cream"
                    : "border-gold/35 text-muted",
                )}
                onClick={() => setSelectedFlower(flower)}
                type="button"
              >
                {flower}
              </button>
            ))}
          </div>
        ) : null}

        <VariantThumbs
          className="mt-6"
          onSelect={setSelectedVariant}
          selectedName={selectedVariant?.name}
          variants={product.variants}
        />

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <PriceTag>{product.priceLabel}</PriceTag>
          <Button
            data-preload-product-detail
            onClick={(event) => onOpenDetail(product, event.currentTarget)}
            variant="outline-gold"
          >
            View Details
          </Button>
          <Button
            href={whatsappLink(message)}
            rel="noreferrer"
            target="_blank"
            variant="text-link"
          >
            Order on WhatsApp <span aria-hidden="true">→</span>
          </Button>
        </div>
      </div>
    </article>
  );
}

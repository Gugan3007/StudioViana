"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

import { VariantThumbs } from "@/components/sections/collection/VariantThumbs";
import { Button } from "@/components/ui/Button";
import { PillTag } from "@/components/ui/PillTag";
import { PriceTag } from "@/components/ui/PriceTag";
import type { Product, ProductVariant } from "@/lib/data/products";
import { whatsappLink } from "@/lib/utils";
import { orderMessage } from "@/lib/utils/whatsapp";

interface MobileProductCardProps {
  onOpenDetail: (product: Product, trigger: HTMLElement) => void;
  product: Product;
}

export function MobileProductCard({
  onOpenDetail,
  product,
}: MobileProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState<
    ProductVariant | undefined
  >();
  const activeImage = selectedVariant?.image ?? product.heroImage;
  const activeAlt = selectedVariant?.alt ?? product.heroAlt;

  return (
    <article
      className="px-gutter pb-20 pt-8"
      data-mobile-card
      data-product-slug={product.slug}
    >
      <button
        aria-label={`View details for ${product.name}`}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-cream-soft"
        data-cursor="view"
        data-preload-product-detail
        onClick={(event) => onOpenDetail(product, event.currentTarget)}
        type="button"
      >
        <AnimatePresence initial={false} mode="sync">
          <motion.span
            key={`${product.slug}-${selectedVariant?.name ?? "hero"}`}
            layoutId={`product-image-${product.slug}`}
            animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
            className="absolute inset-0"
            exit={{ clipPath: "inset(0 0 100% 0)", opacity: 0 }}
            initial={{ clipPath: "inset(100% 0 0 0)", opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              fill
              alt={activeAlt}
              className="object-cover"
              placeholder="blur"
              sizes="100vw"
              src={activeImage}
            />
          </motion.span>
        </AnimatePresence>
      </button>

      <div className="pt-8">
        <p className="text-[0.58rem] uppercase tracking-[0.22em] text-gold">
          Category {product.number}
        </p>
        <h3 className="mt-3 font-display text-[clamp(2.5rem,12vw,4rem)] leading-[0.98] tracking-[-0.04em] text-charcoal">
          {product.name}
        </h3>
        <PillTag className="mt-5">Handmade · Made to Order</PillTag>
        <p className="mt-5 font-display text-xl italic text-gold">
          {product.tagline}
        </p>
        <p className="mt-4 text-sm font-light leading-7 text-muted">
          {product.description}
        </p>
        <VariantThumbs
          className="mt-6 snap-x snap-mandatory [&>button]:snap-start"
          onSelect={setSelectedVariant}
          selectedName={selectedVariant?.name}
          variants={product.variants}
        />
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <PriceTag>{product.priceLabel}</PriceTag>
          <Button
            data-preload-product-detail
            onClick={(event) => onOpenDetail(product, event.currentTarget)}
          >
            View Details
          </Button>
          <Button
            href={whatsappLink(
              orderMessage(product, selectedVariant?.name ?? {}),
            )}
            rel="noreferrer"
            target="_blank"
            variant="text-link"
          >
            Order on WhatsApp →
          </Button>
        </div>
      </div>
    </article>
  );
}

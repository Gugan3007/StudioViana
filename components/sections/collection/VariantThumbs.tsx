"use client";

import Image from "next/image";

import type { ProductVariant } from "@/lib/data/products";
import { cn } from "@/lib/utils";

interface VariantThumbsProps {
  className?: string;
  onSelect: (variant: ProductVariant) => void;
  selectedName?: string;
  variants: readonly ProductVariant[];
}

export function VariantThumbs({
  className,
  onSelect,
  selectedName,
  variants,
}: VariantThumbsProps) {
  if (variants.length === 0) return null;

  return (
    <div
      aria-label="Product variants"
      className={cn(
        "flex max-w-full gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      role="group"
    >
      {variants.map((variant) => {
        const selected = selectedName === variant.name;
        return (
          <button
            key={variant.name}
            aria-pressed={selected}
            aria-label={variant.name}
            className="group w-[4.5rem] shrink-0 text-left"
            onClick={() => onSelect(variant)}
            onFocus={() => onSelect(variant)}
            onPointerEnter={() => onSelect(variant)}
            type="button"
          >
            <span
              className={cn(
                "relative block aspect-square overflow-hidden border bg-cream-soft transition-colors duration-300",
                selected ? "border-gold" : "border-gold/25",
              )}
            >
              <Image
                fill
                alt={variant.alt}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                placeholder="blur"
                sizes="72px"
                src={variant.image}
              />
            </span>
            <span className="mt-2 block text-[0.48rem] uppercase leading-3 tracking-[0.14em] text-muted">
              {variant.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

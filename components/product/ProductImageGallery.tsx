"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState } from "react";

import { LensMagnifier } from "@/components/product/LensMagnifier";
import type {
  Product,
  ProductGalleryImage,
  ProductVariant,
} from "@/lib/data/products";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  onSelectVariant: (variant: ProductVariant | undefined) => void;
  product: Product;
  selectedVariant?: ProductVariant;
}

export function ProductImageGallery({
  onSelectVariant,
  product,
  selectedVariant,
}: ProductImageGalleryProps) {
  const [gallerySelection, setGallerySelection] = useState<{
    image: ProductGalleryImage;
    slug: string;
  }>(() => ({ image: product.gallery[0], slug: product.slug }));
  const selectedGalleryImage =
    gallerySelection.slug === product.slug
      ? gallerySelection.image
      : product.gallery[0];
  const active = selectedVariant
    ? { alt: selectedVariant.alt, image: selectedVariant.image }
    : selectedGalleryImage;
  const thumbnails = useMemo(
    () => [
      ...product.gallery.map((item) => ({ ...item, variant: undefined })),
      ...product.variants.map((variant) => ({
        alt: variant.alt,
        image: variant.image,
        variant,
      })),
    ],
    [product],
  );

  return (
    <div className="lg:sticky lg:top-0 lg:h-[100svh] lg:px-[clamp(2rem,5vw,6rem)] lg:py-16">
      <div className="relative mx-auto aspect-[4/5] w-full max-w-[42rem] overflow-hidden bg-cream-soft lg:h-full lg:max-h-[calc(100svh-8rem)] lg:w-auto">
        <LensMagnifier image={active.image}>
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              key={`${product.slug}-${selectedVariant?.name ?? active.alt}`}
              layoutId={`product-image-${product.slug}`}
              animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
              className="absolute inset-0"
              exit={{ clipPath: "inset(0 0 100% 0)", opacity: 0 }}
              initial={{ clipPath: "inset(100% 0 0 0)", opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                fill
                priority
                alt={active.alt}
                className="object-cover"
                placeholder="blur"
                sizes="(min-width: 1024px) 48vw, 100vw"
                src={active.image}
              />
            </motion.div>
          </AnimatePresence>
        </LensMagnifier>
      </div>

      <div className="mx-auto mt-4 flex max-w-[42rem] snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {thumbnails.map((item, index) => {
          const selected = item.variant
            ? item.variant.name === selectedVariant?.name
            : !selectedVariant && item.alt === selectedGalleryImage.alt;
          return (
            <button
              key={`${item.alt}-${index}`}
              aria-label={`Show ${item.alt}`}
              aria-pressed={selected}
              className={cn(
                "relative aspect-square w-[4.5rem] shrink-0 snap-start overflow-hidden border",
                selected ? "border-gold" : "border-gold/25",
              )}
              onClick={() => {
                if (item.variant) onSelectVariant(item.variant);
                else {
                  onSelectVariant(undefined);
                  setGallerySelection({ image: item, slug: product.slug });
                }
              }}
              type="button"
            >
              <Image
                fill
                alt=""
                className="object-cover"
                placeholder="blur"
                sizes="72px"
                src={item.image}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

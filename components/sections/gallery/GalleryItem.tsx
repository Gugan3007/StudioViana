"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { setCursorState } from "@/lib/store/cursorStore";
import type { GalleryItemData } from "@/lib/data/gallery";
import { cn } from "@/lib/utils";

interface GalleryItemProps {
  dimmed: boolean;
  item: GalleryItemData;
  onIntent?: () => void;
  onSelect?: (item: GalleryItemData, trigger: HTMLButtonElement) => void;
  onSpotlight: (id: string | null) => void;
}

export function GalleryItem({
  dimmed,
  item,
  onIntent,
  onSelect,
  onSpotlight,
}: GalleryItemProps) {
  return (
    <motion.button
      layout
      aria-label={`Open ${item.title} in gallery`}
      className={cn(
        "group relative mb-3 block w-full break-inside-avoid overflow-hidden border border-gold/20 bg-cream text-left transition-opacity duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold md:mb-5",
        dimmed && "opacity-60",
      )}
      data-cursor="view"
      data-gallery-category={item.category}
      data-gallery-item
      data-gallery-item-id={item.id}
      layoutId={`gallery-image-${item.id}`}
      onBlur={() => onSpotlight(null)}
      onClick={(event) => onSelect?.(item, event.currentTarget)}
      onFocus={() => {
        onIntent?.();
        onSpotlight(item.id);
      }}
      onPointerEnter={() => {
        onIntent?.();
        onSpotlight(item.id);
        setCursorState("view");
      }}
      onPointerLeave={() => {
        onSpotlight(null);
        setCursorState("default");
      }}
      style={{ aspectRatio: `${item.width} / ${item.height}` }}
      type="button"
    >
      <Image
        fill
        alt={item.alt}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] group-focus-visible:scale-[1.04]"
        placeholder="blur"
        sizes="(min-width: 1280px) 23vw, (min-width: 768px) 31vw, 48vw"
        src={item.src}
      />
      <span className="absolute inset-x-0 bottom-0 translate-y-5 bg-gradient-to-t from-forest/95 via-forest/60 to-transparent px-4 pb-4 pt-16 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 md:px-5 md:pb-5">
        <span className="block font-display text-xl leading-tight text-cream">
          {item.title}
        </span>
        <span className="mt-1 block font-body text-[0.54rem] uppercase tracking-[0.18em] text-gold-light">
          {item.category}
        </span>
      </span>
    </motion.button>
  );
}

"use client";

import { useRef, useState } from "react";

import { GalleryItem } from "@/components/sections/gallery/GalleryItem";
import { gsap } from "@/lib/animations/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import type { GalleryItemData } from "@/lib/data/gallery";

interface MasonryGridProps {
  items: readonly GalleryItemData[];
  onIntent?: () => void;
  onSelect?: (item: GalleryItemData, trigger: HTMLButtonElement) => void;
  visibleIds: ReadonlySet<string>;
}

export function MasonryGrid({
  items,
  onIntent,
  onSelect,
  visibleIds,
}: MasonryGridProps) {
  const root = useRef<HTMLDivElement>(null);
  const [spotlight, setSpotlight] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  useIsomorphicLayoutEffect(() => {
    if (shouldReduceMotion || !root.current) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-gallery-item]",
        { clipPath: "inset(100% 0 0 0)", scale: 1.08 },
        {
          clipPath: "inset(0% 0 0 0)",
          duration: 0.9,
          scale: 1,
          stagger: 0.06,
          scrollTrigger: {
            once: true,
            start: "top 88%",
            trigger: root.current,
          },
        },
      );
    }, root);
    const media = gsap.matchMedia();
    media.add("(min-width: 1280px)", () => {
      const cells = Array.from(
        root.current?.querySelectorAll<HTMLElement>("[data-gallery-item]") ??
          [],
      );
      const columns = new Map<number, HTMLElement[]>();
      cells.forEach((cell) => {
        const parallax = cell.querySelector<HTMLElement>(
          "[data-gallery-parallax]",
        );
        if (!parallax) return;
        const key = Math.round(cell.offsetLeft);
        columns.set(key, [...(columns.get(key) ?? []), parallax]);
      });

      Array.from(columns.values()).forEach((column, index) => {
        gsap.fromTo(
          column,
          { yPercent: index % 2 === 0 ? 8 : -8 },
          {
            ease: "none",
            scrollTrigger: {
              end: "bottom top",
              scrub: true,
              start: "top bottom",
              trigger: root.current,
            },
            yPercent: index % 2 === 0 ? -8 : 8,
          },
        );
      });
    });

    return () => {
      context.revert();
      media.revert();
    };
  }, [items, shouldReduceMotion]);

  return (
    <div
      ref={root}
      className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:block xl:columns-4 xl:gap-5"
      data-masonry-grid
    >
      {items.map((item) => (
        <GalleryItem
          key={item.id}
          dimmed={spotlight !== null && spotlight !== item.id}
          item={item}
          onIntent={onIntent}
          onSelect={onSelect}
          onSpotlight={setSpotlight}
          visible={visibleIds.has(item.id)}
        />
      ))}
    </div>
  );
}

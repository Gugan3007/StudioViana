"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { GalleryFilters } from "@/components/sections/gallery/GalleryFilters";
import { MasonryGrid } from "@/components/sections/gallery/MasonryGrid";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Flip, refreshScrollTrigger } from "@/lib/animations/gsap";
import { useIsomorphicLayoutEffect as useIsomorphicGalleryLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import type { GalleryFilter } from "@/lib/data/gallery";
import { galleryItems } from "@/lib/data/gallery";

const INITIAL_ITEMS = 12;

export function GallerySection() {
  const grid = useRef<HTMLDivElement>(null);
  const pendingFlip = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const [activeFilter, setActiveFilter] = useState<GalleryFilter>("All");
  const [showAll, setShowAll] = useState(false);

  const matchingItems = useMemo(
    () =>
      activeFilter === "All"
        ? galleryItems
        : galleryItems.filter((item) => item.category === activeFilter),
    [activeFilter],
  );
  const visibleItems = useMemo(
    () =>
      activeFilter === "All" && !showAll
        ? matchingItems.slice(0, INITIAL_ITEMS)
        : matchingItems,
    [activeFilter, matchingItems, showAll],
  );

  const captureLayout = useCallback(() => {
    pendingFlip.current = Flip.getState(
      grid.current?.querySelectorAll("[data-gallery-item]") ?? [],
    );
  }, []);

  const changeFilter = useCallback(
    (filter: GalleryFilter) => {
      if (filter === activeFilter) return;
      // Capture the old geometry before React commits the new inventory; the
      // layout effect below then lets Flip animate from old to new positions.
      captureLayout();
      setActiveFilter(filter);
    },
    [activeFilter, captureLayout],
  );

  const loadMore = useCallback(() => {
    captureLayout();
    setShowAll(true);
  }, [captureLayout]);

  useIsomorphicGalleryLayoutEffect(() => {
    const state = pendingFlip.current;
    if (!state) return;
    pendingFlip.current = null;
    const animation = Flip.from(state, {
      absolute: true,
      duration: 0.7,
      ease: "power3.inOut",
      fade: true,
      onComplete: refreshScrollTrigger,
      prune: true,
      stagger: 0.025,
    });
    refreshScrollTrigger();

    return () => {
      animation?.kill();
    };
  }, [activeFilter, showAll]);

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="overflow-hidden bg-cream-soft px-gutter py-[clamp(6rem,12vw,11rem)]"
      data-theme="light"
    >
      <header className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.78fr] lg:items-end">
        <div>
          <SectionLabel>The Gallery</SectionLabel>
          <h2
            id="gallery-heading"
            className="mt-5 font-display text-[clamp(3.4rem,7vw,7rem)] leading-[0.92] tracking-[-0.05em] text-forest"
          >
            Crafted by Hand
          </h2>
        </div>
        <div>
          <p className="max-w-xl font-body text-sm font-light leading-7 text-charcoal/70 md:text-base">
            A glimpse of pieces that have found their way into homes,
            celebrations and hearts.
          </p>
          <div className="mt-7">
            <GalleryFilters
              activeFilter={activeFilter}
              count={matchingItems.length}
              onChange={changeFilter}
            />
          </div>
        </div>
      </header>

      <div ref={grid} className="mx-auto mt-16 max-w-7xl md:mt-24">
        <MasonryGrid items={visibleItems} />
      </div>

      {activeFilter === "All" && !showAll ? (
        <div className="mt-14 text-center">
          <Button onClick={loadMore} variant="outline-gold">
            View more pieces
          </Button>
        </div>
      ) : null}
    </section>
  );
}

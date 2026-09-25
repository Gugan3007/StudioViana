"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useRef, useState } from "react";

import { GalleryFilters } from "@/components/sections/gallery/GalleryFilters";
import { MasonryGrid } from "@/components/sections/gallery/MasonryGrid";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Flip, gsap, refreshScrollTrigger } from "@/lib/animations/gsap";
import { useIsomorphicLayoutEffect as useIsomorphicGalleryLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import type { GalleryFilter } from "@/lib/data/gallery";
import { galleryItems } from "@/lib/data/gallery";

const INITIAL_ITEMS = 12;
const loadLightbox = () => import("@/components/sections/gallery/Lightbox");
const DynamicLightbox = dynamic(
  () => loadLightbox().then((module) => module.Lightbox),
  { ssr: false },
);

interface SelectedGalleryItem {
  id: string;
  trigger: HTMLButtonElement;
}

export function GallerySection() {
  const grid = useRef<HTMLDivElement>(null);
  const pendingFlip = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState<GalleryFilter>("All");
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<SelectedGalleryItem | null>(null);
  const [mountedIds, setMountedIds] = useState(
    () => new Set(galleryItems.slice(0, INITIAL_ITEMS).map((item) => item.id)),
  );

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
  const mountedItems = useMemo(
    () => galleryItems.filter((item) => mountedIds.has(item.id)),
    [mountedIds],
  );
  const visibleIds = useMemo(
    () => new Set(visibleItems.map((item) => item.id)),
    [visibleItems],
  );

  const captureLayout = useCallback(() => {
    if (shouldReduceMotion) {
      pendingFlip.current = null;
      return;
    }
    pendingFlip.current = Flip.getState(
      grid.current?.querySelectorAll("[data-gallery-cell]") ?? [],
    );
  }, [shouldReduceMotion]);

  const changeFilter = useCallback(
    (filter: GalleryFilter) => {
      if (filter === activeFilter) return;
      // Capture the old geometry before React commits the new inventory; the
      // layout effect below then lets Flip animate from old to new positions.
      captureLayout();
      setMountedIds((current) => {
        const next = new Set(current);
        galleryItems.forEach((item) => {
          if (filter === "All" || item.category === filter) next.add(item.id);
        });
        return next;
      });
      setActiveFilter(filter);
    },
    [activeFilter, captureLayout],
  );

  const loadMore = useCallback(() => {
    captureLayout();
    setMountedIds(new Set(galleryItems.map((item) => item.id)));
    setShowAll(true);
  }, [captureLayout]);

  useIsomorphicGalleryLayoutEffect(() => {
    const state = pendingFlip.current;
    if (!state || shouldReduceMotion) {
      pendingFlip.current = null;
      refreshScrollTrigger();
      return;
    }
    pendingFlip.current = null;
    const targets = grid.current?.querySelectorAll("[data-gallery-cell]") ?? [];
    const animation = Flip.from(state, {
      absolute: true,
      absoluteOnLeave: true,
      duration: 0.7,
      ease: "power3.inOut",
      fade: true,
      onEnter: (elements) =>
        gsap.fromTo(
          elements,
          { opacity: 0, scale: 0.96 },
          { duration: 0.45, opacity: 1, scale: 1 },
        ),
      onLeave: (elements) =>
        gsap.to(elements, { duration: 0.35, opacity: 0, scale: 0.96 }),
      onComplete: refreshScrollTrigger,
      prune: true,
      stagger: 0.025,
      targets,
    });
    refreshScrollTrigger();

    return () => {
      animation?.kill();
    };
  }, [activeFilter, shouldReduceMotion, showAll]);

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
        <MasonryGrid
          items={mountedItems}
          onIntent={() => {
            void loadLightbox();
          }}
          onSelect={(item, trigger) => setSelected({ id: item.id, trigger })}
          visibleIds={visibleIds}
        />
      </div>

      {activeFilter === "All" && !showAll ? (
        <div className="mt-14 text-center">
          <Button onClick={loadMore} variant="outline-gold">
            View more pieces
          </Button>
        </div>
      ) : null}

      {selected ? (
        <DynamicLightbox
          initialItemId={selected.id}
          items={visibleItems}
          onClose={() => setSelected(null)}
          origin={selected.trigger}
        />
      ) : null}
    </section>
  );
}

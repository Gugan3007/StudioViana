"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { CorporateCTAPanel } from "@/components/sections/collection/CorporateCTAPanel";
import { GalleryProgress } from "@/components/sections/collection/GalleryProgress";
import { MobileProductCard } from "@/components/sections/collection/MobileProductCard";
import { ProductPanel } from "@/components/sections/collection/ProductPanel";
import { gsap, refreshScrollTrigger } from "@/lib/animations/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useLenis } from "@/lib/animations/useLenis";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { catalogueProducts, type Product } from "@/lib/data/products";
import { setCursorState } from "@/lib/store/cursorStore";
import { cn } from "@/lib/utils";

export interface GalleryHandle {
  scrollToProduct: (slug: string) => void;
}

interface HorizontalGalleryProps {
  onOpenDetail: (product: Product, trigger: HTMLElement) => void;
}

export const HorizontalGallery = forwardRef<
  GalleryHandle,
  HorizontalGalleryProps
>(function HorizontalGallery({ onOpenDetail }, forwardedRef) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const horizontalTween = useRef<gsap.core.Tween | null>(null);
  const { lenis } = useLenis();
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const scrollToProduct = (slug: string) => {
    const index = catalogueProducts.findIndex(
      (product) => product.slug === slug,
    );
    if (index < 0) return;
    setActiveIndex(index);
    const panel = track.current?.querySelector<HTMLElement>(
      `[data-product-slug="${slug}"]`,
    );
    const scrollTrigger = horizontalTween.current?.scrollTrigger;
    if (scrollTrigger && track.current && panel && !shouldReduceMotion) {
      const horizontalDistance = Math.max(
        1,
        track.current.scrollWidth - window.innerWidth,
      );
      const progress = Math.min(1, panel.offsetLeft / horizontalDistance);
      const destination =
        scrollTrigger.start +
        (scrollTrigger.end - scrollTrigger.start) * progress;
      lenis?.scrollTo(destination, { duration: 1.4 });
    } else {
      document
        .querySelector<HTMLElement>(
          `[data-gallery-mode="vertical"] [data-product-slug="${slug}"]`,
        )
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useImperativeHandle(forwardedRef, () => ({ scrollToProduct }));

  useIsomorphicLayoutEffect(() => {
    const gallery = root.current;
    if (!gallery || shouldReduceMotion) return;
    gallery.dataset.galleryEnhanced = "true";
    return () => {
      delete gallery.dataset.galleryEnhanced;
    };
  }, [shouldReduceMotion]);

  useIsomorphicLayoutEffect(() => {
    if (shouldReduceMotion || !root.current || !track.current) return;
    const media = gsap.matchMedia();
    media.add("(min-width: 1200px) and (min-height: 800px)", () => {
      const panels = Array.from(
        track.current!.querySelectorAll<HTMLElement>("[data-horizontal-panel]"),
      );
      // Vertical distance exactly matches horizontal overflow. That makes one
      // scroll pixel equal one track pixel and keeps pacing stable on resize.
      const distance = () =>
        Math.max(0, track.current!.scrollWidth - window.innerWidth);
      const tween = gsap.to(track.current, {
        ease: "none",
        x: () => -distance(),
        scrollTrigger: {
          end: () => `+=${distance()}`,
          invalidateOnRefresh: true,
          onUpdate(self) {
            const next = Math.min(
              catalogueProducts.length - 1,
              Math.round(self.progress * (panels.length - 1)),
            );
            setActiveIndex((current) => (current === next ? current : next));
            if (self.progress > 0.004) setHasMoved(true);
          },
          pin: root.current,
          scrub: 1,
          start: "top top",
          trigger: root.current,
        },
      });
      horizontalTween.current = tween;

      // Each child trigger reads horizontal position from the master tween via
      // containerAnimation; it never creates a second pin or scroll owner.
      const childTweens = panels.slice(0, -1).flatMap((panel) => {
        const image = panel.querySelector("[data-panel-image]");
        const copy = panel.querySelector("[data-panel-copy]");
        const number = panel.querySelector("[data-panel-number]");
        return [
          gsap.fromTo(
            panel,
            { filter: "saturate(0.8)", scale: 0.9 },
            {
              ease: "none",
              filter: "saturate(1)",
              scale: 1,
              scrollTrigger: {
                containerAnimation: tween,
                end: "right 30%",
                scrub: true,
                start: "left 85%",
                trigger: panel,
              },
            },
          ),
          gsap.fromTo(
            image,
            { xPercent: -12 },
            {
              ease: "none",
              scrollTrigger: {
                containerAnimation: tween,
                end: "right left",
                scrub: true,
                start: "left right",
                trigger: panel,
              },
              xPercent: 12,
            },
          ),
          gsap.fromTo(
            copy,
            { autoAlpha: 0, y: 28 },
            {
              autoAlpha: 1,
              duration: 0.8,
              scrollTrigger: {
                containerAnimation: tween,
                start: "left 60%",
                toggleActions: "play none none reverse",
                trigger: panel,
              },
              y: 0,
            },
          ),
          gsap.fromTo(
            number,
            { xPercent: 12 },
            {
              ease: "none",
              scrollTrigger: {
                containerAnimation: tween,
                end: "right left",
                scrub: true,
                start: "left right",
                trigger: panel,
              },
              xPercent: -12,
            },
          ),
        ];
      });
      refreshScrollTrigger();
      return () => {
        horizontalTween.current = null;
        childTweens.forEach((child) => child.kill());
        tween.kill();
      };
    });
    return () => media.revert();
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const vertical = root.current?.querySelector<HTMLElement>(
      '[data-gallery-mode="vertical"]',
    );
    const cards = Array.from(
      vertical?.querySelectorAll<HTMLElement>("[data-product-slug]") ?? [],
    );
    const selectCard = (card: Element | undefined) => {
      const slug = (card as HTMLElement | undefined)?.dataset.productSlug;
      const index = catalogueProducts.findIndex(
        (product) => product.slug === slug,
      );
      if (index >= 0) setActiveIndex(index);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        selectCard(visible?.target);
      },
      { rootMargin: "-20% 0px -55%", threshold: [0.2, 0.6] },
    );
    let frame = 0;
    const sampleReadingLine = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!vertical || getComputedStyle(vertical).display === "none") return;
        const readingLine = window.innerHeight * 0.4;
        selectCard(
          cards.find((card) => {
            const bounds = card.getBoundingClientRect();
            return bounds.top <= readingLine && bounds.bottom >= readingLine;
          }),
        );
      });
    };
    cards.forEach((card) => observer.observe(card));
    window.addEventListener("scroll", sampleReadingLine, { passive: true });
    sampleReadingLine();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", sampleReadingLine);
    };
  }, []);

  const moveBy = (direction: -1 | 1) => {
    const next = Math.max(
      0,
      Math.min(catalogueProducts.length - 1, activeIndex + direction),
    );
    scrollToProduct(catalogueProducts[next].slug);
  };

  return (
    <div
      ref={root}
      aria-label="The Collection product gallery"
      className="relative bg-cream"
      data-collection-gallery
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          moveBy(1);
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          moveBy(-1);
        }
      }}
      role="region"
      tabIndex={0}
    >
      <div
        aria-hidden={shouldReduceMotion || undefined}
        className={cn(
          "collection-gallery-horizontal relative hidden h-[100svh] overflow-hidden",
          shouldReduceMotion && "hidden",
        )}
        data-cursor="drag"
        data-gallery-mode="horizontal"
        onPointerEnter={() => setCursorState("drag")}
        onPointerLeave={() => setCursorState("default")}
      >
        <div
          ref={track}
          className="flex h-full w-max items-stretch gap-[6vw] pr-[12vw] will-change-transform"
          data-horizontal-track
        >
          {catalogueProducts.map((product) => (
            <ProductPanel
              key={product.slug}
              onOpenDetail={onOpenDetail}
              product={product}
            />
          ))}
          <CorporateCTAPanel />
        </div>
        <p
          className={cn(
            "pointer-events-none absolute bottom-14 right-8 z-30 text-[0.55rem] uppercase tracking-[0.2em] text-muted transition-opacity duration-500",
            hasMoved && "opacity-0",
          )}
        >
          Drag or scroll →
        </p>
        <GalleryProgress
          activeIndex={activeIndex}
          productNames={catalogueProducts.map((product) => product.name)}
          total={catalogueProducts.length}
        />
      </div>

      <div
        className="collection-gallery-vertical relative"
        data-gallery-mode="vertical"
      >
        <div className="sticky top-[72px] z-40 flex items-center justify-between border-y border-gold/25 bg-cream/95 px-gutter py-3 backdrop-blur-lg md:top-[84px]">
          <span className="text-[0.58rem] tracking-[0.2em] text-[#765b34]">
            {catalogueProducts[activeIndex].number}
          </span>
          <span className="font-display text-sm text-charcoal">
            {catalogueProducts[activeIndex].name}
          </span>
        </div>
        {catalogueProducts.map((product) => (
          <MobileProductCard
            key={product.slug}
            onOpenDetail={onOpenDetail}
            product={product}
          />
        ))}
        <CorporateCTAPanel mobile />
      </div>
    </div>
  );
});

HorizontalGallery.displayName = "HorizontalGallery";

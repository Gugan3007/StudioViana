"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";

import { gsap } from "@/lib/animations/gsap";
import { useFinePointer } from "@/lib/animations/useFinePointer";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { catalogueProducts, type Product } from "@/lib/data/products";
import { setCursorState } from "@/lib/store/cursorStore";

interface CollectionIndexProps {
  onSelectProduct: (product: Product, trigger: HTMLElement) => void;
  products?: readonly Product[];
}

export function CollectionIndex({
  onSelectProduct,
  products = catalogueProducts,
}: CollectionIndexProps) {
  const root = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const moveX = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const moveY = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const rotate = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const previousX = useRef(0);
  const hasFinePointer = useFinePointer();
  const shouldReduceMotion = useReducedMotion();
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (shouldReduceMotion || !root.current) return;
    const context = gsap.context(() => {
      gsap.fromTo(
        root.current!.querySelectorAll("[data-index-line]"),
        { scaleX: 0 },
        {
          duration: 0.9,
          ease: "power3.out",
          scaleX: 1,
          stagger: 0.08,
          scrollTrigger: {
            trigger: root.current,
            start: "top 82%",
            once: true,
          },
          transformOrigin: "left center",
        },
      );
    }, root);
    return () => context.revert();
  }, [shouldReduceMotion]);

  useIsomorphicLayoutEffect(() => {
    if (!hasFinePointer || shouldReduceMotion || !preview.current) return;
    moveX.current = gsap.quickTo(preview.current, "x", {
      duration: 0.45,
      ease: "power3.out",
    });
    moveY.current = gsap.quickTo(preview.current, "y", {
      duration: 0.45,
      ease: "power3.out",
    });
    rotate.current = gsap.quickTo(preview.current, "rotation", {
      duration: 0.5,
      ease: "power3.out",
    });
  }, [hasFinePointer, shouldReduceMotion]);

  return (
    <div
      ref={root}
      className="relative mx-auto w-full max-w-content px-gutter pb-[clamp(7rem,12vw,11rem)]"
      data-collection-index
      onPointerMove={(event) => {
        if (!hasFinePointer || shouldReduceMotion) return;
        moveX.current?.(event.clientX + 24);
        moveY.current?.(event.clientY - 120);
        rotate.current?.(
          Math.max(-6, Math.min(6, (event.clientX - previousX.current) * 0.2)),
        );
        previousX.current = event.clientX;
      }}
    >
      <div className="border-t border-gold/30">
        {products.map((product) => (
          <div key={product.slug} className="relative overflow-hidden">
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-px bg-gold/45"
              data-index-line
            />
            <button
              className="group grid min-h-24 w-full grid-cols-[3rem_4.5rem_1fr_auto] items-center gap-3 py-5 text-left sm:grid-cols-[4rem_1fr_auto_auto] sm:gap-6 md:min-h-28"
              data-cursor="view"
              onClick={(event) => onSelectProduct(product, event.currentTarget)}
              onPointerEnter={() => {
                setActiveProduct(product);
                setCursorState("view");
              }}
              onPointerLeave={() => {
                setActiveProduct(null);
                setCursorState("default");
              }}
              type="button"
            >
              <span
                aria-hidden="true"
                className="text-[0.65rem] tracking-[0.24em] text-[#765b34]"
              >
                {product.number}
              </span>
              <span
                aria-hidden="true"
                className="relative aspect-[4/5] overflow-hidden bg-cream-soft md:hidden"
              >
                <Image
                  fill
                  alt=""
                  className="object-cover"
                  placeholder="blur"
                  sizes="72px"
                  src={product.heroImage}
                />
              </span>
              <span
                aria-hidden="true"
                className="font-display text-[clamp(1.55rem,3vw,2.15rem)] leading-tight text-charcoal transition-transform duration-500 ease-out group-hover:translate-x-3 group-focus-visible:translate-x-3"
              >
                {product.name}
              </span>
              <span
                aria-hidden="true"
                className="hidden text-[0.65rem] uppercase tracking-[0.18em] text-muted sm:block"
              >
                {product.priceLabel}
              </span>
              <span
                aria-hidden="true"
                className="text-xl text-gold transition-transform duration-500 group-hover:translate-x-2 group-focus-visible:translate-x-2"
              >
                →
              </span>
              <span className="sr-only">
                {product.number} {product.name}{" "}
                <span className="hidden sm:inline">{product.priceLabel}</span> →
                View in collection
              </span>
            </button>
          </div>
        ))}
      </div>

      {hasFinePointer && !shouldReduceMotion ? (
        <div
          ref={preview}
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-[70] h-64 w-52 overflow-hidden border border-gold/60 bg-cream shadow-soft"
          data-cursor-preview
          style={{ opacity: activeProduct ? 1 : 0 }}
        >
          <AnimatePresence mode="wait">
            {activeProduct ? (
              <motion.div
                key={activeProduct.slug}
                animate={{ clipPath: "inset(0% 0 0 0)", opacity: 1 }}
                className="absolute inset-0"
                exit={{ clipPath: "inset(0 0 100% 0)", opacity: 0 }}
                initial={{ clipPath: "inset(100% 0 0 0)", opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  fill
                  alt=""
                  className="object-cover"
                  placeholder="blur"
                  sizes="208px"
                  src={activeProduct.heroImage}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  );
}

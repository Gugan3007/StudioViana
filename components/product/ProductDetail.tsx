"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { ProductAccordion } from "@/components/product/ProductAccordion";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { ProductOptions } from "@/components/product/ProductOptions";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { PillTag } from "@/components/ui/PillTag";
import { refreshScrollTrigger } from "@/lib/animations/gsap";
import { useLenis } from "@/lib/animations/useLenis";
import { useScrollLock } from "@/lib/animations/useScrollLock";
import type { Product } from "@/lib/data/products";
import type { OrderConfiguration } from "@/lib/utils/whatsapp";

interface ProductDetailProps {
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  product: Product;
  returnFocusTo?: HTMLElement | null;
}

const initialConfiguration = (product: Product): OrderConfiguration => ({
  flower: product.flowers?.[0],
  quantity: product.flowers ? 1 : undefined,
  size: product.sizes?.[0]?.label,
});

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ProductDetail({
  onClose,
  onSelectProduct,
  product,
  returnFocusTo,
}: ProductDetailProps) {
  const root = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const returnFocusRef = useRef(returnFocusTo);
  const { lenis } = useLenis();
  useScrollLock(lenis);
  const [configurationState, setConfigurationState] = useState(() => ({
    configuration: initialConfiguration(product),
    slug: product.slug,
  }));
  const configuration =
    configurationState.slug === product.slug
      ? configurationState.configuration
      : initialConfiguration(product);
  const setConfiguration = (next: OrderConfiguration) =>
    setConfigurationState({ configuration: next, slug: product.slug });
  const selectedVariant = product.variants.find(
    (variant) => variant.name === configuration.variant,
  );

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (root.current) root.current.scrollTop = 0;
  }, [product.slug]);

  useEffect(() => {
    const dialog = root.current;
    if (!dialog) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const returnFocusTarget = returnFocusRef.current;
    closeButton.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(focusableSelector),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeInside = dialog.contains(document.activeElement);
      if (
        event.shiftKey &&
        (!activeInside || document.activeElement === first)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (!activeInside || document.activeElement === last)
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const focusTarget = returnFocusTarget?.isConnected
        ? returnFocusTarget
        : previousFocus;
      focusTarget?.focus();
      refreshScrollTrigger();
    };
  }, []);

  return (
    <motion.div
      ref={root}
      aria-label={`${product.name} details`}
      aria-modal="true"
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[120] overflow-y-auto overscroll-contain bg-charcoal/70 p-0 text-charcoal lg:p-5"
      data-lenis-prevent
      data-product-detail
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
      transition={{ duration: 0.35 }}
    >
      <button
        ref={closeButton}
        aria-label="Close details"
        className="fixed right-4 top-4 z-[130] grid h-12 w-12 place-items-center rounded-full border border-gold/50 bg-cream/90 text-2xl text-charcoal transition-transform duration-500 hover:rotate-90 sm:right-7 sm:top-6"
        onClick={onClose}
        type="button"
      >
        ×
      </button>

      <div className="min-h-full bg-cream lg:grid lg:min-h-[calc(100svh-2.5rem)] lg:grid-cols-[55%_45%]">
        <ProductImageGallery
          onSelectVariant={(variant) =>
            setConfiguration({
              ...configuration,
              variant: variant?.name,
            })
          }
          product={product}
          selectedVariant={selectedVariant}
        />

        <div className="px-gutter pb-24 pt-12 lg:px-[clamp(2.5rem,5vw,6rem)] lg:pb-32 lg:pt-24">
          <p className="text-[0.55rem] uppercase tracking-[0.2em] text-muted">
            Collection <span className="px-2 text-gold">/</span> {product.name}
          </p>
          <p className="mt-9 text-[0.62rem] uppercase tracking-[0.24em] text-gold">
            Category {product.number}
          </p>
          <h2 className="mt-4 text-balance font-display text-[clamp(3.4rem,6vw,6.5rem)] leading-[0.92] tracking-[-0.05em]">
            {product.name}
          </h2>
          <p className="mt-5 font-display text-2xl italic leading-8 text-gold">
            {product.tagline}
          </p>
          <p className="mt-6 max-w-xl font-light leading-8 text-muted">
            {product.description}
          </p>
          <PillTag className="mt-6">Handmade · Made to Order</PillTag>

          <ProductOptions
            configuration={configuration}
            onChange={setConfiguration}
            product={product}
          />

          <section className="mt-11" aria-labelledby="included-heading">
            <h3 className="font-display text-3xl" id="included-heading">
              What&apos;s included
            </h3>
            <ul className="mt-5 grid gap-3 text-sm font-light leading-7 text-muted">
              {product.details.map((detail) => (
                <li key={detail} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                  />
                  {detail}
                </li>
              ))}
            </ul>
          </section>

          <ProductAccordion />
          <RelatedProducts
            onSelectProduct={onSelectProduct}
            product={product}
          />
        </div>
      </div>
    </motion.div>
  );
}

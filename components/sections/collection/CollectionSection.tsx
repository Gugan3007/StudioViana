"use client";

import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { CollectionIndex } from "@/components/sections/collection/CollectionIndex";
import { CollectionIntro } from "@/components/sections/collection/CollectionIntro";
import {
  type GalleryHandle,
  HorizontalGallery,
} from "@/components/sections/collection/HorizontalGallery";
import { GrandBouquetShowcase } from "@/components/sections/collection/GrandBouquetShowcase";
import { useProductQueryParam } from "@/components/product/useProductQueryParam";
import { getProductBySlug, type Product } from "@/lib/data/products";

const loadProductDetail = () => import("@/components/product/ProductDetail");
const DynamicProductDetail = dynamic(
  () => loadProductDetail().then((module) => module.ProductDetail),
  { ssr: false },
);

interface CollectionSectionProps {
  indexMode?: "detail" | "scroll";
  onSelectProduct?: (product: Product, trigger: HTMLElement) => void;
}

export function CollectionSection({
  indexMode = "scroll",
  onSelectProduct,
}: CollectionSectionProps) {
  const gallery = useRef<GalleryHandle>(null);
  const [productReturnFocus, setProductReturnFocus] =
    useState<HTMLElement | null>(null);
  const { closeProduct, openProduct, productSlug, replaceProduct } =
    useProductQueryParam();
  const selectedProduct = getProductBySlug(productSlug);

  useEffect(() => {
    const preload = (event: Event) => {
      const target = event.target as Element | null;
      if (target?.closest("[data-preload-product-detail]")) {
        void loadProductDetail();
      }
    };
    const openFromEvent = (event: Event) => {
      const detail = (
        event as CustomEvent<{
          returnFocus?: HTMLElement;
          slug?: string;
        }>
      ).detail;
      const slug = detail?.slug;
      setProductReturnFocus(detail?.returnFocus ?? null);
      if (slug) openProduct(slug);
    };
    document.addEventListener("focusin", preload);
    document.addEventListener("pointerover", preload);
    window.addEventListener("studio-viana:open-product", openFromEvent);
    return () => {
      document.removeEventListener("focusin", preload);
      document.removeEventListener("pointerover", preload);
      window.removeEventListener("studio-viana:open-product", openFromEvent);
    };
  }, [openProduct]);

  const showProduct = (product: Product, trigger: HTMLElement) => {
    if (onSelectProduct) {
      onSelectProduct(product, trigger);
      return;
    }
    setProductReturnFocus(trigger);
    openProduct(product.slug);
  };

  const selectProduct = (product: Product, trigger: HTMLElement) => {
    if (onSelectProduct) {
      onSelectProduct(product, trigger);
      return;
    }
    if (indexMode === "detail") {
      showProduct(product, trigger);
      return;
    }
    gallery.current?.scrollToProduct(product.slug);
  };

  return (
    <section
      id="collection"
      aria-labelledby="collection-heading"
      className="scroll-mt-[84px] bg-cream text-charcoal"
      data-collection-section
    >
      <CollectionIntro />
      <CollectionIndex onSelectProduct={selectProduct} />
      <HorizontalGallery ref={gallery} onOpenDetail={showProduct} />
      <GrandBouquetShowcase onOpenDetail={showProduct} />
      <AnimatePresence>
        {selectedProduct ? (
          <DynamicProductDetail
            onClose={() => {
              closeProduct();
              setProductReturnFocus(null);
            }}
            onSelectProduct={(product) => replaceProduct(product.slug)}
            product={selectedProduct}
            returnFocusTo={productReturnFocus}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}

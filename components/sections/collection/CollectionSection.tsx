"use client";

import { CollectionIndex } from "@/components/sections/collection/CollectionIndex";
import { CollectionIntro } from "@/components/sections/collection/CollectionIntro";
import type { Product } from "@/lib/data/products";

interface CollectionSectionProps {
  indexMode?: "detail" | "scroll";
  onSelectProduct?: (product: Product, trigger: HTMLElement) => void;
}

export function CollectionSection({
  indexMode = "scroll",
  onSelectProduct,
}: CollectionSectionProps) {
  const selectProduct = (product: Product, trigger: HTMLElement) => {
    if (onSelectProduct) {
      onSelectProduct(product, trigger);
      return;
    }
    if (indexMode === "detail") {
      window.dispatchEvent(
        new CustomEvent("studio-viana:open-product", {
          detail: { slug: product.slug },
        }),
      );
      return;
    }
    document
      .querySelector<HTMLElement>(`[data-product-slug="${product.slug}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
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
    </section>
  );
}

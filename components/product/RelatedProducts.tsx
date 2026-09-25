import Image from "next/image";

import { catalogueProducts, type Product } from "@/lib/data/products";

interface RelatedProductsProps {
  onSelectProduct: (product: Product) => void;
  product: Product;
}

export function RelatedProducts({
  onSelectProduct,
  product,
}: RelatedProductsProps) {
  const current = catalogueProducts.findIndex(
    (candidate) => candidate.slug === product.slug,
  );
  const related = [-1, 1, 2].map(
    (offset) =>
      catalogueProducts[
        (current + offset + catalogueProducts.length) % catalogueProducts.length
      ],
  );

  return (
    <section className="mt-14" aria-labelledby="related-products-heading">
      <h3
        className="font-display text-3xl text-charcoal"
        id="related-products-heading"
      >
        You may also love
      </h3>
      <div className="mt-6 grid grid-cols-3 gap-3">
        {related.map((item) => (
          <button
            key={item.slug}
            aria-label={`View ${item.name} details`}
            className="group text-left"
            onClick={() => onSelectProduct(item)}
            type="button"
          >
            <span className="relative block aspect-[4/5] overflow-hidden bg-cream-soft">
              <Image
                fill
                alt={item.heroAlt}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                placeholder="blur"
                sizes="(min-width: 1024px) 12vw, 28vw"
                src={item.heroImage}
              />
            </span>
            <span className="mt-3 block font-display text-sm leading-5 text-charcoal">
              {item.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

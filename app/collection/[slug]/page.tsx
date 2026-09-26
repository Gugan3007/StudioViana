import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { catalogueProducts, getProductBySlug } from "@/lib/data/products";
import { createPageMetadata } from "@/lib/seo/metadata";
import { createProductStructuredData } from "@/lib/seo/schema";

interface ProductRouteProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return catalogueProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductRouteProps): Promise<Metadata> {
  const product = getProductBySlug((await params).slug);
  if (!product) return {};
  return createPageMetadata({
    description: product.description,
    image: `/collection/${product.slug}/opengraph-image`,
    path: `/collection/${product.slug}`,
    title: product.name,
  });
}

export default async function ProductPage({ params }: ProductRouteProps) {
  const product = getProductBySlug((await params).slug);
  if (!product) notFound();
  const structuredData = createProductStructuredData(product);

  return (
    <main
      id="main-content"
      className="min-h-screen bg-cream pb-24 pt-28 text-charcoal lg:pt-36"
      tabIndex={-1}
    >
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
      <div className="mx-auto max-w-7xl px-gutter">
        <nav aria-label="Breadcrumb" className="text-xs text-muted">
          <Link className="body-link" href="/">
            Home
          </Link>
          <span aria-hidden="true" className="px-2 text-gold">
            /
          </span>
          <Link className="body-link" href="/#collection">
            Collection
          </Link>
          <span aria-hidden="true" className="px-2 text-gold">
            /
          </span>
          <span aria-current="page">{product.name}</span>
        </nav>

        <div className="mt-8 grid overflow-hidden border border-gold/25 bg-cream-soft lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative min-h-[50svh] bg-cream lg:min-h-[calc(100svh-12rem)]">
            <Image
              fill
              alt={product.heroAlt}
              className="object-cover"
              priority
              sizes="(min-width: 1024px) 54vw, 100vw"
              src={product.heroImage}
            />
          </div>
          <article className="flex flex-col justify-center px-gutter py-14 lg:px-[clamp(3rem,6vw,6rem)] lg:py-20">
            <p className="text-[0.6rem] uppercase tracking-[0.24em] text-gold">
              Collection {product.number}
            </p>
            <h1 className="mt-4 text-balance font-display text-[clamp(3.5rem,7vw,7rem)] leading-[0.9] tracking-[-0.05em]">
              {product.name}
            </h1>
            <p className="mt-5 font-display text-2xl italic leading-8 text-[#7a5d33]">
              {product.tagline}
            </p>
            <p className="mt-7 max-w-xl font-light leading-8 text-muted">
              {product.description}
            </p>
            <p className="mt-8 font-display text-3xl">{product.priceLabel}</p>
            <ul className="mt-8 grid gap-3 border-y border-gold/25 py-7 text-sm font-light text-muted">
              {product.details.map((detail) => (
                <li key={detail} className="flex gap-3">
                  <span aria-hidden="true" className="text-gold">
                    ·
                  </span>
                  {detail}
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-forest px-7 text-[0.62rem] uppercase tracking-[0.14em] text-cream"
                data-cursor="link"
                href={`/?product=${product.slug}#order`}
              >
                Begin custom order
              </Link>
              <Link
                className="body-link inline-flex min-h-12 items-center text-sm"
                href="/#collection"
              >
                Explore the collection →
              </Link>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}

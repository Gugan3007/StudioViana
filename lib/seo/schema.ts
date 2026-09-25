import type { FAQItem } from "@/lib/data/faq";
import type { Product, ProductImage } from "@/lib/data/products";
import { site } from "@/lib/data/site";

export type SchemaEntry = Record<string, unknown>;

const imageUrl = (image: ProductImage) => {
  const path = typeof image === "string" ? image : image.src;
  return new URL(path, site.url).toString();
};

const offerFor = (product: Product): SchemaEntry => {
  if (product.sizes?.length) {
    const prices = product.sizes.map((size) => size.price);
    return {
      "@type": "AggregateOffer",
      highPrice: Math.max(...prices),
      lowPrice: Math.min(...prices),
      offerCount: product.sizes.length,
      priceCurrency: "INR",
    };
  }
  return {
    "@type": "Offer",
    availability: "https://schema.org/PreOrder",
    price: product.priceFrom,
    priceCurrency: "INR",
    url: `${site.url}/?product=${product.slug}`,
  };
};

export function createStructuredData(
  products: readonly Product[],
  faqs: readonly FAQItem[],
): SchemaEntry[] {
  const business: SchemaEntry = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
      addressRegion: "Tamil Nadu",
    },
    email: site.email,
    founder: { "@type": "Person", name: site.founder },
    name: site.name,
    sameAs: [site.instagramUrl],
    telephone: `+${site.whatsappNumber}`,
    url: site.url,
  };

  const productGraphs = products.map<SchemaEntry>((product) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    brand: { "@type": "Brand", name: site.name },
    description: product.description,
    image: product.gallery.map((item) => imageUrl(item.image)),
    name: product.name,
    offers: offerFor(product),
    sku: product.slug,
  }));

  const faqPage: SchemaEntry = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
      name: faq.question,
    })),
  };

  return [business, ...productGraphs, faqPage];
}

import type { MetadataRoute } from "next";

import { catalogueProducts } from "@/lib/data/products";
import { SITE_URL } from "@/lib/seo/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/privacy", "/terms"].map((path) => ({
    changeFrequency: path ? ("yearly" as const) : ("weekly" as const),
    priority: path ? 0.3 : 1,
    url: `${SITE_URL}${path}`,
  }));
  const productRoutes = catalogueProducts.map((product) => ({
    changeFrequency: "monthly" as const,
    priority: 0.8,
    url: `${SITE_URL}/collection/${product.slug}`,
  }));
  return [...staticRoutes, ...productRoutes];
}

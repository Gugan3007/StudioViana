import type { Metadata } from "next";

import { site } from "@/lib/data/site";

export const SITE_URL = site.url;

interface PageMetadataOptions {
  description: string;
  image?: string;
  path: string;
  title: string;
}

export function createPageMetadata({
  description,
  image = "/opengraph-image",
  path,
  title,
}: PageMetadataOptions): Metadata {
  const canonical = new URL(path, SITE_URL).toString();
  return {
    alternates: { canonical },
    description,
    openGraph: {
      description,
      images: [{ alt: `${title} — ${site.name}`, url: image }],
      locale: "en_IN",
      siteName: site.name,
      title,
      type: "website",
      url: canonical,
    },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [image],
      title,
    },
  };
}

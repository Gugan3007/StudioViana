import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import ProductPage, {
  generateStaticParams,
} from "@/app/collection/[slug]/page";
import manifest from "@/app/manifest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { shouldInterceptNavigation } from "@/components/transitions/RouteTransition";
import { catalogueProducts } from "@/lib/data/products";
import { createPageMetadata, SITE_URL } from "@/lib/seo/metadata";
import { createProductStructuredData } from "@/lib/seo/schema";

describe("Phase 6 routes and SEO", () => {
  it("builds canonical Open Graph and Twitter metadata", () => {
    const metadata = createPageMetadata({
      description: "How Studio Viana handles visitor information.",
      path: "/privacy",
      title: "Privacy",
    });
    expect(SITE_URL).toBe("https://studioviana.com");
    expect(metadata.alternates?.canonical).toBe(
      "https://studioviana.com/privacy",
    );
    expect(metadata.openGraph).toMatchObject({
      locale: "en_IN",
      type: "website",
      url: "https://studioviana.com/privacy",
    });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("publishes all crawlable routes in sitemap, robots and manifest", () => {
    expect(sitemap()).toHaveLength(11);
    expect(sitemap().map((entry) => entry.url)).toContain(
      "https://studioviana.com/collection/grand-bouquet",
    );
    expect(robots()).toMatchObject({
      sitemap: "https://studioviana.com/sitemap.xml",
    });
    expect(manifest()).toMatchObject({
      background_color: "#F7F0E6",
      display: "standalone",
      theme_color: "#1F3326",
    });
  });

  it("renders all eight static product routes with product and breadcrumb data", async () => {
    expect(generateStaticParams()).toHaveLength(catalogueProducts.length);
    const markup = renderToStaticMarkup(
      await ProductPage({
        params: Promise.resolve({ slug: "grand-bouquet" }),
      }),
    );
    expect(markup).toContain("The Grand Bouquet");
    expect(markup.match(/<h1/g)).toHaveLength(1);
    expect(markup).toContain('"@type":"Product"');
    expect(markup).toContain('"@type":"BreadcrumbList"');

    const graph = createProductStructuredData(catalogueProducts[6]);
    expect(graph).toMatchObject({
      "@context": "https://schema.org",
      "@graph": expect.arrayContaining([
        expect.objectContaining({ "@type": "Product" }),
        expect.objectContaining({ "@type": "BreadcrumbList" }),
      ]),
    });
  });

  it("intercepts only native same-origin pathname navigation", () => {
    const current = new URL("https://studioviana.com/privacy");
    const anchor = document.createElement("a");
    anchor.href = "https://studioviana.com/terms";
    expect(
      shouldInterceptNavigation(
        {
          button: 0,
          defaultPrevented: false,
          metaKey: false,
          ctrlKey: false,
          shiftKey: false,
          altKey: false,
        },
        anchor,
        current,
      ),
    ).toBe(true);

    anchor.href = "https://studioviana.com/privacy#details";
    expect(
      shouldInterceptNavigation(
        {
          button: 0,
          defaultPrevented: false,
          metaKey: false,
          ctrlKey: false,
          shiftKey: false,
          altKey: false,
        },
        anchor,
        current,
      ),
    ).toBe(false);

    anchor.href = "https://studioviana.com/#collection";
    expect(
      shouldInterceptNavigation(
        {
          button: 0,
          defaultPrevented: false,
          metaKey: false,
          ctrlKey: false,
          shiftKey: false,
          altKey: false,
        },
        anchor,
        current,
      ),
    ).toBe(true);
    anchor.href = "https://example.com/terms";
    expect(
      shouldInterceptNavigation(
        {
          button: 0,
          defaultPrevented: false,
          metaKey: false,
          ctrlKey: false,
          shiftKey: false,
          altKey: false,
        },
        anchor,
        current,
      ),
    ).toBe(false);
  });
});

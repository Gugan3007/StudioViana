import { describe, expect, it } from "vitest";

import {
  catalogueProducts,
  corporateProduct,
  getProductBySlug,
} from "@/lib/data/products";
import {
  enquiryMessage,
  orderMessage,
  smallBouquetPrices,
} from "@/lib/utils/whatsapp";

describe("Phase 3 catalogue", () => {
  it("exposes eight complete orderable products in approved order", () => {
    expect(catalogueProducts.map((product) => product.number)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
    ]);

    for (const product of catalogueProducts) {
      expect(product).toMatchObject({
        id: expect.any(String),
        slug: expect.any(String),
        priceLabel: expect.any(String),
        priceFrom: expect.any(Number),
        tagline: expect.any(String),
        description: expect.any(String),
        customisable: expect.any(Boolean),
        heroImage: expect.anything(),
        heroAlt: expect.stringContaining("chenille"),
        featured: expect.any(Boolean),
        theme: expect.stringMatching(/^(light|dark)$/),
        accent: expect.stringMatching(/^#[0-9a-f]{6}$/i),
      });
      expect(product.details.length).toBeGreaterThanOrEqual(3);
      expect(product.occasions.length).toBeGreaterThanOrEqual(3);
      expect(product.gallery.length).toBeGreaterThan(0);
      expect(product.variants).toBeDefined();
    }
  });

  it("keeps the corporate endpoint separate from the eight-piece count", () => {
    expect(corporateProduct).toMatchObject({
      id: "corporate-bulk-orders",
      number: "09",
      name: "Corporate & Bulk Orders",
      priceLabel: "On request",
    });
    expect(catalogueProducts).not.toContain(corporateProduct);
  });

  it("looks products up safely by slug", () => {
    expect(getProductBySlug("medium-bouquets")?.number).toBe("04");
    expect(getProductBySlug("corporate-bulk-orders")).toBeUndefined();
    expect(getProductBySlug("missing")).toBeUndefined();
    expect(getProductBySlug(null)).toBeUndefined();
  });
});

describe("Phase 3 WhatsApp messages", () => {
  const medium = () => getProductBySlug("medium-bouquets")!;
  const singleStem = () => getProductBySlug("single-stem-florals")!;
  const small = () => getProductBySlug("small-bouquets")!;

  it("builds the approved concise variant order message", () => {
    expect(orderMessage(medium(), "Violet Edit")).toBe(
      "Hi Studio Viana! 🌸 I'd love to order the Medium Bouquet (Violet Edit) — ₹550. Could you share availability and customisation options?",
    );
  });

  it("includes configured options and multiplies single-stem quantity", () => {
    expect(
      orderMessage(singleStem(), {
        flower: "Rose",
        quantity: 3,
        palette: "Ruby Red",
        occasion: "Congratulations",
        personalMessage: "Proud of you.",
      }),
    ).toBe(
      "Hi Studio Viana! 🌸 I'd love to order the Single Stem Floral (Rose) — ₹360. Quantity: 3. Palette: Ruby Red. Occasion: Congratulations. Message: Proud of you. Could you share availability and customisation options?",
    );
  });

  it("uses the configurable one- and two-bloom price mapping", () => {
    expect(smallBouquetPrices).toEqual({ "1 bloom": 150, "2 blooms": 250 });
    expect(orderMessage(small(), { size: "2 blooms" })).toContain("₹250");
  });

  it("builds a general product enquiry without order language", () => {
    expect(enquiryMessage(medium())).toBe(
      "Hi Studio Viana! 🌸 I have a question about the Medium Bouquets. Could you help me with the details and customisation options?",
    );
  });
});

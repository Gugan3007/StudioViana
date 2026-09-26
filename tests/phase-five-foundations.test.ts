import { describe, expect, it } from "vitest";

import { faqItems } from "@/lib/data/faq";
import { catalogueProducts } from "@/lib/data/products";
import {
  builderOptions,
  ORDER_MODE,
  phaseFiveConfig,
  site,
} from "@/lib/data/site";
import { createStructuredData } from "@/lib/seo/schema";
import {
  bulkEnquirySchema,
  customerDetailsSchema,
  orderSchema,
} from "@/lib/validation/orderSchema";
import {
  estimateOrder,
  formatINR,
  formatINRValue,
} from "@/lib/utils/formatINR";
import {
  buildBagMessage,
  buildBulkMessage,
  buildOrderMessage,
  mailtoLink,
} from "@/lib/utils/whatsapp";

const completeOrder = {
  customerName: "Ananya Rao",
  deliveryArea: "Kochi",
  deliveryMethod: "delivery" as const,
  email: "ananya@example.com",
  flowers: ["Lily", "Tulip"],
  messageCard: "Always, in every season.",
  neededBy: "2026-10-12",
  notes: "Please keep the wrap minimal.",
  occasion: "Anniversary",
  palettes: ["Lilac", "Ivory White"],
  phone: "+91 98765 43210",
  pieceSlug: "medium-bouquets",
  quantity: 1,
  step: 5,
  variant: "Violet Edit",
  wrapStyle: "Sheer white",
};

describe("Phase 5 configuration", () => {
  it("keeps every editable conversion option in data", () => {
    expect(ORDER_MODE).toMatch(/^(builder|whatsapp-direct)$/);
    expect(phaseFiveConfig).toMatchObject({
      cataloguePath: null,
      leadTimeDays: 3,
    });
    expect(site.businessHours).toContain("Mon–Sat");
    expect(site.deliveryRegions.length).toBeGreaterThan(0);
    expect(builderOptions.flowers).toContain("Surprise me");
    expect(builderOptions.palettes).toContain("Mixed Pastels");
    expect(builderOptions.occasions).toContain("Corporate");
    expect(builderOptions.bulkRanges).toEqual([
      "20–50",
      "50–100",
      "100–250",
      "250+",
    ]);
  });

  it("provides the eight approved editable FAQ entries", () => {
    expect(faqItems).toHaveLength(8);
    expect(faqItems.map((item) => item.question)).toContain(
      "What are chenille flowers?",
    );
  });
});

describe("Phase 5 currency and estimation", () => {
  it("formats Indian values and ranges", () => {
    expect(formatINR(1250)).toBe("₹1,250");
    expect(formatINRValue(125000)).toBe("1,25,000");
  });

  it("estimates quantity and size dependent orders", () => {
    expect(
      estimateOrder({ pieceSlug: "single-stem-florals", quantity: 24 }),
    ).toBe(2880);
    expect(estimateOrder({ pieceSlug: "flower-cards", quantity: 20 })).toBe(
      3000,
    );
    expect(
      estimateOrder({ pieceSlug: "small-bouquets", size: "2 blooms" }),
    ).toBe(250);
    expect(estimateOrder(completeOrder)).toBe(550);
  });
});

describe("Phase 5 validation", () => {
  it("accepts a complete order and rejects missing identity fields", () => {
    expect(orderSchema.safeParse(completeOrder).success).toBe(true);
    const result = customerDetailsSchema.safeParse({
      customerName: "",
      deliveryMethod: "delivery",
      phone: "123",
    });
    expect(result.success).toBe(false);
  });

  it("requires delivery area only when delivery is selected", () => {
    expect(
      customerDetailsSchema.safeParse({
        customerName: "Sadhana",
        deliveryArea: "",
        deliveryMethod: "delivery",
        phone: "+91 94887 13438",
      }).success,
    ).toBe(false);
    expect(
      customerDetailsSchema.safeParse({
        customerName: "Sadhana",
        deliveryMethod: "pickup",
        phone: "+91 94887 13438",
      }).success,
    ).toBe(true);
  });

  it("validates bulk enquiries with an Indian phone number", () => {
    expect(
      bulkEnquirySchema.safeParse({
        eventDate: "2026-12-01",
        eventType: "Wedding",
        message: "Flower card favours in ivory and blush.",
        name: "Meera",
        phone: "9876543210",
        quantityRange: "50–100",
      }).success,
    ).toBe(true);
    expect(
      bulkEnquirySchema.safeParse({
        eventDate: "",
        eventType: "",
        message: "",
        name: "",
        phone: "no",
        quantityRange: "",
      }).success,
    ).toBe(false);
  });
});

describe("Phase 5 outbound messages", () => {
  it("builds the complete custom order message", () => {
    expect(buildOrderMessage(completeOrder)).toBe(
      [
        "Hi Studio Viana! 🌸 I'd like to place an order:",
        "• Piece: Medium Bouquet (Violet Edit)",
        "• Flowers: Lily, Tulip",
        "• Palette: Lilac, Ivory White | Wrap: Sheer white",
        "• Occasion: Anniversary",
        '• Message card: "Always, in every season."',
        "• Needed by: 12 Oct 2026 | Delivery: Kochi",
        "• Estimated total: ₹550",
        "Name: Ananya Rao | Phone: +91 98765 43210",
        "Email: ananya@example.com",
        "Notes: Please keep the wrap minimal.",
      ].join("\n"),
    );
  });

  it("builds corporate and combined bag messages", () => {
    expect(
      buildBulkMessage({
        budget: "₹250–₹500",
        eventDate: "2026-12-01",
        eventType: "Wedding",
        message: "Blush flower-card favours.",
        name: "Meera",
        organisation: "Rao Family",
        phone: "9876543210",
        quantityRange: "50–100",
      }),
    ).toContain("• Quantity: 50–100");

    expect(
      buildBagMessage([
        {
          id: "a",
          productSlug: "flower-cards",
          quantity: 2,
          unitPrice: 150,
        },
        {
          id: "b",
          productSlug: "medium-bouquets",
          quantity: 1,
          unitPrice: 550,
          variant: "Violet Edit",
        },
      ]),
    ).toContain("Estimated total: ₹850");
  });

  it("encodes mailto subjects and multiline bodies", () => {
    const href = mailtoLink(
      "Order enquiry — Medium Bouquet",
      "Line one\nLine & two",
    );
    expect(href).toBe(
      "mailto:studioviana30@gmail.com?subject=Order%20enquiry%20%E2%80%94%20Medium%20Bouquet&body=Line%20one%0ALine%20%26%20two",
    );
  });
});

describe("Phase 5 structured data", () => {
  it("creates LocalBusiness, Product and FAQPage graphs", () => {
    const graph = createStructuredData(catalogueProducts, faqItems);
    expect(graph[0]).toMatchObject({
      "@type": "LocalBusiness",
      founder: { "@type": "Person", name: "Dr. Sadhana" },
      telephone: "+919488713438",
    });
    expect(graph.filter((entry) => entry["@type"] === "Product")).toHaveLength(
      8,
    );
    expect(graph.at(-1)).toMatchObject({
      "@type": "FAQPage",
      mainEntity: expect.arrayContaining([
        expect.objectContaining({ "@type": "Question" }),
      ]),
    });
  });
});

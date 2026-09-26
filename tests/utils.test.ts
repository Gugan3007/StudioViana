import { describe, expect, it } from "vitest";

import { catalogueProducts } from "@/lib/data/products";
import type { BagItem } from "@/lib/store/bagStore";
import { cn, formatINR, whatsappLink } from "@/lib/utils";
import {
  buildBagMessage,
  buildBulkMessage,
  buildOrderMessage,
  mailtoLink,
  orderMessage,
} from "@/lib/utils/whatsapp";

describe("formatINR", () => {
  it("uses Indian digit grouping without forcing decimal places", () => {
    expect(formatINR(1250)).toBe("₹1,250");
    expect(formatINR(125000)).toBe("₹1,25,000");
  });
});

describe("whatsappLink", () => {
  it("normalizes the Studio Viana number and encodes complex messages", () => {
    expect(whatsappLink("Hello & thank you 🌸\nStudio Viana")).toBe(
      "https://wa.me/919488713438?text=Hello%20%26%20thank%20you%20%F0%9F%8C%B8%0AStudio%20Viana",
    );
  });

  it("omits an empty query string", () => {
    expect(whatsappLink()).toBe("https://wa.me/919488713438");
  });

  const bagItems: readonly BagItem[] = [
    {
      id: "flower-card",
      productSlug: "flower-cards",
      quantity: 2,
      unitPrice: 150,
    },
  ];

  it.each([
    ["product", orderMessage(catalogueProducts[3], "Violet Edit")],
    [
      "builder",
      buildOrderMessage({
        customerName: "Ananya Rao",
        neededBy: "2026-10-12",
        phone: "+91 98765 43210",
        pieceSlug: "medium-bouquets",
        variant: "Violet Edit",
      }),
    ],
    ["bag", buildBagMessage(bagItems)],
    [
      "bulk",
      buildBulkMessage({
        budget: "₹250–₹500",
        email: "meera@example.com",
        eventDate: "2026-12-01",
        eventType: "Wedding",
        message: "Ivory & blush 🌸",
        name: "Meera Rao",
        organisation: "Rao Family",
        phone: "9876543210",
        quantityRange: "50–100",
      }),
    ],
  ])("preserves the exact decoded %s message", (_name, message) => {
    const url = new URL(whatsappLink(message));

    expect(url.protocol).toBe("https:");
    expect(url.hostname).toBe("wa.me");
    expect(url.pathname).toBe("/919488713438");
    expect([...url.searchParams.keys()]).toEqual(["text"]);
    expect(url.searchParams.get("text")).toBe(message);
  });

  it("preserves the email destination, subject, emoji, currency and line breaks", () => {
    const subject = "Order enquiry — ₹550";
    const body = "Hello Studio Viana 🌸\nLine & two";
    const url = new URL(mailtoLink(subject, body));

    expect(url.protocol).toBe("mailto:");
    expect(url.pathname).toBe("studioviana30@gmail.com");
    expect([...url.searchParams.keys()]).toEqual(["subject", "body"]);
    expect(url.searchParams.get("subject")).toBe(subject);
    expect(url.searchParams.get("body")).toBe(body);
  });
});

describe("cn", () => {
  it("merges conditional classes and resolves Tailwind conflicts", () => {
    expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4");
  });
});

import { describe, expect, it } from "vitest";

import { products, services } from "@/lib/data/products";
import { site, whatsappLink } from "@/lib/data/site";

describe("Studio Viana catalogue data", () => {
  it("preserves the approved product order and prices", () => {
    expect(
      products.map(({ number, priceLabel }) => [number, priceLabel]),
    ).toEqual([
      ["01", "₹150"],
      ["02", "₹120 per stem"],
      ["03", "₹150 – ₹250"],
      ["04", "₹550"],
      ["05", "₹650"],
      ["06", "₹1,250"],
      ["07", "₹1,250"],
      ["08", "₹1,250"],
      ["09", "On request"],
    ]);
  });

  it("uses unique identifiers, numbers, and slugs", () => {
    expect(new Set(products.map((product) => product.id)).size).toBe(
      products.length,
    );
    expect(new Set(products.map((product) => product.number)).size).toBe(
      products.length,
    );
    expect(new Set(products.map((product) => product.slug)).size).toBe(
      products.length,
    );
  });

  it("marks only the Grand Bouquet as featured", () => {
    expect(
      products
        .filter((product) => product.featured)
        .map((product) => product.name),
    ).toEqual(["The Grand Bouquet"]);
  });

  it("preserves service ordering", () => {
    expect(services.map((service) => service.name)).toEqual([
      "Hampers",
      "Bouquets",
      "Corporate Events",
      "Return Gifts",
    ]);
  });
});

describe("Studio Viana site data", () => {
  it("contains the approved brand and contact details", () => {
    expect(site).toMatchObject({
      name: "Studio Viana",
      tagline: "Curated with love",
      secondaryLine: "Flowers that never fade, feelings that never end",
      founder: "Dr. Sadhana",
      location: "Tamil Nadu, India",
      email: "studioviana30@gmail.com",
      instagramHandle: "@studio_viana.in",
      instagramUrl: "https://www.instagram.com/studio_viana.in",
      whatsappNumber: "919488713438",
    });
  });

  it("re-exports the canonical WhatsApp helper", () => {
    expect(whatsappLink("Hello")).toBe("https://wa.me/919488713438?text=Hello");
  });
});

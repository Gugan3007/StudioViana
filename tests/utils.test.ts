import { describe, expect, it } from "vitest";

import { cn, formatINR, whatsappLink } from "@/lib/utils";

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
});

describe("cn", () => {
  it("merges conditional classes and resolves Tailwind conflicts", () => {
    expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4");
  });
});

import { describe, expect, it } from "vitest";

import { galleryFilters, galleryItems } from "@/lib/data/gallery";
import { instagramItems } from "@/lib/data/instagram";
import { processSteps } from "@/lib/data/process";
import { testimonials, trustStats } from "@/lib/data/testimonials";

describe("Phase 4 data", () => {
  it("supplies every record needed by the five-section experience", () => {
    expect(processSteps.map((step) => step.number)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
    ]);
    expect(galleryItems).toHaveLength(18);
    expect(galleryFilters).toEqual([
      "All",
      "Bouquets",
      "Hampers",
      "Flower Cards",
      "Single Stems",
      "Occasions",
    ]);
    expect(new Set(galleryItems.map((item) => item.id)).size).toBe(18);
    expect(
      galleryItems.every(
        (item) => item.width >= 1 && item.height >= 1 && item.alt.length > 20,
      ),
    ).toBe(true);
    expect(testimonials).toHaveLength(5);
    expect(testimonials.every((item) => item.placeholder)).toBe(true);
    expect(trustStats).toHaveLength(4);
    expect(instagramItems).toHaveLength(10);
  });
});

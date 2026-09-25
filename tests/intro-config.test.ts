import { describe, expect, it } from "vitest";

import {
  getSequenceFrameUrl,
  getSequenceFrameUrls,
  getSequenceLoadOrder,
  introConfig,
} from "@/components/intro/intro.config";

describe("introConfig", () => {
  it("keeps the approved scene labels and breakpoint choreography", () => {
    expect(introConfig.timeline).toEqual({
      brand: 0,
      flower: 15,
      dive: 35,
      light: 80,
      complete: 100,
    });
    expect(introConfig.breakpoints.desktop).toMatchObject({
      pinVh: 260,
      diveScale: 2,
      showMiddleLayer: false,
    });
    expect(introConfig.breakpoints.tablet).toMatchObject({
      pinVh: 220,
      diveScale: 1.85,
      showMiddleLayer: false,
    });
    expect(introConfig.breakpoints.mobile).toMatchObject({
      pinVh: 180,
      diveScale: 1.7,
      showMiddleLayer: false,
      petalLayers: 1,
    });
    expect(introConfig.scrub).toBeLessThanOrEqual(0.4);
    expect(introConfig.preload).toEqual({
      firstVisitMs: 450,
      repeatVisitMs: 0,
      maximumMs: 2500,
    });
    expect(introConfig.assets.desktopFlower).toBe(
      "/images/craft/closeup-macro.jpg",
    );
    expect(introConfig.assets.mobileFlower).toBe(
      "/images/craft/closeup-flower.jpg",
    );
  });

  it("formats all frame URLs and prioritizes frame one then every tenth frame", () => {
    expect(getSequenceFrameUrl(1)).toBe("/sequence/flower_0001.webp");
    expect(getSequenceFrameUrl(150)).toBe("/sequence/flower_0150.webp");

    const urls = getSequenceFrameUrls();
    const ordered = getSequenceLoadOrder(urls);

    expect(ordered).toHaveLength(150);
    expect(new Set(ordered).size).toBe(150);
    expect(ordered.slice(0, 4)).toEqual([
      "/sequence/flower_0001.webp",
      "/sequence/flower_0010.webp",
      "/sequence/flower_0020.webp",
      "/sequence/flower_0030.webp",
    ]);
  });
});

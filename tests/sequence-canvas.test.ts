import { describe, expect, it } from "vitest";

import {
  findNearestLoadedFrame,
  getCoverRect,
} from "@/components/intro/sequenceCanvas";

describe("getCoverRect", () => {
  it("covers a portrait viewport with a landscape source", () => {
    const rect = getCoverRect({
      sourceWidth: 1920,
      sourceHeight: 1080,
      targetWidth: 375,
      targetHeight: 812,
      focalX: 0.5,
      focalY: 0.48,
    });

    expect(rect.drawHeight).toBeCloseTo(812);
    expect(rect.drawWidth).toBeGreaterThan(375);
    expect(rect.x).toBeLessThan(0);
    expect(rect.y).toBeCloseTo(0);
  });

  it("clamps focal coordinates before positioning the crop", () => {
    const base = {
      sourceWidth: 1600,
      sourceHeight: 900,
      targetWidth: 400,
      targetHeight: 800,
    };

    expect(getCoverRect({ ...base, focalX: -1, focalY: -1 })).toEqual(
      getCoverRect({ ...base, focalX: 0, focalY: 0 }),
    );
    expect(getCoverRect({ ...base, focalX: 2, focalY: 2 })).toEqual(
      getCoverRect({ ...base, focalX: 1, focalY: 1 }),
    );
  });
});

describe("findNearestLoadedFrame", () => {
  it("returns an exact frame or the nearest available frame", () => {
    const frameZero = { id: 0 };
    const frameTen = { id: 10 };
    const frames = new Map([
      [0, frameZero],
      [10, frameTen],
    ]);

    expect(findNearestLoadedFrame(frames, 10)).toBe(frameTen);
    expect(findNearestLoadedFrame(frames, 8)).toBe(frameTen);
    expect(findNearestLoadedFrame(new Map(), 8)).toBeNull();
  });

  it("prefers the lower frame when distances are equal", () => {
    const lower = { id: 4 };
    const upper = { id: 6 };

    expect(
      findNearestLoadedFrame(
        new Map([
          [6, upper],
          [4, lower],
        ]),
        5,
      ),
    ).toBe(lower);
  });
});

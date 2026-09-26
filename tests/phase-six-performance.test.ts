import { describe, expect, it } from "vitest";

import {
  derivativeName,
  parseOptimizerArgs,
  planResponsiveWidths,
} from "@/scripts/optimize-images.mjs";
import {
  getCanvasDpr,
  getIntroRuntimeSettings,
  getSequenceLoadOrder,
} from "@/components/intro/intro.config";
// @ts-expect-error Next config is authored as an ESM JavaScript config file.
import nextConfig, { phaseSixCachePolicy } from "@/next.config.mjs";

describe("Phase 6 performance tooling", () => {
  it("plans capped responsive derivatives with deterministic names", () => {
    expect(planResponsiveWidths(3200, [480, 768, 1280, 1920, 2560])).toEqual([
      480, 768, 1280, 1920, 2560,
    ]);
    expect(planResponsiveWidths(900, [480, 768, 1280])).toEqual([
      480, 768, 900,
    ]);
    expect(derivativeName("gallery-01.jpg", 768, "avif")).toBe(
      "gallery-01-768.avif",
    );
  });

  it("keeps optimization non-destructive unless overwrite is explicit", () => {
    expect(parseOptimizerArgs(["--input", "public/images"])).toMatchObject({
      dryRun: false,
      input: "public/images",
      output: "public/images-optimized",
      overwrite: false,
    });
    expect(
      parseOptimizerArgs([
        "--input",
        "public/images",
        "--output",
        "public/images",
        "--overwrite",
        "--dry-run",
      ]),
    ).toMatchObject({ dryRun: true, overwrite: true });
  });

  it("caps canvas density and simplifies the intro on low-power devices", () => {
    expect(
      getCanvasDpr({ devicePixelRatio: 3, lowPower: false, mobile: true }),
    ).toBe(1.5);
    expect(
      getCanvasDpr({ devicePixelRatio: 3, lowPower: false, mobile: false }),
    ).toBe(2);
    expect(
      getCanvasDpr({ devicePixelRatio: 3, lowPower: true, mobile: false }),
    ).toBe(1);
    expect(getIntroRuntimeSettings("desktop", true)).toMatchObject({
      particles: 0,
      petalLayers: 1,
      pinVh: 180,
    });
  });

  it("loads priority sequence frames first and serves correct cache policies", async () => {
    const urls = Array.from({ length: 20 }, (_, index) => `frame-${index + 1}`);
    expect(getSequenceLoadOrder(urls).slice(0, 3)).toEqual([
      "frame-1",
      "frame-10",
      "frame-20",
    ]);
    const headers = (await nextConfig.headers?.()) as
      | Array<{
          headers: Array<{ key: string; value: string }>;
          source: string;
        }>
      | undefined;
    expect(headers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "/images/:path*" }),
        expect.objectContaining({ source: "/sequence/:path*" }),
      ]),
    );
    const editableImages = headers?.find(
      (entry) => entry.source === "/images/:path*",
    );
    expect(editableImages?.headers[0].value).not.toContain("immutable");
    expect(phaseSixCachePolicy.nextStatic).toContain("immutable");
  });

  it("hardens every production response without disabling compression", async () => {
    expect(nextConfig.poweredByHeader).toBe(false);
    expect(nextConfig.compress).not.toBe(false);

    const headers = (await nextConfig.headers?.()) as
      | Array<{
          headers: Array<{ key: string; value: string }>;
          source: string;
        }>
      | undefined;
    const globalHeaders = headers?.find(
      (entry) => entry.source === "/:path*",
    )?.headers;
    const byName = new Map(
      globalHeaders?.map(({ key, value }) => [key.toLowerCase(), value]),
    );

    expect(byName.get("content-security-policy")).toContain(
      "frame-ancestors 'none'",
    );
    expect(byName.get("strict-transport-security")).toContain(
      "max-age=63072000",
    );
    expect(byName.get("x-content-type-options")).toBe("nosniff");
    expect(byName.get("referrer-policy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(byName.get("permissions-policy")).toContain("camera=()");
  });
});

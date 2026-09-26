import { render, screen, waitFor } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";

import Home from "@/app/page";
import { PhaseFiveLoadingShell } from "@/components/sections/phase-five/PhaseFiveSections";

vi.mock("@/components/intro/IntroSection", () => ({
  IntroSection: () => <div data-testid="intro-placeholder" />,
}));
vi.mock("@/lib/animations/useLenis", () => ({
  useLenis: () => ({ lenis: null }),
}));
vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => true,
}));
vi.mock("@/lib/context/IntroContext", () => ({
  useIntro: () => ({ introComplete: true }),
}));

/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
vi.mock("next/image", () => ({
  default: function MockImage({
    fill,
    placeholder,
    priority,
    src,
    ...props
  }: Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
    fill?: boolean;
    placeholder?: string;
    priority?: boolean;
    src: { src?: string } | string;
  }) {
    return (
      <img
        {...props}
        data-fill={fill || undefined}
        data-placeholder={placeholder}
        data-priority={priority || undefined}
        src={typeof src === "string" ? src : src.src}
      />
    );
  },
}));
/* eslint-enable @next/next/no-img-element, jsx-a11y/alt-text */

describe("Phase 5 page composition and SEO", () => {
  it("renders all conversion sections with themes and one h1", async () => {
    render(<Home />);
    await waitFor(
      () => {
        expect(
          document.querySelector("[data-phase-five-loading]"),
        ).not.toBeInTheDocument();
      },
      { timeout: 5_000 },
    );
    expect(document.getElementById("pricing")).toHaveAttribute(
      "data-theme",
      "light",
    );
    expect(document.getElementById("order")).toHaveAttribute(
      "data-theme",
      "light",
    );
    expect(document.getElementById("corporate")).toHaveAttribute(
      "data-theme",
      "dark",
    );
    expect(document.getElementById("faq")).toHaveAttribute(
      "data-theme",
      "light",
    );
    expect(document.getElementById("contact")).toHaveAttribute(
      "data-theme",
      "dark",
    );
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("emits sanitized LocalBusiness, eight Products and FAQPage JSON-LD", () => {
    const { container } = render(<Home />);
    const scripts = Array.from(
      container.querySelectorAll<HTMLScriptElement>(
        'script[type="application/ld+json"]',
      ),
    );
    const data = scripts.map((script) =>
      JSON.parse(script.textContent ?? "{}"),
    );
    expect(
      data.find((entry) => entry["@type"] === "LocalBusiness"),
    ).toMatchObject({
      founder: { name: "Dr. Sadhana" },
      telephone: "+919488713438",
    });
    expect(data.filter((entry) => entry["@type"] === "Product")).toHaveLength(
      8,
    );
    expect(
      data.find((entry) => entry["@type"] === "FAQPage").mainEntity,
    ).toHaveLength(8);
    expect(
      scripts.every((script) => !script.textContent?.includes("<script")),
    ).toBe(true);
  });

  it("reserves stable height in dynamic loading shells", () => {
    const { container } = render(
      <PhaseFiveLoadingShell id="order" label="Loading order builder" />,
    );
    expect(container.firstElementChild).toHaveClass("min-h-[52rem]");
    expect(screen.getByText("Loading order builder")).toHaveClass("sr-only");
  });
});

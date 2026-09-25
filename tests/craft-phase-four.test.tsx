import { render, screen } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProcessSection } from "@/components/sections/craft/ProcessSection";
import { buildStemPath, StemPath } from "@/components/sections/craft/StemPath";
import { UpClose } from "@/components/sections/craft/UpClose";

const craftMocks = vi.hoisted(() => ({
  reduceMotion: false,
  revert: vi.fn(),
}));

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => craftMocks.reduceMotion,
}));

vi.mock("@/lib/animations/gsap", () => ({
  gsap: {
    context: vi.fn((setup: () => void) => {
      setup();
      return { revert: craftMocks.revert };
    }),
    fromTo: vi.fn(() => ({ kill: vi.fn() })),
    matchMedia: vi.fn(() => ({
      add: vi.fn(),
      revert: craftMocks.revert,
    })),
    set: vi.fn(),
    to: vi.fn(() => ({ kill: vi.fn() })),
    timeline: vi.fn(() => ({
      fromTo: vi.fn().mockReturnThis(),
      to: vi.fn().mockReturnThis(),
    })),
  },
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

describe("Phase 4 craft story", () => {
  beforeEach(() => {
    craftMocks.reduceMotion = false;
    vi.clearAllMocks();
  });

  it("renders exact Up Close copy and three annotations", () => {
    const { container } = render(<UpClose />);

    expect(
      screen.getByRole("heading", { name: "Every fibre, shaped by hand." }),
    ).toBeVisible();
    expect(
      screen.getByText(
        "No moulds, no printing, no shortcuts. Each stem is twisted, bent and layered by hand until it holds its bloom — soft to the touch, and made to last for years.",
      ),
    ).toBeVisible();
    expect(
      container.querySelectorAll("[data-annotation-callout]"),
    ).toHaveLength(3);
    expect(container.querySelector("#craft-closeup")).toHaveAttribute(
      "data-theme",
      "dark",
    );
  });

  it("renders five process nodes and the custom-order CTA", () => {
    const { container } = render(<ProcessSection />);

    expect(container.querySelectorAll("[data-process-node]")).toHaveLength(5);
    expect(
      screen.getByRole("heading", { name: "From Stem to Story" }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Start your order" }),
    ).toHaveAttribute("href", expect.stringContaining("wa.me"));
  });

  it("builds a continuous cubic stem through each measured node", () => {
    expect(
      buildStemPath([
        { x: 10, y: 20 },
        { x: 30, y: 80 },
        { x: 15, y: 140 },
      ]),
    ).toBe("M 10 20 C 10 50, 30 50, 30 80 C 30 110, 15 110, 15 140");
    expect(buildStemPath([])).toBe("");
  });

  it("keeps the stem fully drawn for reduced motion", () => {
    craftMocks.reduceMotion = true;
    const { container } = render(<StemPath />);

    expect(container.querySelector("[data-stem-path]")).toHaveStyle({
      strokeDashoffset: "0",
    });
  });
});

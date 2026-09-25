import { render, screen } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InstagramStrip } from "@/components/sections/instagram/InstagramStrip";
import { VelocityMarquee } from "@/components/sections/instagram/VelocityMarquee";

const socialMocks = vi.hoisted(() => ({
  reduceMotion: false,
}));

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => socialMocks.reduceMotion,
}));

vi.mock("@/lib/animations/useFinePointer", () => ({
  useFinePointer: () => true,
}));

vi.mock("@/lib/animations/gsap", () => ({
  gsap: {
    quickTo: vi.fn(() => vi.fn()),
    timeline: vi.fn(() => ({
      kill: vi.fn(),
      pause: vi.fn(),
      play: vi.fn(),
      to: vi.fn().mockReturnThis(),
    })),
    to: vi.fn(() => ({ kill: vi.fn() })),
  },
  ScrollTrigger: {
    create: vi.fn(() => ({ getVelocity: () => 0, kill: vi.fn() })),
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

describe("Phase 4 social finale", () => {
  beforeEach(() => {
    socialMocks.reduceMotion = false;
    vi.clearAllMocks();
  });

  it("renders ten profile links and two accessible velocity rows", () => {
    render(
      <>
        <InstagramStrip />
        <VelocityMarquee />
      </>,
    );

    expect(
      screen.getAllByRole("link", { name: /View .* on Instagram/ }),
    ).toHaveLength(10);
    expect(
      screen.getByText(/Handcrafted, made to order and curated with love/),
    ).toHaveClass("sr-only");
  });
});

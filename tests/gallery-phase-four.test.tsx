import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ImgHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GallerySection } from "@/components/sections/gallery/GallerySection";

const galleryMocks = vi.hoisted(() => ({
  flipFrom: vi.fn(),
  getState: vi.fn(() => ({ targets: [] })),
  reduceMotion: false,
  refresh: vi.fn(),
  revert: vi.fn(),
}));

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => galleryMocks.reduceMotion,
}));

vi.mock("@/lib/animations/gsap", () => ({
  Flip: {
    from: galleryMocks.flipFrom,
    getState: galleryMocks.getState,
  },
  gsap: {
    context: vi.fn((setup: () => void) => {
      setup();
      return { revert: galleryMocks.revert };
    }),
    fromTo: vi.fn(() => ({ kill: vi.fn() })),
    matchMedia: vi.fn(() => ({
      add: vi.fn(),
      revert: galleryMocks.revert,
    })),
  },
  refreshScrollTrigger: galleryMocks.refresh,
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

describe("Phase 4 gallery", () => {
  beforeEach(() => {
    galleryMocks.reduceMotion = false;
    vi.clearAllMocks();
  });

  it("shows twelve pieces first, filters the complete inventory, then loads all", async () => {
    const user = userEvent.setup();
    const { container } = render(<GallerySection />);

    expect(container.querySelectorAll("[data-gallery-item]")).toHaveLength(12);
    expect(screen.getByText("Showing 18 pieces")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Hampers" }));
    expect(screen.getByText(/Showing \d+ pieces/)).toBeVisible();
    expect(
      container.querySelectorAll('[data-gallery-category="Hampers"]'),
    ).not.toHaveLength(0);
    expect(
      container.querySelector('[data-gallery-category="Bouquets"]'),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "All" }));
    await user.click(screen.getByRole("button", { name: "View more pieces" }));
    expect(container.querySelectorAll("[data-gallery-item]")).toHaveLength(18);
  });

  it("marks the active filter and animates committed layout changes", async () => {
    const user = userEvent.setup();
    render(<GallerySection />);

    const bouquets = screen.getByRole("button", { name: "Bouquets" });
    await user.click(bouquets);

    expect(bouquets).toHaveAttribute("aria-pressed", "true");
    expect(galleryMocks.getState).toHaveBeenCalled();
    expect(galleryMocks.flipFrom).toHaveBeenCalled();
    expect(galleryMocks.refresh).toHaveBeenCalled();
  });
});

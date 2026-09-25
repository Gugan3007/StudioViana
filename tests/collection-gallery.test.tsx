import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ImgHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HorizontalGallery } from "@/components/sections/collection/HorizontalGallery";
import { ProductPanel } from "@/components/sections/collection/ProductPanel";
import { catalogueProducts } from "@/lib/data/products";

const galleryMocks = vi.hoisted(() => ({
  reduceMotion: false,
  revert: vi.fn(),
  scrollTo: vi.fn(),
  triggerKill: vi.fn(),
  tweenKill: vi.fn(),
}));

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => galleryMocks.reduceMotion,
}));

vi.mock("@/lib/animations/useFinePointer", () => ({
  useFinePointer: () => true,
}));

vi.mock("@/lib/animations/useLenis", () => ({
  useLenis: () => ({ lenis: { scrollTo: galleryMocks.scrollTo } }),
}));

vi.mock("@/lib/animations/gsap", () => {
  const makeTween = () => ({
    kill: galleryMocks.tweenKill,
    scrollTrigger: {
      end: 1000,
      kill: galleryMocks.triggerKill,
      start: 100,
    },
  });
  return {
    gsap: {
      context: vi.fn((setup: () => void) => {
        setup();
        return { revert: galleryMocks.revert };
      }),
      fromTo: vi.fn(makeTween),
      matchMedia: vi.fn(() => ({
        add: vi.fn((_query: string, setup: () => void) => setup()),
        revert: galleryMocks.revert,
      })),
      quickTo: vi.fn(() => vi.fn()),
      set: vi.fn(),
      to: vi.fn(makeTween),
    },
    refreshScrollTrigger: vi.fn(),
  };
});

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

describe("collection gallery content", () => {
  beforeEach(() => {
    galleryMocks.reduceMotion = false;
    galleryMocks.scrollTo.mockClear();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
  });

  it("swaps the hero image when a variant is selected", async () => {
    const user = userEvent.setup();
    const medium = catalogueProducts[3];
    const { container } = render(
      <ProductPanel onOpenDetail={vi.fn()} product={medium} />,
    );

    expect(
      screen.getByRole("img", { name: medium.heroAlt }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Violet Edit" }));
    expect(
      Array.from(container.querySelectorAll("[data-panel-image]")).some(
        (image) =>
          /Violet Edit medium bouquet/.test(image.getAttribute("alt") ?? ""),
      ),
    ).toBe(true);
  });

  it("carries a selected flower into the order action", async () => {
    const user = userEvent.setup();
    const single = catalogueProducts[1];
    render(<ProductPanel onOpenDetail={vi.fn()} product={single} />);

    await user.click(screen.getByRole("button", { name: "Rose" }));
    const order = screen.getByRole("link", { name: /Order on WhatsApp/ });
    expect(decodeURIComponent(order.getAttribute("href") ?? "")).toContain(
      "Single Stem Floral (Rose) — ₹120",
    );
  });

  it("renders eight products, the corporate endpoint, progress, and keyboard navigation", () => {
    const onOpenDetail = vi.fn();
    const { container } = render(
      <HorizontalGallery onOpenDetail={onOpenDetail} />,
    );

    expect(container.querySelectorAll("[data-horizontal-panel]")).toHaveLength(
      9,
    );
    expect(container.querySelectorAll("[data-mobile-card]")).toHaveLength(9);
    expect(
      screen.getAllByText("Corporate & Bulk Orders").length,
    ).toBeGreaterThan(0);
    expect(screen.getByTestId("gallery-counter")).toHaveTextContent("01 / 08");

    const gallery = screen.getByRole("region", {
      name: "The Collection product gallery",
    });
    fireEvent.keyDown(gallery, { key: "ArrowRight" });
    expect(screen.getByTestId("gallery-counter")).toHaveTextContent("02 / 08");
    expect(galleryMocks.scrollTo).toHaveBeenCalled();
  });

  it("exposes a complete vertical fallback when motion is reduced", () => {
    galleryMocks.reduceMotion = true;
    const { container } = render(<HorizontalGallery onOpenDetail={vi.fn()} />);

    expect(
      container.querySelector("[data-gallery-mode='vertical']"),
    ).toBeVisible();
    expect(
      container.querySelector("[data-gallery-mode='horizontal']"),
    ).toHaveAttribute("aria-hidden", "true");
    const firstCard = container.querySelector("[data-mobile-card]")!;
    expect(
      within(firstCard as HTMLElement).getByText("Flower Cards"),
    ).toBeVisible();
  });
});

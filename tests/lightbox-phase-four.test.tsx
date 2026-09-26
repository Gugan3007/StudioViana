import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ImgHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GallerySection } from "@/components/sections/gallery/GallerySection";
import { OverlayProvider } from "@/lib/context/OverlayContext";

const lightboxMocks = vi.hoisted(() => ({
  reduceMotion: false,
  start: vi.fn(),
  stop: vi.fn(),
}));

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => lightboxMocks.reduceMotion,
}));

vi.mock("@/lib/animations/useLenis", () => ({
  useLenis: () => ({ lenis: lightboxMocks }),
}));

vi.mock("@/lib/animations/gsap", () => ({
  Flip: {
    from: vi.fn(() => ({ kill: vi.fn() })),
    getState: vi.fn(() => ({ targets: [] })),
  },
  gsap: {
    context: vi.fn((setup: () => void) => {
      setup();
      return { revert: vi.fn() };
    }),
    fromTo: vi.fn(() => ({ kill: vi.fn() })),
    matchMedia: vi.fn(() => ({ add: vi.fn(), revert: vi.fn() })),
  },
  refreshScrollTrigger: vi.fn(),
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

describe("Phase 4 gallery lightbox", () => {
  beforeEach(() => {
    lightboxMocks.start.mockClear();
    lightboxMocks.stop.mockClear();
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  });

  it("traps focus, navigates, closes and restores the trigger", async () => {
    const user = userEvent.setup();
    render(
      <OverlayProvider>
        <GallerySection />
      </OverlayProvider>,
    );
    const trigger = screen.getAllByRole("button", {
      name: /Open .* in gallery/,
    })[0];

    await user.click(trigger);
    const dialog = await screen.findByRole("dialog", {
      name: /gallery lightbox/i,
    });
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(
      within(dialog).getByRole("button", { name: "Close gallery lightbox" }),
    ).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(within(dialog).getByTestId("lightbox-counter")).toHaveTextContent(
      "02 / 12",
    );
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.documentElement.style.overflow).toBe("");
    expect(trigger).toHaveFocus();
  });

  it("closes before handing a linked piece to the product detail", async () => {
    const user = userEvent.setup();
    let dispatchedSlug = "";
    let dialogPresentAtDispatch = true;
    const onProduct = (event: Event) => {
      dialogPresentAtDispatch = Boolean(screen.queryByRole("dialog"));
      dispatchedSlug = (event as CustomEvent<{ slug: string }>).detail.slug;
    };
    window.addEventListener("studio-viana:open-product", onProduct);
    render(
      <OverlayProvider>
        <GallerySection />
      </OverlayProvider>,
    );

    await user.click(
      screen.getAllByRole("button", { name: /Open .* in gallery/ })[0],
    );
    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "View this piece" }),
    );

    await waitFor(() => expect(dispatchedSlug).toBe("flower-cards"));
    expect(dialogPresentAtDispatch).toBe(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    window.removeEventListener("studio-viana:open-product", onProduct);
  });
});

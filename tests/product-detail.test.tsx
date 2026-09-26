import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ImgHTMLAttributes } from "react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProductDetail } from "@/components/product/ProductDetail";
import { LensMagnifier } from "@/components/product/LensMagnifier";
import { catalogueProducts, type Product } from "@/lib/data/products";
import { resetBagStore, useBagStore } from "@/lib/store/bagStore";

const detailMocks = vi.hoisted(() => ({
  finePointer: false,
  moveX: vi.fn(),
  moveY: vi.fn(),
  refresh: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
}));

vi.mock("@/lib/animations/useLenis", () => ({
  useLenis: () => ({ lenis: detailMocks }),
}));

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => false,
}));

vi.mock("@/lib/animations/useFinePointer", () => ({
  useFinePointer: () => detailMocks.finePointer,
}));

vi.mock("@/lib/animations/gsap", () => ({
  gsap: {
    quickTo: vi
      .fn()
      .mockReturnValueOnce(detailMocks.moveX)
      .mockReturnValueOnce(detailMocks.moveY),
  },
  refreshScrollTrigger: detailMocks.refresh,
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

function DetailHarness({ initialProduct }: { initialProduct: Product }) {
  const [product, setProduct] = useState<Product | null>(null);
  return (
    <>
      <button onClick={() => setProduct(initialProduct)} type="button">
        Original trigger
      </button>
      {product ? (
        <ProductDetail
          onClose={() => setProduct(null)}
          onSelectProduct={setProduct}
          product={product}
        />
      ) : null}
    </>
  );
}

describe("ProductDetail", () => {
  beforeEach(() => {
    resetBagStore(false);
    detailMocks.finePointer = false;
    detailMocks.refresh.mockClear();
    detailMocks.start.mockClear();
    detailMocks.stop.mockClear();
    Object.defineProperty(window, "scrollTo", {
      configurable: true,
      value: vi.fn(),
    });
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  });

  it("traps focus, closes with Escape, restarts Lenis, and restores focus", async () => {
    const user = userEvent.setup();
    render(<DetailHarness initialProduct={catalogueProducts[3]} />);
    const trigger = screen.getByRole("button", { name: "Original trigger" });
    await user.click(trigger);

    const dialog = screen.getByRole("dialog", { name: /Medium Bouquets/ });
    expect(detailMocks.stop).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(
        within(dialog).getByRole("button", { name: "Close details" }),
      ).toHaveFocus(),
    );
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(detailMocks.start).toHaveBeenCalledOnce();
    expect(detailMocks.refresh).toHaveBeenCalledOnce();
    expect(trigger).toHaveFocus();
  });

  it("updates variant imagery and its WhatsApp order context", async () => {
    const user = userEvent.setup();
    render(<DetailHarness initialProduct={catalogueProducts[3]} />);
    await user.click(screen.getByRole("button", { name: "Original trigger" }));
    const dialog = screen.getByRole("dialog");

    await user.click(
      within(dialog).getByRole("button", { name: "Violet Edit" }),
    );
    expect(
      within(dialog).getAllByRole("img", { name: /Violet Edit medium bouquet/ })
        .length,
    ).toBeGreaterThan(0);
    expect(
      decodeURIComponent(
        within(dialog)
          .getByRole("link", { name: "Order on WhatsApp" })
          .getAttribute("href") ?? "",
      ),
    ).toContain("Medium Bouquet (Violet Edit) — ₹550");
  });

  it("configures flower, quantity, palette, occasion and message with a live total", async () => {
    const user = userEvent.setup();
    render(<DetailHarness initialProduct={catalogueProducts[1]} />);
    await user.click(screen.getByRole("button", { name: "Original trigger" }));
    const dialog = screen.getByRole("dialog");

    await user.click(within(dialog).getByRole("button", { name: "Rose" }));
    await user.click(
      within(dialog).getByRole("button", { name: "Increase quantity" }),
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Increase quantity" }),
    );
    await user.click(within(dialog).getByRole("radio", { name: "Ruby Red" }));
    await user.selectOptions(
      within(dialog).getByLabelText("Occasion"),
      "Congratulations",
    );
    await user.type(
      within(dialog).getByLabelText("Personal message"),
      "Proud of you.",
    );

    expect(within(dialog).getByTestId("configured-total")).toHaveTextContent(
      "₹360",
    );
    expect(within(dialog).getByText("13 / 120")).toBeVisible();
    const href = decodeURIComponent(
      within(dialog)
        .getByRole("link", { name: "Order on WhatsApp" })
        .getAttribute("href") ?? "",
    );
    expect(href).toContain("Single Stem Floral (Rose) — ₹360");
    expect(href).toContain("Quantity: 3");
    expect(href).toContain("Palette: Ruby Red");
    expect(href).toContain("Occasion: Congratulations");
    expect(href).toContain("Message: Proud of you.");
  });

  it("updates small-bouquet price, expands care, and switches related products", async () => {
    const user = userEvent.setup();
    render(<DetailHarness initialProduct={catalogueProducts[2]} />);
    await user.click(screen.getByRole("button", { name: "Original trigger" }));
    const dialog = screen.getByRole("dialog");

    await user.click(within(dialog).getByRole("radio", { name: "2 blooms" }));
    expect(within(dialog).getByTestId("configured-total")).toHaveTextContent(
      "₹250",
    );
    await user.click(
      within(dialog).getByRole("button", {
        name: "Care — how to keep your blooms beautiful",
      }),
    );
    await waitFor(() =>
      expect(within(dialog).getByText(/Dust gently/)).toBeVisible(),
    );

    await user.click(
      within(dialog).getAllByRole("button", { name: /View .* details/ })[0],
    );
    expect(screen.getByRole("dialog")).toHaveAccessibleName(
      /Single Stem Florals/,
    );
  });

  it("locks native scrolling for the complete detail lifetime", async () => {
    const user = userEvent.setup();
    render(<DetailHarness initialProduct={catalogueProducts[2]} />);
    await user.click(screen.getByRole("button", { name: "Original trigger" }));

    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.body.style.overflow).toBe("hidden");
    await user.keyboard("{Escape}");
    expect(document.documentElement.style.overflow).toBe("");
    expect(document.body.style.overflow).toBe("");
  });

  it("gives the visually represented radio choices visible keyboard focus styles", async () => {
    const user = userEvent.setup();
    render(<DetailHarness initialProduct={catalogueProducts[2]} />);
    await user.click(screen.getByRole("button", { name: "Original trigger" }));
    const dialog = screen.getByRole("dialog");

    const size = within(dialog).getByRole("radio", { name: "1 bloom" });
    const palette = within(dialog).getByRole("radio", { name: "Blush Pink" });
    expect(size.nextElementSibling).toHaveClass("peer-focus-visible:ring-2");
    expect(palette.nextElementSibling).toHaveClass("peer-focus-visible:ring-2");
  });

  it("adds a configured product to the persistent order bag", async () => {
    const user = userEvent.setup();
    render(<DetailHarness initialProduct={catalogueProducts[3]} />);
    await user.click(screen.getByRole("button", { name: "Original trigger" }));
    const dialog = screen.getByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Violet Edit" }),
    );
    await user.click(within(dialog).getByRole("radio", { name: "Lilac" }));
    await user.click(
      within(dialog).getByRole("button", { name: "Add to order" }),
    );
    expect(useBagStore.getState().items[0]).toMatchObject({
      palette: "Lilac",
      productSlug: "medium-bouquets",
      quantity: 1,
      unitPrice: 550,
      variant: "Violet Edit",
    });
  });

  it("sizes the pointer lens from the rendered image so it truly magnifies", () => {
    detailMocks.finePointer = true;
    const image = catalogueProducts[3].heroImage;
    const { container } = render(
      <LensMagnifier image={image}>
        <span>Test bloom</span>
      </LensMagnifier>,
    );
    const surface = container.firstElementChild as HTMLDivElement;
    Object.defineProperty(surface, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        bottom: 750,
        height: 750,
        left: 0,
        right: 600,
        top: 0,
        width: 600,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });

    fireEvent.pointerMove(surface, { clientX: 300, clientY: 375 });
    const lens = container.querySelector<HTMLElement>("[data-lens]")!;
    expect(lens.style.backgroundSize).toMatch(
      /^\d+(?:\.\d+)?px \d+(?:\.\d+)?px$/,
    );
    expect(Number.parseFloat(lens.style.backgroundSize)).toBeGreaterThan(600);
  });
});

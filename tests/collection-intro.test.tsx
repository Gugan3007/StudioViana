import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ImgHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CollectionIndex } from "@/components/sections/collection/CollectionIndex";
import { CollectionIntro } from "@/components/sections/collection/CollectionIntro";
import { catalogueProducts } from "@/lib/data/products";
import { getCursorState, setCursorState } from "@/lib/store/cursorStore";

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => false,
}));

vi.mock("@/lib/animations/useFinePointer", () => ({
  useFinePointer: () => true,
}));

vi.mock("@/lib/animations/gsap", () => ({
  gsap: {
    context: vi.fn((setup: () => void) => {
      setup();
      return { revert: vi.fn() };
    }),
    fromTo: vi.fn(),
    quickTo: vi.fn(() => vi.fn()),
  },
}));

/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
vi.mock("next/image", () => ({
  default: function MockImage({
    fill,
    placeholder,
    src,
    ...props
  }: Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
    fill?: boolean;
    placeholder?: string;
    src: { src?: string } | string;
  }) {
    return (
      <img
        {...props}
        data-fill={fill || undefined}
        data-placeholder={placeholder}
        src={typeof src === "string" ? src : src.src}
      />
    );
  },
}));
/* eslint-enable @next/next/no-img-element, jsx-a11y/alt-text */

describe("Collection introduction", () => {
  beforeEach(() => setCursorState("default"));

  it("renders the approved editorial copy and a character-split heading", () => {
    const { container } = render(<CollectionIntro />);

    expect(
      screen.getByRole("heading", { level: 2, name: "The Collection" }),
    ).toBeVisible();
    expect(
      screen.getByText(
        "Eight handcrafted forms, from a single keepsake stem to our grandest dome bouquet. Every piece is made to order and can be re-imagined in your palette.",
      ),
    ).toBeVisible();
    expect(screen.getByText(/08 Pieces/)).toHaveTextContent(
      "08 Pieces · From ₹120",
    );
    expect(container.querySelectorAll("[data-split-token]")).toHaveLength(13);
  });

  it("renders eight selectable rows with prices and mobile thumbnails", () => {
    const { container } = render(
      <CollectionIndex onSelectProduct={vi.fn()} />,
    );

    expect(
      screen.getAllByRole("button", { name: /View in collection$/ }),
    ).toHaveLength(8);
    expect(
      screen
        .getAllByText("₹120 per stem")
        .some((element) => element.getAttribute("aria-hidden") === "true"),
    ).toBe(true);
    expect(
      screen
        .getAllByText("₹150 – ₹250")
        .some((element) => element.getAttribute("aria-hidden") === "true"),
    ).toBe(true);
    expect(container.querySelectorAll("img")).toHaveLength(8);
    for (const product of catalogueProducts) {
      const row = screen.getByRole("button", {
        name: `${product.number} ${product.name} ${product.priceLabel} → View in collection`,
      });
      expect(within(row).getByText(product.number)).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      expect(screen.getByText(product.name)).toBeVisible();
      expect(
        within(row)
          .getAllByText(product.priceLabel)
          .some((element) => element.getAttribute("aria-hidden") === "true"),
      ).toBe(true);
    }
  });

  it("selects by slug and publishes view cursor state", async () => {
    const user = userEvent.setup();
    const onSelectProduct = vi.fn();
    render(<CollectionIndex onSelectProduct={onSelectProduct} />);
    const medium = screen.getByRole("button", {
      name: /04 Medium Bouquets ₹550 → View in collection/,
    });

    fireEvent.pointerEnter(medium);
    expect(getCursorState()).toBe("view");
    await user.click(medium);
    expect(onSelectProduct).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "medium-bouquets" }),
      medium,
    );
    fireEvent.pointerLeave(medium);
    expect(getCursorState()).toBe("default");
  });
});

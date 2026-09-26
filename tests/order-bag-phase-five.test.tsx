import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ImgHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrderBagButton } from "@/components/layout/OrderBagButton";
import { OrderBagDrawer } from "@/components/layout/OrderBagDrawer";
import { OverlayProvider } from "@/lib/context/OverlayContext";
import { resetBagStore, useBagStore } from "@/lib/store/bagStore";
import { resetOrderStore, useOrderStore } from "@/lib/store/orderStore";

const bagMocks = vi.hoisted(() => ({ start: vi.fn(), stop: vi.fn() }));
vi.mock("@/lib/animations/useLenis", () => ({
  useLenis: () => ({ lenis: bagMocks }),
}));
vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => true,
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
    void fill;
    void placeholder;
    return <img {...props} src={typeof src === "string" ? src : src.src} />;
  },
}));
/* eslint-enable @next/next/no-img-element, jsx-a11y/alt-text */

function BagHarness() {
  return (
    <OverlayProvider>
      <OrderBagButton />
      <OrderBagDrawer />
      <section id="order" />
    </OverlayProvider>
  );
}

describe("Phase 5 order bag", () => {
  beforeEach(() => {
    localStorage.clear();
    resetBagStore(false);
    resetOrderStore(false);
    bagMocks.start.mockClear();
    bagMocks.stop.mockClear();
  });

  it("shows the count, edits quantities, removes items and formats combined WhatsApp", async () => {
    const user = userEvent.setup();
    useBagStore.getState().addItem({
      productSlug: "flower-cards",
      quantity: 2,
      unitPrice: 150,
    });
    useBagStore.getState().addItem({
      productSlug: "medium-bouquets",
      quantity: 1,
      unitPrice: 550,
      variant: "Violet Edit",
    });
    render(<BagHarness />);

    expect(
      screen.getByRole("button", { name: "Open order bag, 3 items" }),
    ).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Open order bag, 3 items" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Your order bag" });
    expect(dialog).toBeVisible();
    expect(bagMocks.stop).toHaveBeenCalled();
    expect(within(dialog).getByText("₹850")).toBeVisible();
    expect(
      decodeURIComponent(
        within(dialog)
          .getByRole("link", { name: "Send order on WhatsApp" })
          .getAttribute("href") ?? "",
      ),
    ).toContain("2 × Flower Card");

    await user.click(
      within(dialog).getByRole("button", {
        name: "Increase Flower Cards quantity",
      }),
    );
    expect(within(dialog).getByText("₹1,000")).toBeVisible();
    await user.click(
      within(dialog).getByRole("button", { name: "Remove Medium Bouquets" }),
    );
    expect(
      within(dialog).queryByText("Medium Bouquets"),
    ).not.toBeInTheDocument();
  });

  it("hands bag items into builder details and closes the drawer", async () => {
    const user = userEvent.setup();
    useBagStore.getState().addItem({
      productSlug: "flower-cards",
      quantity: 20,
      unitPrice: 150,
    });
    const scrollIntoView = vi.fn();
    render(<BagHarness />);
    document.getElementById("order")!.scrollIntoView = scrollIntoView;
    await user.click(
      screen.getByRole("button", { name: "Open order bag, 20 items" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Continue to custom details" }),
    );
    expect(useOrderStore.getState()).toMatchObject({
      bagItems: [expect.objectContaining({ productSlug: "flower-cards" })],
      step: 4,
    });
    expect(
      screen.queryByRole("dialog", { name: "Your order bag" }),
    ).not.toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalled();
  });
});

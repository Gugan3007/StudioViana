import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ImgHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrderBuilder } from "@/components/sections/order/OrderBuilder";
import { phaseFiveConfig } from "@/lib/data/site";
import { resetOrderStore, useOrderStore } from "@/lib/store/orderStore";

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => true,
}));
vi.mock("@/lib/animations/useLenis", () => ({
  useLenis: () => ({ lenis: null }),
}));
vi.mock("@/lib/animations/gsap", () => ({ refreshScrollTrigger: vi.fn() }));

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

const minimumDate = () => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + phaseFiveConfig.leadTimeDays);
  return date.toISOString().slice(0, 10);
};

describe("Phase 5 order builder", () => {
  beforeEach(() => {
    localStorage.clear();
    resetOrderStore(false);
  });

  it("completes all five steps, edits a group and builds both outbound links", async () => {
    const user = userEvent.setup();
    render(<OrderBuilder />);

    await user.click(screen.getByRole("button", { name: /Medium Bouquets/ }));
    await user.click(
      screen.getByRole("button", { name: "Continue to Flowers" }),
    );
    expect(
      screen.getByRole("heading", { name: "Choose your flowers" }),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Lily" }));
    await user.click(screen.getByRole("button", { name: "Tulip" }));
    await user.click(screen.getByRole("button", { name: "Violet Edit" }));
    await user.click(
      screen.getByRole("button", { name: "Continue to Palette" }),
    );

    await user.click(screen.getByRole("button", { name: "Lilac" }));
    await user.click(screen.getByRole("button", { name: "Ivory White" }));
    await user.click(screen.getByRole("radio", { name: "Sheer white" }));
    await user.click(
      screen.getByRole("button", { name: "Continue to Details" }),
    );

    await user.click(screen.getByRole("button", { name: "Anniversary" }));
    await user.type(
      screen.getByLabelText("Message card text"),
      "Always, in every season.",
    );
    fireEvent.change(screen.getByLabelText("Needed by date"), {
      target: { value: minimumDate() },
    });
    await user.click(screen.getByRole("radio", { name: "Delivery" }));
    await user.type(screen.getByLabelText("City or area"), "Kochi");
    await user.type(screen.getByLabelText("Your name"), "Ananya Rao");
    await user.type(screen.getByLabelText("Phone number"), "9876543210");
    await user.type(
      screen.getByLabelText("Email address (optional)"),
      "ananya@example.com",
    );
    await user.click(screen.getByRole("button", { name: "Review your order" }));

    expect(
      screen.getByRole("heading", { name: "Review your order" }),
    ).toBeVisible();
    expect(screen.getAllByText("₹550").length).toBeGreaterThan(0);
    const whatsapp = screen.getByRole("link", {
      name: "Send order on WhatsApp",
    });
    const decodedWhatsApp = decodeURIComponent(
      whatsapp.getAttribute("href") ?? "",
    );
    expect(decodedWhatsApp).toContain("Medium Bouquet (Violet Edit)");
    expect(decodedWhatsApp).toContain("Palette: Lilac, Ivory White");
    expect(
      screen.getByRole("link", { name: "Send by email instead" }),
    ).toHaveAttribute(
      "href",
      expect.stringContaining("mailto:studioviana30@gmail.com"),
    );

    await user.click(screen.getByRole("button", { name: "Edit palette" }));
    expect(
      screen.getByRole("heading", { name: "Choose a palette" }),
    ).toBeVisible();
  });

  it("prefills a product at step two and exposes quantity and size controls", async () => {
    render(<OrderBuilder />);
    window.dispatchEvent(
      new CustomEvent("studio-viana:open-order-builder", {
        detail: {
          configuration: { flower: "Rose", quantity: 3 },
          productSlug: "single-stem-florals",
        },
      }),
    );
    expect(
      await screen.findByRole("heading", { name: "Choose your flowers" }),
    ).toBeVisible();
    expect(screen.getByText("3", { selector: "output" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Rose" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    useOrderStore.getState().update({
      pieceSlug: "small-bouquets",
      quantity: 1,
      size: "2 blooms",
    });
    expect(
      await screen.findByRole("radio", { name: "2 blooms" }),
    ).toBeChecked();
    expect(screen.getAllByText("₹250").length).toBeGreaterThan(0);
  });

  it("limits palettes to three, reveals custom input and provides a mobile summary dialog", async () => {
    const user = userEvent.setup();
    useOrderStore.setState({
      ...useOrderStore.getState(),
      pieceSlug: "medium-bouquets",
      step: 3,
    });
    render(<OrderBuilder />);

    for (const palette of ["Lilac", "Ivory White", "Blush Pink", "Peach"]) {
      await user.click(screen.getByRole("button", { name: palette }));
    }
    expect(useOrderStore.getState().palettes).toEqual([
      "Lilac",
      "Ivory White",
      "Blush Pink",
    ]);
    await user.click(screen.getByRole("button", { name: "Blush Pink" }));
    await user.click(screen.getByRole("button", { name: "Custom" }));
    expect(screen.getByLabelText("Describe your colours")).toBeVisible();

    await user.click(screen.getByRole("button", { name: /View summary/ }));
    const dialog = screen.getByRole("dialog", { name: "Order summary" });
    expect(dialog).toBeVisible();
    await user.click(
      within(dialog).getByRole("button", { name: "Close summary" }),
    );
    expect(
      screen.queryByRole("dialog", { name: "Order summary" }),
    ).not.toBeInTheDocument();
  });

  it("shows the floral success state and can start another order", async () => {
    const user = userEvent.setup();
    useOrderStore.setState({
      ...useOrderStore.getState(),
      customerName: "Ananya",
      deliveryMethod: "pickup",
      flowers: ["Lily"],
      neededBy: minimumDate(),
      occasion: "Birthday",
      palettes: ["Lilac"],
      phone: "9876543210",
      pieceSlug: "medium-bouquets",
      step: 5,
      wrapStyle: "Classic cream",
    });
    render(<OrderBuilder />);

    fireEvent.click(
      screen.getByRole("link", { name: "Send order on WhatsApp" }),
    );
    expect(screen.getByRole("heading", { name: "Thank you!" })).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Start another order" }),
    );
    expect(
      screen.getByRole("heading", { name: "Choose your piece" }),
    ).toBeVisible();
  });
});

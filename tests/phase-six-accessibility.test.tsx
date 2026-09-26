import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Footer } from "@/components/layout/Footer";
import { ProductOptions } from "@/components/product/ProductOptions";
import { GalleryFilters } from "@/components/sections/gallery/GalleryFilters";
import { StepDetails } from "@/components/sections/order/StepDetails";
import { MotionProvider } from "@/lib/context/MotionContext";
import { catalogueProducts } from "@/lib/data/products";
import { resetOrderStore } from "@/lib/store/orderStore";

vi.mock("@/lib/animations/useLenis", () => ({
  useLenis: () => ({ lenis: null }),
}));

describe("Phase 6 accessibility audit", () => {
  beforeEach(() => {
    localStorage.clear();
    resetOrderStore(false);
  });

  it("exposes the visitor motion control and newsletter autocomplete", () => {
    render(
      <MotionProvider>
        <Footer />
      </MotionProvider>,
    );
    expect(
      screen.getByRole("button", { name: "Reduce motion: off" }),
    ).toBeVisible();
    expect(screen.getByLabelText("Email for Stay in bloom")).toHaveAttribute(
      "autocomplete",
      "email",
    );
  });

  it("keeps compact gallery and product controls at least 44px high", () => {
    const { rerender } = render(
      <GalleryFilters activeFilter="All" count={18} onChange={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: "All" })).toHaveClass("min-h-11");

    const singleStem = catalogueProducts[1];
    rerender(
      <ProductOptions
        configuration={{
          flower: singleStem.flowers[0],
          quantity: 1,
        }}
        onChange={vi.fn()}
        product={singleStem}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Decrease quantity" }),
    ).toHaveClass("h-11", "w-11");
    expect(
      screen.getByRole("button", { name: "Increase quantity" }),
    ).toHaveClass("h-11", "w-11");
  });

  it("announces field errors and publishes autocomplete semantics", () => {
    render(
      <StepDetails
        errors={{ customerName: "Please tell us the name we should use." }}
      />,
    );
    const name = screen.getByRole("textbox", { name: "Your name" });
    expect(name).toHaveAttribute("autocomplete", "name");
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please tell us the name we should use.",
    );
    expect(
      screen.getByRole("textbox", { name: "Phone number" }),
    ).toHaveAttribute("autocomplete", "tel");
    expect(
      screen.getByRole("textbox", { name: "Email address (optional)" }),
    ).toHaveAttribute("autocomplete", "email");
  });
});

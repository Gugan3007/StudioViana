import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";

import { PricingSection } from "@/components/sections/pricing/PricingSection";
import { catalogueProducts } from "@/lib/data/products";
import { phaseFiveConfig } from "@/lib/data/site";

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => true,
}));

vi.mock("@/lib/animations/gsap", () => ({
  gsap: {
    context: vi.fn((setup: () => void) => {
      setup();
      return { revert: vi.fn() };
    }),
    fromTo: vi.fn(),
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

describe("Phase 5 pricing guide", () => {
  it("renders all nine editorial rows with real final prices", () => {
    const { container } = render(<PricingSection />);
    const rows = container.querySelectorAll("[data-pricing-row]");

    expect(rows).toHaveLength(9);
    expect(
      screen.getByRole("heading", { name: "Pricing Guide" }),
    ).toBeVisible();
    expect(screen.getByText("₹120", { selector: "span" })).toBeVisible();
    expect(screen.getByText("₹150 – ₹250", { selector: "span" })).toBeVisible();
    expect(screen.getByText("On request", { selector: "span" })).toBeVisible();
    expect(
      screen.getByText("Corporate & Bulk Orders", { selector: "h3" }),
    ).toBeVisible();
  });

  it("opens product details from a product row and scrolls corporate rows", () => {
    const productListener = vi.fn();
    window.addEventListener("studio-viana:open-product", productListener);
    const scrollIntoView = vi.fn();
    const corporate = document.createElement("section");
    corporate.id = "corporate";
    corporate.scrollIntoView = scrollIntoView;
    document.body.append(corporate);

    render(<PricingSection />);
    fireEvent.click(
      screen.getByRole("button", { name: "View Medium Bouquets details" }),
    );
    expect(productListener).toHaveBeenCalledOnce();
    expect((productListener.mock.calls[0][0] as CustomEvent).detail.slug).toBe(
      "medium-bouquets",
    );

    fireEvent.click(
      screen.getByRole("button", { name: "View corporate and bulk orders" }),
    );
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });

    window.removeEventListener("studio-viana:open-product", productListener);
    corporate.remove();
  });

  it("includes mobile order actions, the customisation note and editable details", () => {
    render(<PricingSection />);
    const smallRow = screen
      .getByRole("heading", { name: "Small Bouquets" })
      .closest("[data-pricing-row]") as HTMLElement;
    expect(
      within(smallRow).getByRole("link", { name: "Order Small Bouquets" }),
    ).toHaveAttribute("href");
    expect(screen.getByText(/A note on customisation/)).toBeVisible();
    expect(screen.getByText(phaseFiveConfig.leadTimeLabel)).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Download Catalogue/ }),
    ).toHaveAttribute("href", phaseFiveConfig.cataloguePath);
    expect(catalogueProducts).toHaveLength(8);
  });
});

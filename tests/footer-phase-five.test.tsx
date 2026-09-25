import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BackToTop } from "@/components/layout/BackToTop";
import { Footer } from "@/components/layout/Footer";
import { catalogueProducts } from "@/lib/data/products";
import { phaseFiveConfig, site } from "@/lib/data/site";

const footerMocks = vi.hoisted(() => ({
  lenis: null as null | { scrollTo: ReturnType<typeof vi.fn> },
}));

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => true,
}));
vi.mock("@/lib/animations/useLenis", () => ({
  useLenis: () => ({ lenis: footerMocks.lenis }),
}));

describe("Phase 5 footer", () => {
  it("renders the closing wordmark, grouped links, thank-you and newsletter mailto", async () => {
    const user = userEvent.setup();
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer") as HTMLElement;
    expect(footer).toHaveAttribute("data-theme", "dark");
    expect(within(footer).getAllByText("STUDIO VIANA").length).toBeGreaterThan(0);
    expect(within(footer).getAllByText("Collection").length).toBeGreaterThan(0);
    expect(within(footer).getAllByText("Studio").length).toBeGreaterThan(0);
    expect(within(footer).getAllByText("Order").length).toBeGreaterThan(0);
    expect(within(footer).getAllByText("Connect").length).toBeGreaterThan(0);
    expect(screen.getByText("Thank you for visiting")).toBeVisible();
    expect(screen.getByText(/© 2026 Studio Viana/)).toBeVisible();
    expect(
      within(footer).getAllByRole("link", { name: "Download Catalogue" })[0],
    ).toHaveAttribute("href", phaseFiveConfig.cataloguePath);

    await user.type(screen.getByLabelText("Email for Stay in bloom"), "hello@example.com");
    expect(screen.getByRole("link", { name: "Join Stay in bloom" })).toHaveAttribute(
      "href",
      expect.stringContaining("subject=Stay%20in%20bloom"),
    );
  });

  it("dispatches product links and exposes mobile accordion groups", async () => {
    const user = userEvent.setup();
    const listener = vi.fn();
    window.addEventListener("studio-viana:open-product", listener);
    render(<Footer />);
    const productLinks = screen.getAllByRole("button", {
      name: `View ${catalogueProducts[0].name}`,
    });
    await user.click(productLinks[0]);
    expect((listener.mock.calls[0][0] as CustomEvent).detail.slug).toBe(
      catalogueProducts[0].slug,
    );
    expect(screen.getAllByText(site.instagramHandle).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("group").length).toBeGreaterThanOrEqual(4);
    window.removeEventListener("studio-viana:open-product", listener);
  });
});

describe("Phase 5 back to top", () => {
  it("uses Lenis when available and native scrolling otherwise", async () => {
    const user = userEvent.setup();
    const nativeScroll = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const lenisScroll = vi.fn();
    footerMocks.lenis = { scrollTo: lenisScroll };
    const { rerender } = render(<BackToTop />);
    await user.click(screen.getByRole("button", { name: "Back to top" }));
    expect(lenisScroll).toHaveBeenCalledWith(0, { duration: 2 });

    footerMocks.lenis = null;
    rerender(<BackToTop />);
    fireEvent.click(screen.getByRole("button", { name: "Back to top" }));
    expect(nativeScroll).toHaveBeenCalledWith({ behavior: "smooth", top: 0 });
    nativeScroll.mockRestore();
  });
});

import { describe, expect, it, vi } from "vitest";

import { catalogueProducts } from "@/lib/data/products";
import {
  openProductDetail,
  openProductOrder,
  productOrderHref,
} from "@/lib/utils/orderEntry";

describe("Phase 5 order entry routing", () => {
  const product = catalogueProducts[3];

  it("prefills and reveals the builder in builder mode", () => {
    const listener = vi.fn();
    const order = document.createElement("section");
    order.id = "order";
    order.scrollIntoView = vi.fn();
    document.body.append(order);
    window.addEventListener("studio-viana:open-order-builder", listener);

    expect(
      openProductOrder(
        product,
        { palette: "Lilac", variant: "Violet Edit" },
        "builder",
      ),
    ).toBe("#order");
    expect(listener).toHaveBeenCalledOnce();
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toMatchObject({
      configuration: { palette: "Lilac", variant: "Violet Edit" },
      productSlug: "medium-bouquets",
    });
    expect(order.scrollIntoView).toHaveBeenCalled();

    window.removeEventListener("studio-viana:open-order-builder", listener);
    order.remove();
  });

  it("opens a fully encoded WhatsApp URL in direct mode", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const href = openProductOrder(
      product,
      { variant: "Violet Edit" },
      "whatsapp-direct",
    );
    expect(href).toContain("https://wa.me/919488713438?text=");
    expect(decodeURIComponent(href)).toContain(
      "Medium Bouquet (Violet Edit) — ₹550",
    );
    expect(open).toHaveBeenCalledWith(href, "_blank", "noopener,noreferrer");
    expect(productOrderHref(product, {}, "builder")).toBe("#order");
    open.mockRestore();
  });

  it("dispatches the shared product detail contract", () => {
    const listener = vi.fn();
    window.addEventListener("studio-viana:open-product", listener);
    const trigger = document.createElement("button");
    openProductDetail(product.slug, trigger);
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({
      returnFocus: trigger,
      slug: product.slug,
    });
    window.removeEventListener("studio-viana:open-product", listener);
  });
});

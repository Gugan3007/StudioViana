import type { Product } from "@/lib/data/products";
import { ORDER_MODE, type OrderMode } from "@/lib/data/site";
import { whatsappLink } from "@/lib/utils";
import {
  type OrderConfiguration,
  orderMessage,
} from "@/lib/utils/whatsapp";

export interface OrderBuilderEventDetail {
  configuration?: OrderConfiguration;
  productSlug: string;
}

export function productOrderHref(
  product: Product,
  configuration: OrderConfiguration = {},
  mode: OrderMode = ORDER_MODE,
) {
  return mode === "builder"
    ? "#order"
    : whatsappLink(orderMessage(product, configuration));
}

/**
 * One routing seam for every order CTA. Builder mode broadcasts serializable
 * prefill data; direct mode preserves the existing WhatsApp quick-order path.
 */
export function openProductOrder(
  product: Product,
  configuration: OrderConfiguration = {},
  mode: OrderMode = ORDER_MODE,
) {
  const href = productOrderHref(product, configuration, mode);
  if (typeof window === "undefined") return href;

  if (mode === "whatsapp-direct") {
    window.open(href, "_blank", "noopener,noreferrer");
    return href;
  }

  window.dispatchEvent(
    new CustomEvent<OrderBuilderEventDetail>("studio-viana:open-order-builder", {
      detail: { configuration, productSlug: product.slug },
    }),
  );
  document.querySelector("#order")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
  return href;
}

export function openProductDetail(slug: string, returnFocus?: HTMLElement) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("studio-viana:open-product", {
      detail: { returnFocus, slug },
    }),
  );
}

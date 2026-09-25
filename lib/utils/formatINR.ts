import { catalogueProducts } from "@/lib/data/products";

export interface EstimableOrder {
  readonly bagItems?: readonly {
    readonly quantity: number;
    readonly unitPrice: number;
  }[];
  readonly pieceSlug?: string;
  readonly quantity?: number;
  readonly size?: "1 bloom" | "2 blooms";
}

const formatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

export const formatINRValue = (value: number) => formatter.format(value);

export const formatINR = (value: number) => `₹${formatINRValue(value)}`;

/**
 * Keeps the estimate independent from UI state. Quantity pricing applies to
 * stems and cards; small bouquets use their explicit one/two-bloom prices.
 * A bag hand-off is already itemised, so its stored unit prices take priority.
 */
export function estimateOrder(order: EstimableOrder) {
  if (order.bagItems?.length) {
    return order.bagItems.reduce(
      (total, item) => total + item.unitPrice * item.quantity,
      0,
    );
  }

  if (!order.pieceSlug || order.pieceSlug === "something-custom") return 0;
  const product = catalogueProducts.find(
    (candidate) => candidate.slug === order.pieceSlug,
  );
  if (!product) return 0;
  if (product.slug === "small-bouquets") {
    return order.size === "2 blooms" ? 250 : 150;
  }
  if (
    product.slug === "single-stem-florals" ||
    product.slug === "flower-cards"
  ) {
    return product.priceFrom * Math.max(1, order.quantity ?? 1);
  }
  return product.priceFrom;
}

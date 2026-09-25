import type { Product } from "@/lib/data/products";

export type PaletteName =
  "Blush Pink" | "Lilac" | "Ruby Red" | "Ivory" | "Sunshine Yellow" | "Custom";

export interface OrderConfiguration {
  readonly flower?: string;
  readonly occasion?: string;
  readonly palette?: PaletteName | string;
  readonly personalMessage?: string;
  readonly quantity?: number;
  readonly size?: "1 bloom" | "2 blooms";
  readonly variant?: string;
}

export const smallBouquetPrices = {
  "1 bloom": 150,
  "2 blooms": 250,
} as const;

const formatPrice = (value: number) =>
  `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;

const orderName = (name: string) =>
  name
    .replace(/Bouquets$/, "Bouquet")
    .replace(/Florals$/, "Floral")
    .replace(/Cards$/, "Card");

const sentence = (label: string, value: string) =>
  `${label}: ${value}${/[.!?]$/.test(value) ? "" : "."}`;

export function orderTotal(
  product: Product,
  configuration: OrderConfiguration = {},
) {
  if (product.slug === "single-stem-florals") {
    return product.priceFrom * Math.max(1, configuration.quantity ?? 1);
  }
  if (product.slug === "small-bouquets" && configuration.size) {
    return smallBouquetPrices[configuration.size];
  }
  return product.priceFrom;
}

export function orderMessage(
  product: Product,
  variantOrConfiguration: string | OrderConfiguration = {},
) {
  const configuration: OrderConfiguration =
    typeof variantOrConfiguration === "string"
      ? { variant: variantOrConfiguration }
      : variantOrConfiguration;
  const descriptor =
    configuration.variant ?? configuration.flower ?? configuration.size;
  const total = orderTotal(product, configuration);
  const options = [
    configuration.quantity && configuration.quantity > 1
      ? `Quantity: ${configuration.quantity}.`
      : null,
    configuration.size ? `Size: ${configuration.size}.` : null,
    configuration.palette ? `Palette: ${configuration.palette}.` : null,
    configuration.occasion ? `Occasion: ${configuration.occasion}.` : null,
    configuration.personalMessage?.trim()
      ? sentence("Message", configuration.personalMessage.trim().slice(0, 120))
      : null,
  ].filter((value): value is string => Boolean(value));
  const optionCopy = options.length ? ` ${options.join(" ")}` : "";

  return `Hi Studio Viana! 🌸 I'd love to order the ${orderName(product.name)}${descriptor ? ` (${descriptor})` : ""} — ${formatPrice(total)}.${optionCopy} Could you share availability and customisation options?`;
}

export function enquiryMessage(product: Product) {
  return `Hi Studio Viana! 🌸 I have a question about the ${product.name}. Could you help me with the details and customisation options?`;
}

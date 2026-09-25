import type { Product } from "@/lib/data/products";
import { getProductBySlug } from "@/lib/data/products";
import { site } from "@/lib/data/site";
import type { BagItem } from "@/lib/store/bagStore";
import type { OrderState } from "@/lib/store/orderStore";
import type { BulkEnquiry } from "@/lib/validation/orderSchema";
import { estimateOrder, formatINR } from "@/lib/utils/formatINR";

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

const shortOrderName = (name: string) => orderName(name).replace(/^The /, "");

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));

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

/** Builds the exact human-readable concierge message before URL encoding. */
export function buildOrderMessage(order: Partial<OrderState>) {
  const product = getProductBySlug(order.pieceSlug);
  const piece = product
    ? shortOrderName(product.name)
    : order.pieceSlug === "something-custom"
      ? "Something custom"
      : "Custom selection";
  const variant = order.variant ? ` (${order.variant})` : "";
  const delivery =
    order.deliveryMethod === "pickup"
      ? "Pick up"
      : order.deliveryArea || "Delivery";
  const lines = [
    "Hi Studio Viana! 🌸 I'd like to place an order:",
    `• Piece: ${piece}${variant}`,
    order.flowers?.length ? `• Flowers: ${order.flowers.join(", ")}` : null,
    order.palettes?.length
      ? `• Palette: ${order.palettes.join(", ")}${order.customPalette ? ` (${order.customPalette})` : ""}${order.wrapStyle ? ` | Wrap: ${order.wrapStyle}` : ""}`
      : order.wrapStyle
        ? `• Wrap: ${order.wrapStyle}`
        : null,
    order.occasion ? `• Occasion: ${order.occasion}` : null,
    order.messageCard?.trim()
      ? `• Message card: "${order.messageCard.trim()}"`
      : null,
    order.neededBy
      ? `• Needed by: ${formatDate(order.neededBy)} | Delivery: ${delivery}`
      : null,
    `• Estimated total: ${formatINR(estimateOrder(order))}`,
    order.customerName || order.phone
      ? `Name: ${order.customerName ?? "—"} | Phone: ${order.phone ?? "—"}`
      : null,
    order.email?.trim() ? `Email: ${order.email.trim()}` : null,
    order.notes?.trim() ? `Notes: ${order.notes.trim()}` : null,
  ];
  return lines.filter((line): line is string => Boolean(line)).join("\n");
}

export function buildBulkMessage(enquiry: BulkEnquiry) {
  return [
    "Hi Studio Viana! 🌸 I'd like a tailored quote:",
    `• Event: ${enquiry.eventType}`,
    `• Quantity: ${enquiry.quantityRange}`,
    `• Event date: ${formatDate(enquiry.eventDate)}`,
    enquiry.budget ? `• Budget per piece: ${enquiry.budget}` : null,
    `Name: ${enquiry.name} | Phone: ${enquiry.phone}`,
    enquiry.organisation ? `Organisation: ${enquiry.organisation}` : null,
    enquiry.email ? `Email: ${enquiry.email}` : null,
    `Brief: ${enquiry.message}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}

export function buildBagMessage(items: readonly BagItem[]) {
  const itemLines = items.map((item) => {
    const product = getProductBySlug(item.productSlug);
    const name = product ? shortOrderName(product.name) : item.productSlug;
    const option = item.variant ?? item.flower ?? item.size;
    return `• ${item.quantity} × ${name}${option ? ` (${option})` : ""} — ${formatINR(item.unitPrice * item.quantity)}`;
  });
  const total = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  return [
    "Hi Studio Viana! 🌸 I'd like to order these pieces:",
    ...itemLines,
    `Estimated total: ${formatINR(total)}`,
    "Could you confirm availability and customisation options?",
  ].join("\n");
}

/** Keeps subject/body encoding in one seam for a future email API. */
export function mailtoLink(subject: string, body: string) {
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Current submission seam; a later backend can replace this implementation. */
export function submitOrder(order: Partial<OrderState>) {
  const href = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(buildOrderMessage(order))}`;
  if (typeof window !== "undefined") window.open(href, "_blank", "noopener,noreferrer");
  return href;
}

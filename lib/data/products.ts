export interface ProductVariant {
  readonly name: string;
  readonly image: string;
}

export interface Product {
  readonly id: string;
  readonly number: string;
  readonly name: string;
  readonly slug: string;
  readonly priceLabel: string;
  readonly description: string;
  readonly variants?: readonly ProductVariant[];
  readonly flowers?: readonly string[];
  readonly featured?: boolean;
}

export interface Service {
  readonly number: string;
  readonly name: string;
  readonly description: string;
}

const productImage = (slug: string) => `/images/products/${slug}.jpg`;

export const products: readonly Product[] = [
  {
    id: "flower-cards",
    number: "01",
    name: "Flower Cards",
    slug: "flower-cards",
    priceLabel: "₹150",
    description:
      "Single handcrafted bloom mounted on a quote card; a keepsake, bookmark or return favour.",
    variants: [
      { name: "Lily Bookmarks", image: productImage("lily-bookmarks") },
    ],
  },
  {
    id: "single-stem-florals",
    number: "02",
    name: "Single Stem Florals",
    slug: "single-stem-florals",
    priceLabel: "₹120 per stem",
    description:
      "One perfect stem wrapped with care in a customisable palette.",
    flowers: ["Sunflower", "Lily", "Rose", "Tulip", "Gerbera", "Hydrangea"],
  },
  {
    id: "small-bouquets",
    number: "03",
    name: "Small Bouquets",
    slug: "small-bouquets",
    priceLabel: "₹150 – ₹250",
    description: "Pocket-sized bouquet of one to two blooms, hand-wrapped.",
    variants: [{ name: "Noir Orchid", image: productImage("noir-orchid") }],
  },
  {
    id: "medium-bouquets",
    number: "04",
    name: "Medium Bouquets",
    slug: "medium-bouquets",
    priceLabel: "₹550",
    description:
      "Refined editorial wrap with a statement bloom and delicate accents.",
    variants: [
      { name: "Tulip & Lily", image: productImage("tulip-and-lily") },
      { name: "Noir Wrap", image: productImage("noir-wrap") },
      { name: "Violet Edit", image: productImage("violet-edit") },
    ],
  },
  {
    id: "mini-bouquets",
    number: "05",
    name: "Mini Bouquets",
    slug: "mini-bouquets",
    priceLabel: "₹650",
    description:
      "Gathered handful of multiple blooms with sheer ribbon and a hand-tied bow.",
    variants: [{ name: "Rose Duet", image: productImage("rose-duet") }],
  },
  {
    id: "large-statement-bouquets",
    number: "06",
    name: "Large Statement Bouquets",
    slug: "large-statement-bouquets",
    priceLabel: "₹1,250",
    description:
      "Full, generous arrangement with message card in premium paper.",
    variants: [
      { name: "Blush Lily", image: productImage("blush-lily") },
      { name: "Anniversary", image: productImage("anniversary") },
      { name: "Birthday Edit", image: productImage("birthday-edit") },
    ],
  },
  {
    id: "grand-bouquet",
    number: "07",
    name: "The Grand Bouquet",
    slug: "grand-bouquet",
    priceLabel: "₹1,250",
    description:
      "Our most opulent creation, a full rounded dome of blooms in imported sheer.",
    featured: true,
  },
  {
    id: "just-for-you-hamper",
    number: "08",
    name: '"Just For You" Hamper',
    slug: "just-for-you-hamper",
    priceLabel: "₹1,250",
    description:
      "Structured gift bag hand-filled with blooms and a satin ribbon handle.",
    variants: [{ name: "Lilac Edition", image: productImage("lilac-edition") }],
  },
  {
    id: "corporate-bulk-orders",
    number: "09",
    name: "Corporate & Bulk Orders",
    slug: "corporate-bulk-orders",
    priceLabel: "On request",
    description:
      "Return gifts, favours and floral pieces for corporate events.",
  },
] as const;

export const services: readonly Service[] = [
  {
    number: "01",
    name: "Hampers",
    description:
      "Curated gift hampers built around a floral centrepiece, dressed for birthdays, anniversaries and thank-you gestures.",
  },
  {
    number: "02",
    name: "Bouquets",
    description:
      "From a single stem to a grand handful of blooms, made to order in a palette that suits the occasion.",
  },
  {
    number: "03",
    name: "Corporate Events",
    description:
      "Bespoke floral favours and centrepieces for launches, felicitations and milestone corporate moments.",
  },
  {
    number: "04",
    name: "Return Gifts",
    description:
      "Delicate flower cards and keepsakes, thoughtfully priced for weddings, parties and bulk gifting.",
  },
] as const;

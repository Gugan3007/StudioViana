import type { StaticImageData } from "next/image";

import flowerCardsHero from "@/public/images/products/flower-cards-hero.jpg";
import flowerCardsLilyBookmarks from "@/public/images/products/flower-cards-lily-bookmarks.jpg";
import grandBouquetHero from "@/public/images/products/grand-bouquet-hero.jpg";
import grandBouquetMobile from "@/public/images/products/grand-bouquet-mobile.jpg";
import hamperHero from "@/public/images/products/hamper-hero.jpg";
import hamperLilacEdition from "@/public/images/products/hamper-lilac-edition.jpg";
import largeAnniversary from "@/public/images/products/large-anniversary.jpg";
import largeBirthdayEdit from "@/public/images/products/large-birthday-edit.jpg";
import largeBlushLily from "@/public/images/products/large-blush-lily.jpg";
import largeHero from "@/public/images/products/large-hero.jpg";
import mediumHero from "@/public/images/products/medium-bouquets-hero.jpg";
import mediumNoirWrap from "@/public/images/products/medium-noir-wrap.jpg";
import mediumTulipLily from "@/public/images/products/medium-tulip-lily.jpg";
import mediumVioletEdit from "@/public/images/products/medium-violet-edit.jpg";
import miniHero from "@/public/images/products/mini-bouquets-hero.jpg";
import miniRoseDuet from "@/public/images/products/mini-rose-duet.jpg";
import singleStemHero from "@/public/images/products/single-stem-hero.jpg";
import smallHero from "@/public/images/products/small-bouquets-hero.jpg";
import smallNoirOrchid from "@/public/images/products/small-bouquets-noir-orchid.jpg";

export type ProductImage = StaticImageData | string;

export interface ProductGalleryImage {
  readonly alt: string;
  readonly image: ProductImage;
}

export interface ProductVariant {
  readonly alt: string;
  readonly image: ProductImage;
  readonly name: string;
  readonly note?: string;
}

export interface ProductSizeOption {
  readonly label: "1 bloom" | "2 blooms";
  readonly price: number;
}

export interface Product {
  readonly accent: `#${string}`;
  readonly customisable: boolean;
  readonly description: string;
  readonly details: readonly string[];
  readonly featured: boolean;
  readonly flowers?: readonly string[];
  readonly gallery: readonly ProductGalleryImage[];
  readonly heroAlt: string;
  readonly heroImage: ProductImage;
  readonly id: string;
  readonly name: string;
  readonly number: string;
  readonly occasions: readonly string[];
  readonly priceFrom: number;
  readonly priceLabel: string;
  readonly sizes?: readonly ProductSizeOption[];
  readonly slug: string;
  readonly tagline: string;
  readonly theme: "light" | "dark";
  readonly variants: readonly ProductVariant[];
}

export interface Service {
  readonly number: string;
  readonly name: string;
  readonly description: string;
}

const image = (imageData: ProductImage, alt: string): ProductGalleryImage => ({
  alt,
  image: imageData,
});

export const catalogueProducts = [
  {
    id: "flower-cards",
    number: "01",
    name: "Flower Cards",
    slug: "flower-cards",
    priceLabel: "₹150",
    priceFrom: 150,
    tagline: "The smallest gesture, beautifully made.",
    description:
      "A single handcrafted bloom mounted on a quote card — perfect as a bookmark, a desk keepsake, or a return favour that guests will actually keep.",
    details: [
      "One handcrafted chenille bloom",
      "Deckled quote card and ribbon finish",
      "Lightweight keepsake or bookmark format",
    ],
    occasions: ["Return gifts", "Weddings", "Thank you"],
    customisable: true,
    heroImage: flowerCardsHero,
    heroAlt:
      "Flower Card — handcrafted ivory chenille lily mounted on a deckled quote card",
    gallery: [
      image(
        flowerCardsHero,
        "Flower Card with a handcrafted chenille bloom and keepsake quote",
      ),
      image(
        flowerCardsLilyBookmarks,
        "Lily Bookmark flower card with an ivory chenille bloom",
      ),
    ],
    variants: [
      {
        name: "Lily Bookmarks",
        image: flowerCardsLilyBookmarks,
        alt: "Lily Bookmark flower card — ivory handcrafted chenille lily",
        note: "A slim keepsake format for return gifting",
      },
    ],
    featured: false,
    theme: "light",
    accent: "#d8b7aa",
  },
  {
    id: "single-stem-florals",
    number: "02",
    name: "Single Stem Florals",
    slug: "single-stem-florals",
    priceLabel: "₹120 per stem",
    priceFrom: 120,
    tagline: "One perfect stem, wrapped with care.",
    description:
      "Every flower is made to order and can be customised to match your palette — a quiet, elegant way to say thank you, congratulations, or simply thinking of you.",
    details: [
      "One made-to-order chenille stem",
      "Coordinated paper and ribbon wrap",
      "Flower type and palette chosen by you",
    ],
    occasions: ["Thank you", "Congratulations", "Just because"],
    customisable: true,
    heroImage: singleStemHero,
    heroAlt:
      "Single Stem Floral — handcrafted blush chenille lily wrapped with care",
    gallery: [
      image(
        singleStemHero,
        "Blush chenille single stem floral in a minimal paper wrap",
      ),
    ],
    variants: [],
    flowers: ["Sunflower", "Lily", "Rose", "Tulip", "Gerbera", "Hydrangea"],
    featured: false,
    theme: "light",
    accent: "#e5b6bb",
  },
  {
    id: "small-bouquets",
    number: "03",
    name: "Small Bouquets",
    slug: "small-bouquets",
    priceLabel: "₹150 – ₹250",
    priceFrom: 150,
    tagline: "Understated, affordable, endlessly giftable.",
    description:
      "A pocket-sized bouquet featuring one to two blooms, hand-wrapped in coordinated paper and ribbon.",
    details: [
      "Choice of one or two handcrafted blooms",
      "Coordinated paper wrap",
      "Hand-tied ribbon finish",
    ],
    occasions: ["Birthdays", "Friendship", "Everyday gifting"],
    customisable: true,
    heroImage: smallHero,
    heroAlt:
      "Small Bouquet — handcrafted blush, ivory and lilac chenille blooms",
    gallery: [
      image(smallHero, "Small blush and lilac handcrafted chenille bouquet"),
      image(
        smallNoirOrchid,
        "Noir Orchid small bouquet in a dark editorial wrap",
      ),
    ],
    variants: [
      {
        name: "Noir Orchid",
        image: smallNoirOrchid,
        alt: "Noir Orchid small bouquet — handcrafted chenille blooms in a dark wrap",
      },
    ],
    sizes: [
      { label: "1 bloom", price: 150 },
      { label: "2 blooms", price: 250 },
    ],
    featured: false,
    theme: "light",
    accent: "#c9b6e4",
  },
  {
    id: "medium-bouquets",
    number: "04",
    name: "Medium Bouquets",
    slug: "medium-bouquets",
    priceLabel: "₹550",
    priceFrom: 550,
    tagline: "Gallery-ready gifting.",
    description:
      "A refined, editorial-style wrap featuring a statement bloom with delicate accents.",
    details: [
      "Statement chenille bloom with delicate accents",
      "Editorial layered wrap",
      "Finished with coordinated ribbon",
    ],
    occasions: ["Anniversaries", "Birthdays", "Graduations"],
    customisable: true,
    heroImage: mediumHero,
    heroAlt:
      "Medium Bouquet — handcrafted lilac and pearl chenille blooms in an ivory wrap",
    gallery: [
      image(mediumHero, "Medium lilac and ivory handcrafted chenille bouquet"),
      image(
        mediumTulipLily,
        "Tulip and Lily medium bouquet with handcrafted chenille blooms",
      ),
      image(
        mediumNoirWrap,
        "Noir Wrap medium bouquet with sculptural chenille flowers",
      ),
      image(
        mediumVioletEdit,
        "Violet Edit medium bouquet — handcrafted purple chenille lilies in a white wrap",
      ),
    ],
    variants: [
      {
        name: "Tulip & Lily",
        image: mediumTulipLily,
        alt: "Tulip and Lily medium bouquet with handcrafted chenille blooms",
      },
      {
        name: "Noir Wrap",
        image: mediumNoirWrap,
        alt: "Noir Wrap medium bouquet with handcrafted chenille flowers",
      },
      {
        name: "Violet Edit",
        image: mediumVioletEdit,
        alt: "Violet Edit medium bouquet — handcrafted purple chenille lilies in a white wrap",
      },
    ],
    featured: false,
    theme: "light",
    accent: "#b8a3cf",
  },
  {
    id: "mini-bouquets",
    number: "05",
    name: "Mini Bouquets",
    slug: "mini-bouquets",
    priceLabel: "₹650",
    priceFrom: 650,
    tagline: "A gift that doesn't need a card.",
    description:
      "A gathered handful of multiple blooms, finished with sheer ribbon and a hand-tied bow. Sized perfectly for a bedside vase.",
    details: [
      "Gathered mix of handcrafted blooms",
      "Bedside-vase scale",
      "Sheer ribbon and hand-tied bow",
    ],
    occasions: ["Love", "Get well soon", "Just because"],
    customisable: true,
    heroImage: miniHero,
    heroAlt:
      "Mini Bouquet — gathered blush handcrafted chenille lilies with sheer ribbon",
    gallery: [
      image(miniHero, "Mini bouquet of blush handcrafted chenille lilies"),
      image(
        miniRoseDuet,
        "Rose Duet mini bouquet with two handcrafted chenille roses",
      ),
    ],
    variants: [
      {
        name: "Rose Duet",
        image: miniRoseDuet,
        alt: "Rose Duet mini bouquet with two handcrafted chenille roses",
      },
    ],
    featured: false,
    theme: "light",
    accent: "#ddaeb4",
  },
  {
    id: "large-statement-bouquets",
    number: "06",
    name: "Large Statement Bouquets",
    slug: "large-statement-bouquets",
    priceLabel: "₹1,250",
    priceFrom: 1250,
    tagline: "For the grand celebrations.",
    description:
      "Full, generous arrangements finished with a message card, wrapped in premium paper for birthdays, anniversaries and grand celebrations.",
    details: [
      "Full arrangement of handcrafted blooms",
      "Premium paper and ribbon wrap",
      "Personal message card included",
    ],
    occasions: ["Anniversaries", "Birthdays", "Proposals"],
    customisable: true,
    heroImage: largeHero,
    heroAlt:
      "Large Statement Bouquet — full blush, ivory and lilac handcrafted chenille arrangement",
    gallery: [
      image(
        largeHero,
        "Large statement arrangement of handcrafted chenille blooms",
      ),
      image(
        largeBlushLily,
        "Blush Lily large bouquet with pearl chenille details",
      ),
      image(
        largeAnniversary,
        "Anniversary large bouquet in a romantic premium wrap",
      ),
      image(
        largeBirthdayEdit,
        "Birthday Edit large bouquet with colourful handcrafted chenille blooms",
      ),
    ],
    variants: [
      {
        name: "Blush Lily",
        image: largeBlushLily,
        alt: "Blush Lily large bouquet with pearl chenille details",
      },
      {
        name: "Anniversary",
        image: largeAnniversary,
        alt: "Anniversary large bouquet in a romantic premium wrap",
      },
      {
        name: "Birthday Edit",
        image: largeBirthdayEdit,
        alt: "Birthday Edit large bouquet with colourful handcrafted chenille blooms",
      },
    ],
    featured: false,
    theme: "light",
    accent: "#d7a8ad",
  },
  {
    id: "grand-bouquet",
    number: "07",
    name: "The Grand Bouquet",
    slug: "grand-bouquet",
    priceLabel: "₹1,250",
    priceFrom: 1250,
    tagline: "Our most opulent creation.",
    description:
      "A full, rounded dome of blooms wrapped in imported sheer, for the moments that deserve a grand gesture.",
    details: [
      "Full rounded dome of handcrafted blooms",
      "Imported sheer presentation wrap",
      "Pearl details and message card",
    ],
    occasions: ["Proposals", "Milestones", "Weddings"],
    customisable: true,
    heroImage: grandBouquetHero,
    heroAlt:
      "The Grand Bouquet — opulent dome of blush, ivory and lilac handcrafted chenille blooms",
    gallery: [
      image(
        grandBouquetHero,
        "The Grand Bouquet full rounded chenille flower dome",
      ),
      image(
        grandBouquetMobile,
        "Portrait detail of The Grand Bouquet and its pearl accents",
      ),
    ],
    variants: [],
    featured: true,
    theme: "dark",
    accent: "#7f4857",
  },
  {
    id: "just-for-you-hamper",
    number: "08",
    name: '"Just For You" Hamper',
    slug: "just-for-you-hamper",
    priceLabel: "₹1,250",
    priceFrom: 1250,
    tagline: "Our most gifted hamper.",
    description:
      "A structured gift bag, hand-filled with an abundance of blooms and finished with a satin ribbon handle — for birthdays, anniversaries and heartfelt thank-yous.",
    details: [
      "Structured premium gift bag",
      "Abundant handcrafted chenille blooms",
      "Satin ribbon handle and message card",
    ],
    occasions: ["Birthdays", "Anniversaries", "Thank you"],
    customisable: true,
    heroImage: hamperHero,
    heroAlt:
      "Just For You Hamper — structured gift bag filled with handcrafted chenille flowers",
    gallery: [
      image(
        hamperHero,
        "Just For You structured hamper with handcrafted chenille blooms",
      ),
      image(
        hamperLilacEdition,
        "Lilac Edition Just For You hamper with pearl chenille details",
      ),
    ],
    variants: [
      {
        name: "Lilac Edition",
        image: hamperLilacEdition,
        alt: "Lilac Edition Just For You hamper with pearl chenille details",
      },
    ],
    featured: false,
    theme: "light",
    accent: "#b9a5d1",
  },
] as const satisfies readonly Product[];

export const corporateProduct: Product = {
  id: "corporate-bulk-orders",
  number: "09",
  name: "Corporate & Bulk Orders",
  slug: "corporate-bulk-orders",
  priceLabel: "On request",
  priceFrom: 0,
  tagline: "Made for gatherings of every scale.",
  description:
    "Return gifts, favours and floral pieces for weddings, corporate events and thoughtful bulk gifting.",
  details: [
    "Tailored palette and format",
    "Volume pricing on request",
    "Lead time planned around your event",
  ],
  occasions: ["Weddings", "Events", "Return gifts"],
  customisable: true,
  heroImage: hamperHero,
  heroAlt:
    "Corporate floral gifting — structured arrangements of handcrafted chenille blooms",
  gallery: [
    image(
      hamperHero,
      "Corporate and bulk gifting arrangement of handcrafted chenille flowers",
    ),
  ],
  variants: [],
  featured: false,
  theme: "dark",
  accent: "#1f3326",
};

export const products: readonly Product[] = [
  ...catalogueProducts,
  corporateProduct,
];

export function getProductBySlug(slug: string | null | undefined) {
  if (!slug) return undefined;
  return catalogueProducts.find((product) => product.slug === slug);
}

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

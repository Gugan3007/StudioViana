import type { StaticImageData } from "next/image";

import gallery01 from "@/public/images/gallery/gallery-01.jpg";
import gallery02 from "@/public/images/gallery/gallery-02.jpg";
import gallery03 from "@/public/images/gallery/gallery-03.jpg";
import gallery04 from "@/public/images/gallery/gallery-04.jpg";
import gallery05 from "@/public/images/gallery/gallery-05.jpg";
import gallery06 from "@/public/images/gallery/gallery-06.jpg";
import gallery07 from "@/public/images/gallery/gallery-07.jpg";
import gallery08 from "@/public/images/gallery/gallery-08.jpg";
import gallery09 from "@/public/images/gallery/gallery-09.jpg";
import gallery10 from "@/public/images/gallery/gallery-10.jpg";
import gallery11 from "@/public/images/gallery/gallery-11.jpg";
import gallery12 from "@/public/images/gallery/gallery-12.jpg";
import gallery13 from "@/public/images/gallery/gallery-13.jpg";
import gallery14 from "@/public/images/gallery/gallery-14.jpg";
import gallery15 from "@/public/images/gallery/gallery-15.jpg";
import gallery16 from "@/public/images/gallery/gallery-16.jpg";
import gallery17 from "@/public/images/gallery/gallery-17.jpg";
import gallery18 from "@/public/images/gallery/gallery-18.jpg";

export type GalleryCategory =
  "Bouquets" | "Hampers" | "Flower Cards" | "Single Stems" | "Occasions";

export interface GalleryItemData {
  readonly alt: string;
  readonly category: GalleryCategory;
  readonly height: number;
  readonly id: string;
  readonly productSlug?: string;
  readonly src: StaticImageData;
  readonly title: string;
  readonly width: number;
}

export const galleryFilters = [
  "All",
  "Bouquets",
  "Hampers",
  "Flower Cards",
  "Single Stems",
  "Occasions",
] as const;

export type GalleryFilter = (typeof galleryFilters)[number];

export const galleryItems: readonly GalleryItemData[] = [
  {
    id: "g01",
    src: gallery01,
    alt: "Pink chenille flower card with a deckled keepsake edge",
    title: "A Note in Bloom",
    category: "Flower Cards",
    productSlug: "flower-cards",
    width: 4,
    height: 5,
  },
  {
    id: "g02",
    src: gallery02,
    alt: "Single blush chenille stem standing in a ceramic vase",
    title: "Blush Stem",
    category: "Single Stems",
    productSlug: "single-stem-florals",
    width: 1,
    height: 1,
  },
  {
    id: "g03",
    src: gallery03,
    alt: "Small blush and ivory handcrafted chenille bouquet",
    title: "Sunday Blush",
    category: "Bouquets",
    productSlug: "small-bouquets",
    width: 3,
    height: 4,
  },
  {
    id: "g04",
    src: gallery04,
    alt: "Medium lilac chenille bouquet in a soft white wrap",
    title: "Violet Reverie",
    category: "Bouquets",
    productSlug: "medium-bouquets",
    width: 2,
    height: 3,
  },
  {
    id: "g05",
    src: gallery05,
    alt: "Mini rose chenille bouquet arranged as a petite gift",
    title: "Rose Duet",
    category: "Bouquets",
    productSlug: "mini-bouquets",
    width: 1,
    height: 1,
  },
  {
    id: "g06",
    src: gallery06,
    alt: "Large statement chenille bouquet with blush lilies",
    title: "Blush Statement",
    category: "Bouquets",
    productSlug: "large-statement-bouquets",
    width: 4,
    height: 5,
  },
  {
    id: "g07",
    src: gallery07,
    alt: "Grand rounded chenille bouquet in blush, ivory and lilac",
    title: "The Grand Gesture",
    category: "Occasions",
    productSlug: "grand-bouquet",
    width: 3,
    height: 4,
  },
  {
    id: "g08",
    src: gallery08,
    alt: "Just For You gift hamper with handcrafted chenille blooms",
    title: "Just For You",
    category: "Hampers",
    productSlug: "just-for-you-hamper",
    width: 4,
    height: 5,
  },
  {
    id: "g09",
    src: gallery09,
    alt: "Blush chenille lily with pearl details in warm light",
    title: "Pearl Lily",
    category: "Single Stems",
    productSlug: "single-stem-florals",
    width: 1,
    height: 1,
  },
  {
    id: "g10",
    src: gallery10,
    alt: "Lily flower bookmarks arranged on textured quote cards",
    title: "Lily Keepsakes",
    category: "Flower Cards",
    productSlug: "flower-cards",
    width: 2,
    height: 3,
  },
  {
    id: "g11",
    src: gallery11,
    alt: "Violet chenille bouquet with a crisp ivory wrapping",
    title: "Violet Edit",
    category: "Bouquets",
    productSlug: "medium-bouquets",
    width: 4,
    height: 5,
  },
  {
    id: "g12",
    src: gallery12,
    alt: "Tulip and lily chenille bouquet prepared for a celebration",
    title: "Tulip Celebration",
    category: "Occasions",
    productSlug: "medium-bouquets",
    width: 3,
    height: 4,
  },
  {
    id: "g13",
    src: gallery13,
    alt: "Two handcrafted rose blooms in a miniature bouquet",
    title: "Two of Us",
    category: "Bouquets",
    productSlug: "mini-bouquets",
    width: 4,
    height: 5,
  },
  {
    id: "g14",
    src: gallery14,
    alt: "Large anniversary bouquet of lasting chenille flowers",
    title: "Forever Anniversary",
    category: "Occasions",
    productSlug: "large-statement-bouquets",
    width: 2,
    height: 3,
  },
  {
    id: "g15",
    src: gallery15,
    alt: "Birthday edition statement bouquet in joyful warm colours",
    title: "Birthday Edit",
    category: "Occasions",
    productSlug: "large-statement-bouquets",
    width: 1,
    height: 1,
  },
  {
    id: "g16",
    src: gallery16,
    alt: "Forest green hamper filled with lilac chenille flowers",
    title: "Forest Hamper",
    category: "Hampers",
    productSlug: "just-for-you-hamper",
    width: 3,
    height: 4,
  },
  {
    id: "g17",
    src: gallery17,
    alt: "Noir orchid chenille bouquet wrapped for an evening gift",
    title: "Noir Orchid",
    category: "Bouquets",
    productSlug: "small-bouquets",
    width: 4,
    height: 5,
  },
  {
    id: "g18",
    src: gallery18,
    alt: "Dark wrap medium bouquet with ivory chenille flowers",
    title: "Noir Wrap",
    category: "Bouquets",
    productSlug: "medium-bouquets",
    width: 2,
    height: 3,
  },
] as const;

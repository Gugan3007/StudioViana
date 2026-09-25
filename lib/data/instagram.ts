import type { StaticImageData } from "next/image";

import ig01 from "@/public/images/instagram/ig-01.jpg";
import ig02 from "@/public/images/instagram/ig-02.jpg";
import ig03 from "@/public/images/instagram/ig-03.jpg";
import ig04 from "@/public/images/instagram/ig-04.jpg";
import ig05 from "@/public/images/instagram/ig-05.jpg";
import ig06 from "@/public/images/instagram/ig-06.jpg";
import ig07 from "@/public/images/instagram/ig-07.jpg";
import ig08 from "@/public/images/instagram/ig-08.jpg";
import ig09 from "@/public/images/instagram/ig-09.jpg";
import ig10 from "@/public/images/instagram/ig-10.jpg";

export interface InstagramItem {
  readonly alt: string;
  readonly id: string;
  readonly src: StaticImageData;
}

export const instagramProfileUrl = "https://instagram.com/studio_viana.in";

export const instagramItems: readonly InstagramItem[] = [
  {
    id: "ig-01",
    src: ig01,
    alt: "Blush chenille lily detail from the Studio Viana feed",
  },
  {
    id: "ig-02",
    src: ig02,
    alt: "Handcrafted flower card photographed in warm window light",
  },
  {
    id: "ig-03",
    src: ig03,
    alt: "Lilac pearl dome bouquet ready for a thoughtful gift",
  },
  {
    id: "ig-04",
    src: ig04,
    alt: "Single lasting chenille stem in the Studio Viana studio",
  },
  {
    id: "ig-05",
    src: ig05,
    alt: "Mini bouquet of soft handcrafted chenille roses",
  },
  {
    id: "ig-06",
    src: ig06,
    alt: "Close blush lily petals with tactile chenille fibres",
  },
  {
    id: "ig-07",
    src: ig07,
    alt: "Small bouquet wrapped and finished with a sheer ribbon",
  },
  {
    id: "ig-08",
    src: ig08,
    alt: "Violet bouquet edition against a warm cream backdrop",
  },
  {
    id: "ig-09",
    src: ig09,
    alt: "Grand bouquet in blush, ivory and lilac tones",
  },
  {
    id: "ig-10",
    src: ig10,
    alt: "Flower card bloom with pearl and ribbon detailing",
  },
] as const;

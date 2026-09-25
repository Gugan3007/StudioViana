import type { StaticImageData } from "next/image";

import step01 from "@/public/images/process/step-01.jpg";
import step02 from "@/public/images/process/step-02.jpg";
import step03 from "@/public/images/process/step-03.jpg";
import step04 from "@/public/images/process/step-04.jpg";
import step05 from "@/public/images/process/step-05.jpg";

export type ProcessIcon = "flower" | "hands" | "palette" | "ribbon" | "speech";

export interface ProcessStepData {
  readonly alt: string;
  readonly description: string;
  readonly icon: ProcessIcon;
  readonly image: StaticImageData;
  readonly number: string;
  readonly title: string;
}

export const craftMotion = {
  calloutStagger: 0.09,
  desktopMediaZoom: 1.65,
  desktopReleaseZoom: 1.48,
  mobileMediaZoom: 1.4,
  pinDistanceVh: 200,
  processParallax: 0.35,
  resizeDebounceMs: 120,
  scrub: 1,
} as const;

export const processSteps: readonly ProcessStepData[] = [
  {
    alt: "Studio Viana order notes beside a handcrafted flower card",
    description:
      "Tell us the occasion, the person, and the feeling you want to give.",
    icon: "speech",
    image: step01,
    number: "01",
    title: "Share your moment",
  },
  {
    alt: "Lilac chenille flower palette arranged in warm studio light",
    description:
      "Pick your flowers and colours, or let us suggest a palette that fits.",
    icon: "palette",
    image: step02,
    number: "02",
    title: "Choose your palette",
  },
  {
    alt: "Close view of blush chenille petals shaped by hand",
    description:
      "Each bloom is shaped by hand in our studio, petal by petal.",
    icon: "hands",
    image: step03,
    number: "03",
    title: "Handcrafted stem by stem",
  },
  {
    alt: "Chenille floral hamper finished with coordinated ribbon",
    description:
      "Finished in coordinated paper, sheer ribbon and a hand-tied bow.",
    icon: "ribbon",
    image: step04,
    number: "04",
    title: "Wrapped with care",
  },
  {
    alt: "Finished Studio Viana bouquet ready to be gifted",
    description:
      "A keepsake that never wilts — long after fresh flowers would have faded.",
    icon: "flower",
    image: step05,
    number: "05",
    title: "Delivered to last forever",
  },
] as const;


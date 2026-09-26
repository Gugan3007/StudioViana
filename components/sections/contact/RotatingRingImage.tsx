"use client";

import Image from "next/image";
import { useId } from "react";

import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import flowerCard from "@/public/images/products/flower-card.jpg";

export function RotatingRingImage() {
  const shouldReduceMotion = useReducedMotion();
  const pathId = `contact-ring-${useId().replaceAll(":", "")}`;
  return (
    <div className="relative mx-auto grid h-[19rem] w-[19rem] place-items-center sm:h-[21rem] sm:w-[21rem]">
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full text-gold-light"
        style={{
          animation: shouldReduceMotion
            ? "none"
            : "contact-ring-spin 28s linear infinite",
        }}
        viewBox="0 0 340 340"
      >
        <defs>
          <path
            id={pathId}
            d="M170,170 m-145,0 a145,145 0 1,1 290,0 a145,145 0 1,1 -290,0"
          />
        </defs>
        <circle
          cx="170"
          cy="170"
          fill="none"
          r="146"
          stroke="currentColor"
          strokeOpacity=".65"
        />
        <text
          fill="currentColor"
          fontFamily="var(--font-poppins)"
          fontSize="10"
          letterSpacing="4"
        >
          <textPath href={`#${pathId}`} startOffset="1%">
            CURATED WITH LOVE • STUDIO VIANA • CURATED WITH LOVE • STUDIO VIANA
            •
          </textPath>
        </text>
      </svg>
      <div className="relative h-[15rem] w-[15rem] overflow-hidden rounded-full border border-gold/70 bg-cream sm:h-[17rem] sm:w-[17rem]">
        <Image
          fill
          alt="Pink gerbera flower card handcrafted by Studio Viana"
          className="object-cover motion-safe:animate-[contact-image-reveal_1.2s_cubic-bezier(0.22,1,0.36,1)_both]"
          placeholder="blur"
          sizes="272px"
          src={flowerCard}
        />
      </div>
    </div>
  );
}

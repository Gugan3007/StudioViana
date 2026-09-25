"use client";

import Image, { type StaticImageData } from "next/image";
import { useRef } from "react";

import { Float } from "@/components/animations/Float";
import { RotatingBadge } from "@/components/sections/home/RotatingBadge";
import { gsap } from "@/lib/animations/gsap";
import { refreshScrollTrigger } from "@/lib/animations/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import blushLily from "@/public/images/products/blush-lily.jpg";
import flowerCard from "@/public/images/products/flower-card.jpg";
import grandBouquet from "@/public/images/products/grand-bouquet.jpg";
import justForYouHamper from "@/public/images/products/just-for-you-hamper.jpg";

interface CollageItem {
  alt: string;
  className: string;
  delay: number;
  duration: number;
  image: StaticImageData;
  mouseDepth: number;
  sizes: string;
  strength: number;
  travel: number;
}

const collageItems: readonly CollageItem[] = [
  {
    alt: "Grand lilac, ivory and blush handcrafted chenille bouquet",
    className:
      "left-[3%] top-[9%] z-10 w-[68%] sm:left-[9%] sm:w-[58%] lg:left-[4%] lg:top-[8%] lg:w-[63%]",
    delay: 0,
    duration: 6.8,
    image: grandBouquet,
    mouseDepth: 8,
    sizes: "(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 74vw",
    strength: 7,
    travel: -10,
  },
  {
    alt: "Blush pink handcrafted chenille lily arrangement",
    className:
      "right-[1%] top-[4%] z-20 w-[38%] sm:right-[4%] sm:w-[34%] lg:right-0 lg:top-[5%] lg:w-[38%]",
    delay: 0.45,
    duration: 5.4,
    image: blushLily,
    mouseDepth: 14,
    sizes: "(min-width: 1024px) 18vw, 36vw",
    strength: 10,
    travel: -18,
  },
  {
    alt: "Just For You handcrafted chenille flower gift hamper",
    className:
      "bottom-[5%] right-[2%] z-30 w-[50%] sm:right-[5%] sm:w-[45%] lg:bottom-[2%] lg:right-[1%] lg:w-[48%]",
    delay: 0.75,
    duration: 7.2,
    image: justForYouHamper,
    mouseDepth: 22,
    sizes: "(min-width: 1024px) 24vw, 48vw",
    strength: 13,
    travel: -28,
  },
  {
    alt: "Deckled flower card decorated with handcrafted chenille blooms",
    className:
      "bottom-0 left-[3%] z-40 hidden w-[34%] sm:block lg:bottom-[1%] lg:left-[16%] lg:w-[31%]",
    delay: 1.1,
    duration: 4.8,
    image: flowerCard,
    mouseDepth: 30,
    sizes: "(min-width: 1024px) 16vw, 30vw",
    strength: 16,
    travel: -40,
  },
] as const;

export function HeroCollage() {
  const root = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const shouldReduceMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (shouldReduceMotion || !root.current) return;
    const media = gsap.matchMedia();
    media.add("(min-width: 768px)", () => {
      // Each frame travels at a distinct rate as the hero leaves, creating
      // four depth planes without changing layout or image dimensions.
      const tweens = itemRefs.current.flatMap((item, index) =>
        item
          ? [
              gsap.to(item, {
                ease: "none",
                scrollTrigger: {
                  trigger: root.current,
                  start: "top top",
                  end: "bottom top",
                  scrub: true,
                },
                yPercent: collageItems[index].travel,
              }),
            ]
          : [],
      );
      return () => tweens.forEach((tween) => tween.kill());
    });

    return () => media.revert();
  }, [shouldReduceMotion]);

  return (
    <div
      ref={root}
      className="relative mx-auto h-[38rem] w-full max-w-[42rem] sm:h-[44rem] lg:h-[min(74vh,48rem)] lg:max-w-none"
      data-hero-collage
    >
      <div
        aria-hidden="true"
        className="absolute inset-[10%_1%_6%_0] rounded-full bg-blush/25 blur-3xl"
      />
      {collageItems.map((item, index) => (
        <div
          key={item.alt}
          ref={(node) => {
            itemRefs.current[index] = node;
          }}
          className={`absolute ${item.className}`}
          data-hero-image
          data-mobile-hidden={index === 3 || undefined}
        >
          {index === 0 ? (
            <span
              aria-hidden="true"
              className="absolute -inset-3 translate-x-1.5 translate-y-1.5 border border-gold/70"
            />
          ) : null}
          <Float
            delay={item.delay}
            duration={item.duration}
            mouseParallax={item.mouseDepth}
            strength={item.strength}
          >
            <div
              className={
                index === 0 || index === 3
                  ? "relative aspect-[4/5] overflow-hidden bg-cream-soft shadow-soft"
                  : index === 1
                    ? "relative aspect-square overflow-hidden bg-cream-soft shadow-soft"
                    : "relative aspect-[4/3] overflow-hidden bg-cream-soft shadow-soft"
              }
            >
              <Image
                fill
                priority
                alt={item.alt}
                className="object-cover"
                onLoad={refreshScrollTrigger}
                placeholder="blur"
                sizes={item.sizes}
                src={item.image}
              />
            </div>
          </Float>
        </div>
      ))}
      <RotatingBadge className="absolute left-[53%] top-[3%] z-50 -translate-x-1/2 sm:left-[59%] lg:left-[61%] lg:top-[2%]" />
    </div>
  );
}

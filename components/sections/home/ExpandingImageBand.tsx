"use client";

import Image from "next/image";
import { useRef } from "react";

import { gsap, refreshScrollTrigger } from "@/lib/animations/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import lilyBand from "@/public/images/products/i-love-you-lily-band.jpg";

export function ExpandingImageBand() {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (
      shouldReduceMotion ||
      !root.current ||
      !frame.current ||
      !image.current ||
      !headline.current
    ) {
      return;
    }

    const context = gsap.context(() => {
      // One scrubbed timeline expands the inset frame between top 92% and top
      // 15%. The image settles concurrently; copy enters in the final 30%.
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top 92%",
          end: "top 15%",
          scrub: 1,
        },
      });
      timeline
        .fromTo(
          frame.current,
          { clipPath: "inset(10% 12% round 4px)" },
          { clipPath: "inset(0% 0% round 0px)", ease: "none" },
          0,
        )
        .fromTo(image.current, { scale: 1.2 }, { ease: "none", scale: 1 }, 0)
        .fromTo(
          headline.current,
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, duration: 0.3, y: 0 },
          0.7,
        );
    }, root);

    return () => context.revert();
  }, [shouldReduceMotion]);

  return (
    <div
      ref={root}
      className="relative h-[70svh] min-h-[34rem] overflow-hidden"
    >
      <div
        ref={frame}
        className="absolute inset-0 overflow-hidden"
        data-expanding-frame
        style={
          shouldReduceMotion
            ? { clipPath: "inset(0% 0% round 0px)" }
            : { clipPath: "inset(10% 12% round 4px)" }
        }
      >
        <Image
          ref={image}
          fill
          alt="Handcrafted lily bouquet spelling I love you against a warm botanical backdrop"
          className="object-cover"
          data-expanding-image
          onLoad={refreshScrollTrigger}
          placeholder="blur"
          sizes="100vw"
          src={lilyBand}
          style={{ transform: shouldReduceMotion ? "scale(1)" : "scale(1.2)" }}
        />
        <div className="from-forest/75 via-forest/5 absolute inset-0 bg-gradient-to-t to-transparent" />
        <h2
          ref={headline}
          className="absolute bottom-[clamp(3rem,8vw,7rem)] left-1/2 w-[min(90%,78rem)] -translate-x-1/2 text-center font-display text-[clamp(2.5rem,4.5vw,4.5rem)] leading-[1.04] tracking-[-0.035em] text-cream"
          style={shouldReduceMotion ? { opacity: 1 } : undefined}
        >
          Made by hand. Made for moments.
        </h2>
      </div>
    </div>
  );
}

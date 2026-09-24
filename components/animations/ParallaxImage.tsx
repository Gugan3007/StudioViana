"use client";

import Image, { type ImageProps } from "next/image";
import { useRef } from "react";

import { gsap, refreshScrollTrigger } from "@/lib/animations/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { cn } from "@/lib/utils";

interface ParallaxImageProps extends Pick<
  ImageProps,
  "alt" | "onLoad" | "priority" | "src"
> {
  className?: string;
  sizes?: string;
  speed?: number;
}

export function ParallaxImage({
  alt,
  className,
  onLoad,
  priority,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  speed = 0.5,
  src,
}: ParallaxImageProps) {
  const frame = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const travel = Math.min(Math.max(speed, -1), 1) * 10;

  useIsomorphicLayoutEffect(() => {
    if (shouldReduceMotion || !frame.current || !image.current) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        image.current,
        { yPercent: -travel },
        {
          yPercent: travel,
          ease: "none",
          scrollTrigger: {
            trigger: frame.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }, frame);

    return () => context.revert();
  }, [shouldReduceMotion, travel]);

  return (
    <div
      ref={frame}
      className={cn("relative aspect-[4/3] overflow-hidden", className)}
    >
      <Image
        ref={image}
        fill
        alt={alt}
        className="object-cover will-change-transform"
        onLoad={(event) => {
          onLoad?.(event);
          refreshScrollTrigger();
        }}
        priority={priority}
        sizes={sizes}
        src={src}
        style={{ transform: shouldReduceMotion ? "scale(1)" : "scale(1.15)" }}
      />
    </div>
  );
}

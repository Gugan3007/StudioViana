"use client";

import Image, { type ImageProps } from "next/image";
import { useRef } from "react";

import { gsap, refreshScrollTrigger } from "@/lib/animations/gsap";
import { motionTokens } from "@/lib/animations/tokens";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { cn } from "@/lib/utils";

interface ImageRevealProps extends Pick<
  ImageProps,
  "alt" | "onLoad" | "priority" | "src"
> {
  className?: string;
  sizes?: string;
}

export function ImageReveal({
  alt,
  className,
  onLoad,
  priority,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  src,
}: ImageRevealProps) {
  const frame = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (shouldReduceMotion || !frame.current || !image.current) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        frame.current,
        { clipPath: "inset(100% 0 0 0)" },
        {
          clipPath: "inset(0% 0 0 0)",
          duration: motionTokens.duration.cinematic,
          scrollTrigger: {
            trigger: frame.current,
            start: "top 85%",
            once: true,
          },
        },
      );
      gsap.fromTo(
        image.current,
        { scale: 1.08 },
        {
          scale: 1,
          duration: motionTokens.duration.cinematic,
          scrollTrigger: {
            trigger: frame.current,
            start: "top 85%",
            once: true,
          },
        },
      );
    }, frame);

    return () => context.revert();
  }, [shouldReduceMotion]);

  return (
    <div
      ref={frame}
      className={cn("relative aspect-[4/3] overflow-hidden", className)}
      style={shouldReduceMotion ? { clipPath: "inset(0% 0 0 0)" } : undefined}
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
        style={shouldReduceMotion ? { transform: "scale(1)" } : undefined}
      />
    </div>
  );
}

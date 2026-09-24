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
  "alt" | "onLoad" | "placeholder" | "priority" | "src"
> {
  className?: string;
  direction?: "bottom" | "top";
  imageClassName?: string;
  parallaxSpeed?: number;
  sizes?: string;
}

export function ImageReveal({
  alt,
  className,
  direction = "bottom",
  imageClassName,
  onLoad,
  parallaxSpeed = 0,
  placeholder,
  priority,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  src,
}: ImageRevealProps) {
  const frame = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const initialClip =
    direction === "top" ? "inset(0 0 100% 0)" : "inset(100% 0 0 0)";
  const parallaxTravel = Math.min(Math.max(parallaxSpeed, -1), 1) * 10;

  useIsomorphicLayoutEffect(() => {
    if (shouldReduceMotion || !frame.current || !image.current) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        frame.current,
        { clipPath: initialClip },
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
      if (parallaxTravel !== 0) {
        // The image travels more slowly than its frame between viewport entry
        // and exit; scrub keeps the movement tied directly to scroll progress.
        gsap.fromTo(
          image.current,
          { yPercent: -parallaxTravel },
          {
            ease: "none",
            scrollTrigger: {
              trigger: frame.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
            yPercent: parallaxTravel,
          },
        );
      }
    }, frame);

    return () => context.revert();
  }, [initialClip, parallaxTravel, shouldReduceMotion]);

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
        className={cn("object-cover will-change-transform", imageClassName)}
        onLoad={(event) => {
          onLoad?.(event);
          refreshScrollTrigger();
        }}
        priority={priority}
        placeholder={
          placeholder ?? (typeof src === "string" ? undefined : "blur")
        }
        sizes={sizes}
        src={src}
        style={
          shouldReduceMotion
            ? { transform: "scale(1)" }
            : parallaxTravel
              ? { transform: "scale(1.15)" }
              : undefined
        }
      />
    </div>
  );
}

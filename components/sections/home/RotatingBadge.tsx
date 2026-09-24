"use client";

import { useId, useRef } from "react";

import { MandalaMark } from "@/components/decor/MandalaMark";
import { gsap, ScrollTrigger } from "@/lib/animations/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { cn } from "@/lib/utils";

export function RotatingBadge({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const pathId = `badge-path-${useId().replaceAll(":", "")}`;

  useIsomorphicLayoutEffect(() => {
    if (shouldReduceMotion || !root.current) return;

    const rotation = gsap.to(root.current, {
      duration: 24,
      ease: "none",
      paused: true,
      repeat: -1,
      rotation: 360,
      transformOrigin: "50% 50%",
    });
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) => {
            if (entry?.isIntersecting) rotation.play();
            else rotation.pause();
          });
    if (observer) observer.observe(root.current);
    else rotation.play();

    const velocityTrigger = ScrollTrigger.create({
      trigger: root.current,
      start: "top bottom",
      end: "bottom top",
      onUpdate(self) {
        const timeScale = Math.min(
          2.4,
          Math.max(1, 1 + Math.abs(self.getVelocity()) / 2400),
        );
        gsap.to(rotation, { duration: 0.35, timeScale });
      },
    });

    return () => {
      observer?.disconnect();
      velocityTrigger.kill();
      rotation.kill();
    };
  }, [shouldReduceMotion]);

  return (
    <div
      ref={root}
      aria-hidden="true"
      className={cn(
        "border-gold/35 bg-cream/95 relative grid aspect-square w-28 place-items-center rounded-full border text-charcoal shadow-soft sm:w-32",
        className,
      )}
      data-hero-badge
    >
      <svg
        className="absolute inset-1 h-[calc(100%-0.5rem)] w-[calc(100%-0.5rem)]"
        viewBox="0 0 120 120"
      >
        <defs>
          <path
            id={pathId}
            d="M60,60 m-43,0 a43,43 0 1,1 86,0 a43,43 0 1,1 -86,0"
          />
        </defs>
        <text
          fill="currentColor"
          fontFamily="var(--font-poppins)"
          fontSize="7.4"
          letterSpacing="1.45"
        >
          <textPath href={`#${pathId}`} startOffset="1.5%">
            CURATED WITH LOVE • HANDCRAFTED IN INDIA •
          </textPath>
        </text>
      </svg>
      <MandalaMark className="h-8 w-8 text-gold" />
    </div>
  );
}

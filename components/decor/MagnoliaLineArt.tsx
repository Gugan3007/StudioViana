"use client";

import { useRef } from "react";

import { gsap } from "@/lib/animations/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { cn } from "@/lib/utils";

export function MagnoliaLineArt({ className }: { className?: string }) {
  const root = useRef<SVGSVGElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (shouldReduceMotion || !root.current) return;
    const paths = Array.from(root.current.querySelectorAll("path"));
    const context = gsap.context(() => {
      paths.forEach((path) => {
        const length =
          typeof path.getTotalLength === "function" ? path.getTotalLength() : 1;
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
      });
      // Each botanical contour draws once when its lower-right ornament
      // enters at 82% of the viewport, following the reading sequence.
      gsap.to(paths, {
        duration: 1.8,
        ease: "power2.out",
        stagger: 0.12,
        strokeDashoffset: 0,
        scrollTrigger: {
          trigger: root.current,
          start: "top 82%",
          once: true,
        },
      });
    }, root);

    return () => context.revert();
  }, [shouldReduceMotion]);

  return (
    <svg
      ref={root}
      aria-hidden="true"
      className={cn("text-gold", className)}
      fill="none"
      viewBox="0 0 280 300"
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.15"
      >
        <path d="M153 287c-9-64-5-121 12-170 10-29 27-55 50-78" />
        <path d="M174 145c-45-3-77-21-96-54 44-9 78 3 102 37-7-43 4-78 33-105 22 37 20 76-5 116 31-27 62-34 94-20-12 37-41 58-87 63" />
        <path d="M151 239c-37-3-66-20-86-52 39-12 71-4 96 25-4-37 8-66 36-88 17 33 13 65-13 96 30-20 58-23 84-8-15 31-43 46-84 43" />
        <path d="M181 151c9 5 17 14 21 25M180 151c-9 8-15 18-17 30M169 231c8 4 15 11 19 21M167 231c-8 7-13 15-15 25" />
      </g>
    </svg>
  );
}

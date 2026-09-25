"use client";

import { useRef } from "react";

import { gsap } from "@/lib/animations/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import type { ProcessIcon } from "@/lib/data/process";

const paths: Record<ProcessIcon, readonly string[]> = {
  flower: [
    "M24 39V22",
    "M24 24C10 23 10 8 24 15C24 2 40 7 32 18C45 16 43 32 29 29",
    "M24 33C18 30 13 33 11 39",
  ],
  hands: [
    "M7 30c7-1 10-8 13-14 2-4 5-2 4 2l-2 8",
    "M41 30c-7-1-10-8-13-14-2-4-5-2-4 2l2 8",
    "M12 29c7 11 17 14 24 0",
  ],
  palette: [
    "M39 28c0 9-7 14-15 14C13 42 6 34 7 24 8 12 18 6 28 8c10 2 16 13 11 20Z",
    "M17 18h.1M27 15h.1M34 22h.1M15 29h.1",
    "M31 34c0-3 3-5 7-5",
  ],
  ribbon: [
    "M24 22c-7-10-16-8-14-1 2 6 9 8 14 3",
    "M24 22c7-10 16-8 14-1-2 6-9 8-14 3",
    "M24 25 15 42l9-4 9 4-9-17Z",
  ],
  speech: ["M8 10h32v23H22L13 40v-7H8V10Z", "M15 18h18M15 25h13"],
};

interface LineIconProps {
  icon: ProcessIcon;
}

export function LineIcon({ icon }: LineIconProps) {
  const root = useRef<SVGSVGElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (shouldReduceMotion || !root.current) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        root.current?.querySelectorAll("path") ?? [],
        { strokeDashoffset: 1 },
        {
          duration: 1.1,
          ease: "power2.out",
          stagger: 0.12,
          strokeDashoffset: 0,
          scrollTrigger: {
            once: true,
            start: "top 75%",
            trigger: root.current,
          },
        },
      );
    }, root);

    return () => context.revert();
  }, [shouldReduceMotion]);

  return (
    <svg
      ref={root}
      aria-hidden="true"
      className="h-11 w-11 text-gold"
      fill="none"
      viewBox="0 0 48 48"
    >
      {paths[icon].map((path) => (
        <path
          key={path}
          d={path}
          pathLength="1"
          stroke="currentColor"
          strokeDasharray="1"
          strokeDashoffset={shouldReduceMotion ? 0 : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.25"
        />
      ))}
    </svg>
  );
}

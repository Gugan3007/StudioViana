"use client";

import { useEffect, useRef, useState } from "react";

import { useFinePointer } from "@/lib/animations/useFinePointer";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";

const pearls = Array.from({ length: 18 }, (_, index) => ({
  delay: -((index * 17) % 21),
  duration: 14 + ((index * 7) % 11),
  left: 4 + ((index * 29) % 93),
  size: 3 + ((index * 5) % 6),
}));

export function PearlParticles() {
  const root = useRef<HTMLDivElement>(null);
  const hasFinePointer = useFinePointer();
  const shouldReduceMotion = useReducedMotion();
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (
      shouldReduceMotion ||
      !hasFinePointer ||
      !root.current ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsPaused(!entry.isIntersecting),
      { rootMargin: "15% 0px", threshold: 0.01 },
    );
    observer.observe(root.current);
    return () => observer.disconnect();
  }, [hasFinePointer, shouldReduceMotion]);

  if (shouldReduceMotion || !hasFinePointer) return null;

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
      data-paused={isPaused}
      data-pearl-field
    >
      {pearls.map((pearl, index) => (
        <span
          key={index}
          className="absolute bottom-[-8%] rounded-full bg-cream/75 shadow-[0_0_12px_rgba(247,240,230,0.35)]"
          data-pearl
          style={{
            animationDelay: `${pearl.delay}s`,
            animationDuration: `${pearl.duration}s`,
            height: pearl.size,
            left: `${pearl.left}%`,
            width: pearl.size,
          }}
        />
      ))}
    </div>
  );
}

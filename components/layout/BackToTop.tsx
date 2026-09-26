"use client";

import { useEffect, useState } from "react";

import { useLenis } from "@/lib/animations/useLenis";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";

export function BackToTop() {
  const { lenis } = useLenis();
  const shouldReduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(
        scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0,
      );
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <button
      aria-label="Back to top"
      className="group flex items-center gap-3 text-[0.56rem] uppercase tracking-[0.16em] text-cream/75"
      onClick={() => {
        if (lenis) {
          lenis.scrollTo(
            0,
            shouldReduceMotion ? { immediate: true } : { duration: 2 },
          );
        } else {
          window.scrollTo({
            behavior: shouldReduceMotion ? "auto" : "smooth",
            top: 0,
          });
        }
      }}
      type="button"
    >
      <span className="relative grid h-12 w-12 place-items-center rounded-full border border-gold/30 text-gold transition-colors group-hover:bg-gold group-hover:text-forest">
        <svg
          aria-hidden="true"
          className="absolute inset-[-2px] h-[calc(100%+4px)] w-[calc(100%+4px)] -rotate-90"
          viewBox="0 0 52 52"
        >
          <circle
            cx="26"
            cy="26"
            fill="none"
            r="24"
            stroke="currentColor"
            strokeDasharray="151"
            strokeDashoffset={151 * (1 - progress)}
            strokeWidth="1.5"
          />
        </svg>
        ↑
      </span>
      Back to top
    </button>
  );
}

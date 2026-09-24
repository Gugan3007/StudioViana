"use client";

import { useRef } from "react";

import { gsap } from "@/lib/animations/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { cn } from "@/lib/utils";

interface WordScrubTextProps {
  children: string;
  className?: string;
}

export function WordScrubText({
  children,
  className,
}: WordScrubTextProps) {
  const root = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const words = children.trim().split(/\s+/);

  useIsomorphicLayoutEffect(() => {
    if (shouldReduceMotion || !root.current) return;
    const context = gsap.context(() => {
      // Scrub maps the passage from top 82% to bottom 58%, increasing each
      // word from ghosted to fully readable in natural reading order.
      gsap.fromTo(
        root.current!.querySelectorAll("[data-scrub-word]"),
        { opacity: 0.15 },
        {
          ease: "none",
          opacity: 1,
          stagger: 0.08,
          scrollTrigger: {
            trigger: root.current,
            start: "top 82%",
            end: "bottom 58%",
            scrub: 0.5,
          },
        },
      );
    }, root);

    return () => context.revert();
  }, [children, shouldReduceMotion]);

  return (
    <div ref={root} className={cn(className)}>
      <p className="sr-only">{children}</p>
      <p aria-hidden="true" data-scrub-copy>
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            data-scrub-word
            style={shouldReduceMotion ? { opacity: 1 } : undefined}
          >
            {word}
            {index < words.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
    </div>
  );
}

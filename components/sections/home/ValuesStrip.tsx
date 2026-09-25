"use client";

import { useRef } from "react";

import { gsap } from "@/lib/animations/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";

const values = [
  { label: "Handmade", value: "100%" },
  { label: "Every single piece", value: "Made to Order" },
  { label: "Your colours, your flowers", value: "Custom" },
  { label: "Blooms that never fade", value: "Forever" },
] as const;

export function ValuesStrip() {
  const root = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (!root.current) return;
    const counter = root.current.querySelector<HTMLElement>("[data-count]");
    if (shouldReduceMotion) {
      if (counter) counter.textContent = "100%";
      return;
    }
    const valueCopy = root.current.querySelectorAll("[data-value-copy]");
    const context = gsap.context(() => {
      if (counter) {
        const progress = { value: 0 };
        // The numeric value counts once when the strip reaches 84%; its
        // proxy changes text only and therefore never causes layout movement.
        gsap.to(progress, {
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => {
            counter.textContent = `${Math.round(progress.value)}%`;
          },
          scrollTrigger: {
            trigger: root.current,
            start: "top 84%",
            once: true,
          },
          value: 100,
        });
      }
      gsap.fromTo(
        valueCopy,
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          duration: 0.8,
          stagger: 0.12,
          scrollTrigger: {
            trigger: root.current,
            start: "top 84%",
            once: true,
          },
          y: 0,
        },
      );
    }, root);

    return () => context.revert();
  }, [shouldReduceMotion]);

  return (
    <div
      ref={root}
      className="grid border-y border-gold/30 sm:grid-cols-2 lg:grid-cols-4"
      data-values-strip
    >
      {values.map((item, index) => (
        <div
          key={item.value}
          className="relative px-gutter py-10 text-center sm:px-8 lg:py-12"
          data-value-copy={index > 0 || undefined}
        >
          {index > 0 ? (
            <span className="absolute left-0 top-1/2 hidden h-14 w-px -translate-y-1/2 bg-gold/45 lg:block" />
          ) : null}
          <p
            className="font-display text-[clamp(2rem,3vw,3rem)] leading-none text-gold"
            data-count={index === 0 || undefined}
          >
            {item.value}
          </p>
          <p className="mt-3 text-[0.6rem] uppercase tracking-[0.25em] text-muted">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

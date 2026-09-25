"use client";

import { useEffect, useState } from "react";

import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { trustStats, type TrustStat } from "@/lib/data/testimonials";

interface CountedValueProps {
  active: boolean;
  stat: TrustStat;
}

function CountedValue({ active, stat }: CountedValueProps) {
  const shouldReduceMotion = useReducedMotion();
  const target = stat.numericTarget;
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === undefined || !active) return;
    if (shouldReduceMotion) return;

    let frame = 0;
    const duration = 1_400;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [active, shouldReduceMotion, target]);

  if (target === undefined) return stat.value;
  const displayedValue =
    shouldReduceMotion || !active ? target : Math.min(value, target);
  return `${stat.prefix ?? ""}${displayedValue}${stat.suffix ?? ""}`;
}

export function TrustStats({ active }: { active: boolean }) {
  return (
    <ul className="mx-auto mt-20 grid max-w-6xl grid-cols-2 border-y border-gold/25 md:grid-cols-4">
      {trustStats.map((stat, index) => (
        <li
          key={stat.label}
          className="relative px-4 py-8 text-center md:px-6 md:py-10"
        >
          {index > 0 ? (
            <span
              aria-hidden="true"
              className="absolute bottom-5 left-0 top-5 hidden w-px bg-gold/35 md:block"
            />
          ) : null}
          <strong className="block font-display text-4xl font-normal text-gold md:text-5xl">
            <CountedValue active={active} stat={stat} />
          </strong>
          <span className="mt-2 block font-body text-[0.56rem] uppercase tracking-[0.17em] text-charcoal/55">
            {stat.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

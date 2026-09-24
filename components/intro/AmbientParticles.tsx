"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export interface AmbientParticlesProps {
  className?: string;
  count: number;
}

const particleLayout = [
  { left: "8%", top: "18%", size: "0.42rem", delay: "-2.1s", duration: "12s" },
  { left: "19%", top: "76%", size: "0.65rem", delay: "-7.4s", duration: "15s" },
  { left: "31%", top: "27%", size: "0.3rem", delay: "-5.8s", duration: "13s" },
  { left: "44%", top: "83%", size: "0.52rem", delay: "-9.1s", duration: "17s" },
  { left: "57%", top: "14%", size: "0.38rem", delay: "-3.6s", duration: "14s" },
  {
    left: "68%",
    top: "70%",
    size: "0.72rem",
    delay: "-11.2s",
    duration: "18s",
  },
  {
    left: "79%",
    top: "31%",
    size: "0.34rem",
    delay: "-6.7s",
    duration: "13.5s",
  },
  { left: "90%", top: "62%", size: "0.48rem", delay: "-1.8s", duration: "16s" },
  {
    left: "14%",
    top: "47%",
    size: "0.25rem",
    delay: "-8.6s",
    duration: "12.5s",
  },
  { left: "84%", top: "86%", size: "0.6rem", delay: "-4.3s", duration: "19s" },
] as const;

export function AmbientParticles({ className, count }: AmbientParticlesProps) {
  const root = useRef<HTMLDivElement>(null);
  const visibleParticles = particleLayout.slice(
    0,
    Math.max(0, Math.min(count, particleLayout.length)),
  );

  useEffect(() => {
    const element = root.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        element.dataset.paused = String(!entry.isIntersecting);
      },
      { rootMargin: "10%" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={root}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      data-intro-particles
      data-paused="false"
    >
      {visibleParticles.map((particle) => (
        <span
          key={`${particle.left}-${particle.top}`}
          className="intro-particle bg-gold-light/60 absolute block rounded-full blur-[2px]"
          data-intro-particle
          style={{
            animationDelay: particle.delay,
            animationDuration: particle.duration,
            height: particle.size,
            left: particle.left,
            top: particle.top,
            width: particle.size,
          }}
        />
      ))}
    </div>
  );
}

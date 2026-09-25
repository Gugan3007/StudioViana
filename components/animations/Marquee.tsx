"use client";

import { useRef } from "react";

import { gsap, ScrollTrigger } from "@/lib/animations/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useFinePointer } from "@/lib/animations/useFinePointer";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  className?: string;
  direction?: "left" | "right";
  speed?: number;
  text: string;
}

export function Marquee({
  className,
  direction = "left",
  speed = 24,
  text,
}: MarqueeProps) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const hasFinePointer = useFinePointer();

  useIsomorphicLayoutEffect(() => {
    if (
      shouldReduceMotion ||
      !hasFinePointer ||
      !root.current ||
      !track.current
    )
      return;

    const timeline = gsap.timeline({ repeat: -1 });
    timeline.to(track.current, {
      xPercent: direction === "left" ? -50 : 50,
      duration: speed,
      ease: "none",
      modifiers: {
        xPercent: (value: string) => String(Number.parseFloat(value) % 50),
      },
    });

    // The single loop is retained for the component lifetime. Intersection
    // state only pauses or resumes it, avoiding off-screen animation work.
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) timeline.play();
            else timeline.pause();
          });
    observer?.observe(root.current);

    let velocityTween: gsap.core.Tween | undefined;
    const trigger = ScrollTrigger.create({
      trigger: root.current,
      start: "top bottom",
      end: "bottom top",
      onUpdate(self) {
        const velocity = self.getVelocity();
        const magnitude = Math.min(
          3,
          Math.max(0.6, 1 + Math.abs(velocity) / 2000),
        );
        // Scrolling upward reverses the existing loop momentarily; the tween
        // changes only timeScale, never reconstructing the marquee timeline.
        const timeScale = velocity < 0 ? -magnitude : magnitude;
        velocityTween?.kill();
        velocityTween = gsap.to(timeline, {
          timeScale,
          duration: 0.35,
          overwrite: true,
        });
      },
    });

    return () => {
      velocityTween?.kill();
      observer?.disconnect();
      trigger.kill();
      timeline.kill();
    };
  }, [direction, hasFinePointer, shouldReduceMotion, speed]);

  return (
    <div ref={root} className={cn("overflow-hidden", className)}>
      <span className="sr-only">{text}</span>
      <div
        ref={track}
        className="flex w-max whitespace-nowrap will-change-transform"
      >
        {[0, 1].map((copy) => (
          <span key={copy} aria-hidden="true" className="shrink-0 pr-12">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

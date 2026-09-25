"use client";

import { useRef } from "react";

import { gsap, ScrollTrigger } from "@/lib/animations/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useFinePointer } from "@/lib/animations/useFinePointer";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { cn } from "@/lib/utils";

export interface MarqueeProps {
  className?: string;
  direction?: "left" | "right";
  reverse?: boolean;
  skew?: boolean;
  speed?: number;
  text: string;
  velocityFactor?: number;
}

export function Marquee({
  className,
  direction = "left",
  reverse = false,
  skew = false,
  speed = 24,
  text,
  velocityFactor = 1,
}: MarqueeProps) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const visible = useRef(true);
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

    const effectiveDirection = reverse
      ? direction === "left"
        ? "right"
        : "left"
      : direction;
    const fromX = effectiveDirection === "left" ? 0 : -50;
    const toX = effectiveDirection === "left" ? -50 : 0;
    const timeline = gsap.timeline({ repeat: -1 });
    timelineRef.current = timeline;
    timeline.fromTo(
      track.current,
      { xPercent: fromX },
      {
        xPercent: toX,
        duration: speed,
        ease: "none",
      },
    );

    // The single loop is retained for the component lifetime. Intersection
    // state only pauses or resumes it, avoiding off-screen animation work.
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) => {
            visible.current = entry.isIntersecting;
            if (entry.isIntersecting) timeline.play();
            else timeline.pause();
          });
    observer?.observe(root.current);

    let velocityTween: gsap.core.Tween | undefined;
    let settleTimer = 0;
    const skewTo = skew
      ? gsap.quickTo(root.current, "skewX", {
          duration: 0.35,
          ease: "power3.out",
        })
      : null;
    const trigger = ScrollTrigger.create({
      trigger: root.current,
      start: "top bottom",
      end: "bottom top",
      onUpdate(self) {
        const velocity = self.getVelocity();
        const magnitude = Math.min(
          3,
          Math.max(0.6, 1 + (Math.abs(velocity) / 2000) * velocityFactor),
        );
        // Scroll velocity becomes a clamped multiplier on the one retained
        // loop. Its sign flips the row while quickTo maps velocity / 300 into
        // a smoothed, capped eight-degree wrapper skew.
        const timeScale = (velocity < 0 ? -1 : 1) * magnitude;
        velocityTween?.kill();
        velocityTween = gsap.to(timeline, {
          timeScale,
          duration: 0.35,
          overwrite: true,
        });
        skewTo?.(Math.min(8, Math.max(-8, velocity / 300)));
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(() => {
          velocityTween?.kill();
          velocityTween = gsap.to(timeline, {
            duration: 0.8,
            overwrite: true,
            timeScale: 1,
          });
          skewTo?.(0);
        }, 180);
      },
    });

    return () => {
      window.clearTimeout(settleTimer);
      velocityTween?.kill();
      skewTo?.tween?.kill();
      observer?.disconnect();
      trigger.kill();
      timeline.kill();
      gsap.set(track.current, { clearProps: "transform" });
      gsap.set(root.current, { clearProps: "transform" });
      timelineRef.current = null;
    };
  }, [
    direction,
    hasFinePointer,
    reverse,
    shouldReduceMotion,
    skew,
    speed,
    velocityFactor,
  ]);

  return (
    <div
      ref={root}
      className={cn("overflow-hidden", className)}
      onPointerEnter={() => timelineRef.current?.pause()}
      onPointerLeave={() => {
        if (visible.current) timelineRef.current?.play();
      }}
    >
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

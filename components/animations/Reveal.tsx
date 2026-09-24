"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { useRef } from "react";

import { gsap } from "@/lib/animations/gsap";
import { motionTokens } from "@/lib/animations/tokens";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { cn } from "@/lib/utils";

interface RevealProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children: ReactNode;
  delay?: number;
  distance?: number;
  once?: boolean;
  stagger?: number;
}

export function Reveal({
  children,
  className,
  delay = 0,
  distance = motionTokens.revealDistance,
  once = true,
  stagger,
  style,
  ...props
}: RevealProps) {
  const root = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (shouldReduceMotion || !root.current) return;

    const context = gsap.context(() => {
      const target = stagger
        ? root.current!.querySelectorAll("[data-reveal-item]")
        : root.current;

      gsap.fromTo(
        target,
        { autoAlpha: 0, y: distance },
        {
          autoAlpha: 1,
          delay,
          duration: motionTokens.duration.base,
          stagger,
          y: 0,
          scrollTrigger: { trigger: root.current, start: "top 85%", once },
        },
      );
    }, root);

    return () => context.revert();
  }, [delay, distance, once, shouldReduceMotion, stagger]);

  return (
    <div
      ref={root}
      className={cn(className)}
      style={
        shouldReduceMotion
          ? { ...style, opacity: 1, transform: "none", visibility: "visible" }
          : style
      }
      {...props}
    >
      {children}
    </div>
  );
}

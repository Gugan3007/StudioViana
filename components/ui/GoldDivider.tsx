"use client";

import type { HTMLAttributes } from "react";
import { useRef } from "react";

import { gsap } from "@/lib/animations/gsap";
import { motionTokens } from "@/lib/animations/tokens";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { cn } from "@/lib/utils";

interface GoldDividerProps extends HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
}

export function GoldDivider({
  animate,
  className,
  style,
  ...props
}: GoldDividerProps) {
  const divider = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (!animate || shouldReduceMotion || !divider.current) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        divider.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: motionTokens.duration.base,
          transformOrigin: "left center",
          scrollTrigger: {
            trigger: divider.current,
            start: "top 85%",
            once: true,
          },
        },
      );
    }, divider);

    return () => context.revert();
  }, [animate, shouldReduceMotion]);

  return (
    <div
      ref={divider}
      aria-hidden="true"
      className={cn("h-0.5 w-14 origin-left bg-gold", className)}
      data-animate={animate || undefined}
      style={
        animate && shouldReduceMotion
          ? { ...style, transform: "scaleX(1)" }
          : style
      }
      {...props}
    />
  );
}

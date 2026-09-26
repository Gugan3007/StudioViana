"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { gsap } from "gsap";

import { motionTokens } from "@/lib/animations/tokens";
import { useFinePointer } from "@/lib/animations/useFinePointer";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { cn } from "@/lib/utils";

interface MagneticProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  strength?: number;
}

export function Magnetic({
  children,
  className,
  disabled = false,
  strength = 0.3,
}: MagneticProps) {
  const root = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  const movers = useRef<{
    innerX: ReturnType<typeof gsap.quickTo>;
    innerY: ReturnType<typeof gsap.quickTo>;
    rootX: ReturnType<typeof gsap.quickTo>;
    rootY: ReturnType<typeof gsap.quickTo>;
  } | null>(null);
  const hasFinePointer = useFinePointer();
  const shouldReduceMotion = useReducedMotion();
  const enabled = hasFinePointer && !shouldReduceMotion && !disabled;

  useIsomorphicLayoutEffect(() => {
    if (!enabled || !root.current || !inner.current) {
      movers.current = null;
      return;
    }
    const options = {
      duration: motionTokens.duration.fast,
      ease: motionTokens.ease.ui,
    };
    movers.current = {
      innerX: gsap.quickTo(inner.current, "x", options),
      innerY: gsap.quickTo(inner.current, "y", options),
      rootX: gsap.quickTo(root.current, "x", options),
      rootY: gsap.quickTo(root.current, "y", options),
    };
    return () => {
      gsap.killTweensOf([root.current, inner.current]);
      movers.current = null;
    };
  }, [enabled]);

  const move = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (!enabled || !root.current || !movers.current) return;
    const bounds = root.current.getBoundingClientRect();
    const x = event.clientX - (bounds.left + bounds.width / 2);
    const y = event.clientY - (bounds.top + bounds.height / 2);
    movers.current.rootX(x * strength);
    movers.current.rootY(y * strength);
    movers.current.innerX(x * strength * 0.5);
    movers.current.innerY(y * strength * 0.5);
  };

  const reset = () => {
    if (!root.current || !inner.current) return;
    gsap.to([root.current, inner.current], {
      duration: motionTokens.duration.base,
      ease: motionTokens.ease.magnetic,
      overwrite: true,
      x: 0,
      y: 0,
    });
  };

  return (
    <span
      ref={root}
      className={cn("inline-flex max-w-full align-middle", className)}
      data-magnetic-root
      onPointerLeave={reset}
      onPointerMove={move}
    >
      <span ref={inner} className="inline-flex max-w-full" data-magnetic-inner>
        {children}
      </span>
    </span>
  );
}

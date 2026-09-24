"use client";

import { type ReactNode, useId, useRef } from "react";

import { gsap } from "@/lib/animations/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { cn } from "@/lib/utils";

interface FloatProps {
  children: ReactNode;
  className?: string;
  mouseParallax?: number;
  strength?: number;
}

export function Float({
  children,
  className,
  mouseParallax = 12,
  strength = 14,
}: FloatProps) {
  const floatLayer = useRef<HTMLDivElement>(null);
  const pointerLayer = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const id = useId();
  const offset =
    [...id].reduce((total, character) => total + character.charCodeAt(0), 0) %
    10;

  useIsomorphicLayoutEffect(() => {
    if (shouldReduceMotion || !floatLayer.current || !pointerLayer.current)
      return;

    const floatingTween = gsap.to(floatLayer.current, {
      y: strength,
      duration: 2.8 + offset / 10,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
    const pointerMedia = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    );
    const handlePointer = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * mouseParallax;
      const y = (event.clientY / window.innerHeight - 0.5) * mouseParallax;
      gsap.to(pointerLayer.current, { x, y, duration: 0.8, overwrite: "auto" });
    };
    const syncPointer = () => {
      window.removeEventListener("pointermove", handlePointer);
      if (pointerMedia.matches)
        window.addEventListener("pointermove", handlePointer);
    };

    syncPointer();
    pointerMedia.addEventListener("change", syncPointer);

    return () => {
      pointerMedia.removeEventListener("change", syncPointer);
      window.removeEventListener("pointermove", handlePointer);
      floatingTween.kill();
    };
  }, [mouseParallax, offset, shouldReduceMotion, strength]);

  return (
    <div ref={floatLayer} className={cn("will-change-transform", className)}>
      <div ref={pointerLayer} className="will-change-transform">
        {children}
      </div>
    </div>
  );
}

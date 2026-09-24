"use client";

import { type ReactNode, useId, useRef } from "react";

import { gsap } from "@/lib/animations/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { cn } from "@/lib/utils";

interface FloatProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  enabled?: boolean;
  mouseParallax?: number;
  strength?: number;
}

export function Float({
  children,
  className,
  delay = 0,
  duration,
  enabled = true,
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
    if (
      !enabled ||
      shouldReduceMotion ||
      !floatLayer.current ||
      !pointerLayer.current
    )
      return;

    const floatingTween = gsap.to(floatLayer.current, {
      y: strength,
      delay,
      duration: duration ?? 4.8 + offset / 4,
      ease: "sine.inOut",
      paused: true,
      repeat: -1,
      yoyo: true,
    });
    const visibilityObserver =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) => {
            if (entry?.isIntersecting) floatingTween.play();
            else floatingTween.pause();
          });
    if (visibilityObserver) visibilityObserver.observe(floatLayer.current);
    else floatingTween.play();

    const pointerMedia = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    );
    const moveX = gsap.quickTo(pointerLayer.current, "x", {
      duration: 0.8,
      ease: "power3.out",
    });
    const moveY = gsap.quickTo(pointerLayer.current, "y", {
      duration: 0.8,
      ease: "power3.out",
    });
    const handlePointer = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * mouseParallax;
      const y = (event.clientY / window.innerHeight - 0.5) * mouseParallax;
      moveX(x);
      moveY(y);
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
      visibilityObserver?.disconnect();
      floatingTween.kill();
    };
  }, [
    delay,
    duration,
    enabled,
    mouseParallax,
    offset,
    shouldReduceMotion,
    strength,
  ]);

  return (
    <div ref={floatLayer} className={cn("will-change-transform", className)}>
      <div ref={pointerLayer} className="will-change-transform">
        {children}
      </div>
    </div>
  );
}

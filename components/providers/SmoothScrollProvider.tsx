"use client";

import Lenis from "lenis";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import { gsap, ScrollTrigger } from "@/lib/animations/gsap";
import { LenisContext } from "@/lib/animations/useLenis";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const shouldReduceMotion = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const instance = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
      syncTouch: false,
    });
    const unsubscribe = instance.on("scroll", ScrollTrigger.update);
    const update = (time: number) => instance.raf(time * 1000);

    gsap.ticker.lagSmoothing(0);
    gsap.ticker.add(update);
    // The external Lenis instance becomes available only after client mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(instance);

    return () => {
      gsap.ticker.remove(update);
      unsubscribe();
      instance.destroy();
      setLenis(null);
    };
  }, [shouldReduceMotion]);

  const value = useMemo(() => ({ lenis }), [lenis]);

  return (
    <LenisContext.Provider value={value}>{children}</LenisContext.Provider>
  );
}

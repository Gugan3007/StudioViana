"use client";

import Lenis from "lenis";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import { gsap, ScrollTrigger } from "@/lib/animations/gsap";
import { motionTokens } from "@/lib/animations/tokens";
import { LenisContext } from "@/lib/animations/useLenis";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const shouldReduceMotion = useReducedMotion();
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setHasFinePointer(pointer.matches);

    update();
    pointer.addEventListener("change", update);
    return () => pointer.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (shouldReduceMotion || !hasFinePointer) return;

    const instance = new Lenis({ ...motionTokens.lenis });
    const unsubscribe = instance.on("scroll", ScrollTrigger.update);
    const update = (time: number) => instance.raf(time * 1000);

    gsap.ticker.lagSmoothing(500, 33);
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
  }, [hasFinePointer, shouldReduceMotion]);

  const value = useMemo(() => ({ lenis }), [lenis]);

  return (
    <LenisContext.Provider value={value}>{children}</LenisContext.Provider>
  );
}

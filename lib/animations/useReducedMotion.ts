"use client";

import { useState } from "react";

import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useOptionalMotionPreferences } from "@/lib/context/MotionContext";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

export function useReducedMotion() {
  const context = useOptionalMotionPreferences();
  const [shouldReduceMotion, setShouldReduceMotion] = useState(() => false);

  useIsomorphicLayoutEffect(() => {
    const mediaQuery = window.matchMedia(reducedMotionQuery);
    const handleChange = (event: MediaQueryListEvent) =>
      setShouldReduceMotion(event.matches);

    setShouldReduceMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return context?.shouldReduceMotion ?? shouldReduceMotion;
}

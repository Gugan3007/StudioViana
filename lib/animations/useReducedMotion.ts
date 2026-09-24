"use client";

import { useState } from "react";

import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function getInitialPreference() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(reducedMotionQuery).matches
  );
}

export function useReducedMotion() {
  const [shouldReduceMotion, setShouldReduceMotion] =
    useState(getInitialPreference);

  useIsomorphicLayoutEffect(() => {
    const mediaQuery = window.matchMedia(reducedMotionQuery);
    const handleChange = (event: MediaQueryListEvent) =>
      setShouldReduceMotion(event.matches);

    setShouldReduceMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return shouldReduceMotion;
}

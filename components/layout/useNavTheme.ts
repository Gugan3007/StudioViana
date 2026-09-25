"use client";

import type Lenis from "lenis";
import { useCallback, useEffect, useRef, useState } from "react";

export type NavTheme = "dark" | "light";

export function useNavTheme(lenis: Lenis | null): NavTheme {
  const [theme, setTheme] = useState<NavTheme>("light");
  const sampleFrame = useRef<number | null>(null);

  const sampleTheme = useCallback(() => {
    if (typeof document.elementsFromPoint !== "function") {
      setTheme((current) => (current === "light" ? current : "light"));
      return;
    }

    const section = document
      .elementsFromPoint(window.innerWidth / 2, 42)
      .map((element) => element.closest<HTMLElement>("[data-theme]"))
      .find((element): element is HTMLElement => Boolean(element));
    const nextTheme = section?.dataset.theme === "dark" ? "dark" : "light";
    setTheme((current) => (current === nextTheme ? current : nextTheme));
  }, []);

  const scheduleSample = useCallback(() => {
    if (sampleFrame.current !== null) return;
    sampleFrame.current = window.requestAnimationFrame(() => {
      sampleFrame.current = null;
      sampleTheme();
    });
  }, [sampleTheme]);

  useEffect(() => {
    scheduleSample();
    if (lenis) {
      const unsubscribe = lenis.on("scroll", scheduleSample);
      return () => {
        if (sampleFrame.current !== null) {
          window.cancelAnimationFrame(sampleFrame.current);
          sampleFrame.current = null;
        }
        unsubscribe();
      };
    }

    window.addEventListener("scroll", scheduleSample, { passive: true });
    window.addEventListener("resize", scheduleSample);
    return () => {
      if (sampleFrame.current !== null) {
        window.cancelAnimationFrame(sampleFrame.current);
        sampleFrame.current = null;
      }
      window.removeEventListener("scroll", scheduleSample);
      window.removeEventListener("resize", scheduleSample);
    };
  }, [lenis, scheduleSample]);

  return theme;
}

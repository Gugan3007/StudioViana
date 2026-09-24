"use client";

import type Lenis from "lenis";
import { useCallback, useEffect, useState } from "react";

export type NavTheme = "dark" | "light";

export function useNavTheme(lenis: Lenis | null): NavTheme {
  const [theme, setTheme] = useState<NavTheme>("light");

  const sampleTheme = useCallback(() => {
    if (typeof document.elementsFromPoint !== "function") {
      setTheme("light");
      return;
    }

    const section = document
      .elementsFromPoint(window.innerWidth / 2, 42)
      .map((element) => element.closest<HTMLElement>("section[data-theme]"))
      .find((element): element is HTMLElement => Boolean(element));
    setTheme(section?.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  useEffect(() => {
    const initialFrame = window.requestAnimationFrame(sampleTheme);
    if (lenis) {
      const unsubscribe = lenis.on("scroll", sampleTheme);
      return () => {
        window.cancelAnimationFrame(initialFrame);
        unsubscribe();
      };
    }

    window.addEventListener("scroll", sampleTheme, { passive: true });
    window.addEventListener("resize", sampleTheme);
    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.removeEventListener("scroll", sampleTheme);
      window.removeEventListener("resize", sampleTheme);
    };
  }, [lenis, sampleTheme]);

  return theme;
}

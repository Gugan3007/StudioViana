"use client";

import { useEffect } from "react";

const themeColors = {
  dark: "#1F3326",
  light: "#F7F0E6",
} as const;

export function DynamicThemeColor() {
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-theme]"),
    );
    if (!sections.length || typeof IntersectionObserver === "undefined") return;

    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const active = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const theme = (active?.target as HTMLElement | undefined)?.dataset
          .theme as keyof typeof themeColors | undefined;
        if (meta && theme && themeColors[theme]) {
          meta.content = themeColors[theme];
        }
      },
      { rootMargin: "-38% 0px -38% 0px", threshold: [0, 0.25, 0.5, 0.75] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return null;
}

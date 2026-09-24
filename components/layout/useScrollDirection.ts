"use client";

import type Lenis from "lenis";
import { useEffect, useRef, useState } from "react";

export type ScrollDirection = "down" | "up";

const MINIMUM_DIRECTION_DELTA = 2;

export function useScrollDirection(lenis: Lenis | null): ScrollDirection {
  const [direction, setDirection] = useState<ScrollDirection>("up");
  const previousScroll = useRef(0);

  useEffect(() => {
    previousScroll.current = lenis?.animatedScroll ?? window.scrollY;

    const update = (currentScroll: number) => {
      const delta = currentScroll - previousScroll.current;
      if (Math.abs(delta) < MINIMUM_DIRECTION_DELTA) return;

      previousScroll.current = currentScroll;
      setDirection(delta > 0 ? "down" : "up");
    };

    if (lenis) {
      return lenis.on("scroll", (instance) => update(instance.animatedScroll));
    }

    const handleNativeScroll = () => update(window.scrollY);
    window.addEventListener("scroll", handleNativeScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleNativeScroll);
  }, [lenis]);

  return direction;
}

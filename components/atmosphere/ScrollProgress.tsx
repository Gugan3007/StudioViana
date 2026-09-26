"use client";

import { useEffect, useRef } from "react";

import { useLenis } from "@/lib/animations/useLenis";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { useIntro } from "@/lib/context/IntroContext";
import { useOverlay } from "@/lib/context/OverlayContext";

export function ScrollProgress() {
  const line = useRef<HTMLDivElement>(null);
  const { lenis } = useLenis();
  const { introComplete } = useIntro();
  const { overlayOpen } = useOverlay();
  const shouldReduceMotion = useReducedMotion();
  const visible = introComplete && !overlayOpen;

  useEffect(() => {
    const update = (position = window.scrollY) => {
      const scrollable = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const progress = Math.min(1, Math.max(0, position / scrollable));
      line.current?.style.setProperty("--scroll-progress", String(progress));
    };

    update(lenis?.animatedScroll ?? window.scrollY);
    if (lenis) return lenis.on("scroll", (event) => update(event.scroll));

    const handleScroll = () => update();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [lenis]);

  return (
    <div
      aria-hidden="true"
      className="scroll-progress"
      data-reduced-motion={shouldReduceMotion || undefined}
      data-testid="scroll-progress"
      data-visible={String(visible)}
    >
      <div ref={line} className="scroll-progress__line" />
    </div>
  );
}

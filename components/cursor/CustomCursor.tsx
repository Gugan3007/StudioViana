"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

import { useCursor } from "@/components/cursor/useCursor";
import { motionTokens } from "@/lib/animations/tokens";
import { useFinePointer } from "@/lib/animations/useFinePointer";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { useIntro } from "@/lib/context/IntroContext";
import { cn } from "@/lib/utils";

const labels = {
  drag: (
    <span className="flex items-center gap-1.5">
      <span aria-hidden="true">←</span> Drag <span aria-hidden="true">→</span>
    </span>
  ),
  view: "View",
} as const;

export function CustomCursor() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  const ring = useRef<HTMLSpanElement>(null);
  const last = useRef({ time: 0, x: 0, y: 0 });
  const state = useCursor();
  const hasFinePointer = useFinePointer();
  const shouldReduceMotion = useReducedMotion();
  const { introComplete } = useIntro();
  const enabled = hasFinePointer && !shouldReduceMotion && introComplete;
  const label =
    state === "drag" ? labels.drag : state === "view" ? labels.view : null;

  useEffect(() => {
    if (!enabled || !dot.current || !ring.current || !root.current) return;
    const dotX = gsap.quickTo(dot.current, "x", {
      duration: 0.1,
      ease: motionTokens.ease.ui,
    });
    const dotY = gsap.quickTo(dot.current, "y", {
      duration: 0.1,
      ease: motionTokens.ease.ui,
    });
    const ringX = gsap.quickTo(ring.current, "x", {
      duration: 0.45,
      ease: motionTokens.ease.ui,
    });
    const ringY = gsap.quickTo(ring.current, "y", {
      duration: 0.45,
      ease: motionTokens.ease.ui,
    });
    const stretch = gsap.quickTo(ring.current, "scaleX", {
      duration: motionTokens.duration.fast,
      ease: motionTokens.ease.ui,
    });
    const rotate = gsap.quickTo(ring.current, "rotation", {
      duration: motionTokens.duration.fast,
      ease: motionTokens.ease.ui,
    });

    document.body.dataset.customCursor = "true";
    const move = (event: PointerEvent) => {
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);

      const now = performance.now();
      const dx = event.clientX - last.current.x;
      const dy = event.clientY - last.current.y;
      const elapsed = Math.max(16, now - last.current.time);
      const velocity = Math.min(1, Math.hypot(dx, dy) / elapsed / 1.2);
      stretch(1 + velocity * 0.3);
      rotate((Math.atan2(dy, dx) * 180) / Math.PI);
      last.current = { time: now, x: event.clientX, y: event.clientY };

      const themed = document
        .elementsFromPoint(event.clientX, event.clientY)
        .find((element) => element.closest('[data-theme="dark"]'));
      root.current!.dataset.tone = themed ? "dark" : "light";
    };
    const settle = () => stretch(1);
    const press = () =>
      gsap.fromTo(
        ring.current,
        { scale: 0.85 },
        { duration: 0.26, ease: motionTokens.ease.ui, scale: 1 },
      );
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", settle, { passive: true });
    window.addEventListener("pointerdown", press, { passive: true });
    return () => {
      delete document.body.dataset.customCursor;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", settle);
      window.removeEventListener("pointerdown", press);
    };
  }, [enabled]);

  if (!enabled) return null;

  const labelled = label !== null;
  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[175] text-gold"
      data-custom-cursor
      data-state={state}
      data-tone="light"
    >
      <span
        ref={dot}
        className={cn(
          "absolute -left-[3px] -top-[3px] h-1.5 w-1.5 rounded-full bg-current transition-opacity duration-300",
          state !== "default" && "opacity-0",
        )}
      />
      <span
        ref={ring}
        className={cn(
          "absolute left-0 top-0 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-current transition-[width,height,opacity,background-color,border-radius] duration-[350ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
          state === "default" && "h-9 w-9",
          state === "link" && "h-14 w-14 bg-gold/10",
          labelled && "h-[5.5rem] w-[5.5rem] bg-cream text-forest",
          state === "text" && "h-5 w-0.5 rounded-none bg-gold",
          (state === "zoom" || state === "hidden") && "opacity-0",
        )}
      >
        {labelled ? (
          <span className="font-body text-[0.68rem] font-medium uppercase tracking-[0.18em]">
            {label}
          </span>
        ) : null}
      </span>
    </div>
  );
}

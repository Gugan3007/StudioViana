"use client";

import { useCallback, useRef, useState } from "react";

import { gsap } from "@/lib/animations/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { craftMotion } from "@/lib/data/process";

export interface StemPoint {
  x: number;
  y: number;
}

export function buildStemPath(points: readonly StemPoint[]) {
  if (points.length === 0) return "";

  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index];
    const middleY = (previous.y + point.y) / 2;
    return `${path} C ${previous.x} ${middleY}, ${point.x} ${middleY}, ${point.x} ${point.y}`;
  }, `M ${points[0].x} ${points[0].y}`);
}

export function StemPath() {
  const svg = useRef<SVGSVGElement>(null);
  const pathElement = useRef<SVGPathElement>(null);
  const [path, setPath] = useState("");
  const shouldReduceMotion = useReducedMotion();

  const measure = useCallback(() => {
    const timeline = svg.current?.closest<HTMLElement>(
      "[data-process-timeline]",
    );
    if (!timeline) return;

    const bounds = timeline.getBoundingClientRect();
    const nodes = Array.from(
      timeline.querySelectorAll<HTMLElement>("[data-process-node]"),
    );
    // Each node centre is converted from viewport coordinates into timeline
    // coordinates, then buildStemPath joins the points with soft cubic bends.
    setPath(
      buildStemPath(
        nodes.map((node) => {
          const rect = node.getBoundingClientRect();
          return {
            x: rect.left - bounds.left + rect.width / 2,
            y: rect.top - bounds.top + rect.height / 2,
          };
        }),
      ),
    );
  }, []);

  useIsomorphicLayoutEffect(() => {
    measure();
    if (typeof ResizeObserver === "undefined" || !svg.current?.parentElement) {
      return;
    }

    let resizeTimer = 0;
    const observer = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measure, craftMotion.resizeDebounceMs);
    });
    observer.observe(svg.current.parentElement);

    return () => {
      window.clearTimeout(resizeTimer);
      observer.disconnect();
    };
  }, [measure]);

  useIsomorphicLayoutEffect(() => {
    const drawnPath = pathElement.current;
    if (!drawnPath || !path || shouldReduceMotion) return;

    const length =
      typeof drawnPath.getTotalLength === "function"
        ? drawnPath.getTotalLength()
        : 1;
    // The measured length becomes both dash and offset; ScrollTrigger scrubs
    // the offset to zero so the one continuous stem grows through every node.
    gsap.set(drawnPath, { strokeDasharray: length, strokeDashoffset: length });
    const tween = gsap.to(drawnPath, {
      ease: "none",
      scrollTrigger: {
        end: "bottom 70%",
        scrub: true,
        start: "top 70%",
        trigger: svg.current?.parentElement,
      },
      strokeDashoffset: 0,
    });

    return () => tween.kill();
  }, [path, shouldReduceMotion]);

  return (
    <svg
      ref={svg}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
    >
      <path
        ref={pathElement}
        d={path}
        data-stem-path
        fill="none"
        stroke="currentColor"
        strokeDashoffset={shouldReduceMotion ? 0 : undefined}
        strokeLinecap="round"
        strokeWidth="1.25"
        className="text-gold/70"
        style={shouldReduceMotion ? { strokeDashoffset: 0 } : undefined}
      />
    </svg>
  );
}

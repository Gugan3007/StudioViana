"use client";

import { Fragment, useRef } from "react";

import { gsap } from "@/lib/animations/gsap";
import { motionTokens } from "@/lib/animations/tokens";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { cn } from "@/lib/utils";

interface SplitTextRevealProps {
  as?: "h1" | "h2" | "h3" | "p";
  children: string;
  className?: string;
  controlled?: boolean;
  delay?: number;
  id?: string;
  type?: "words" | "lines";
}

export function SplitTextReveal({
  as = "h2",
  children,
  className,
  controlled = false,
  delay = 0,
  id,
  type = "words",
}: SplitTextRevealProps) {
  const Component = as;
  const root = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const tokens =
    type === "lines" ? children.split("\n") : children.split(/(\s+)/);

  useIsomorphicLayoutEffect(() => {
    if (controlled || shouldReduceMotion || !root.current) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        root.current!.querySelectorAll("[data-split-token]"),
        { autoAlpha: 0, yPercent: 110 },
        {
          autoAlpha: 1,
          delay,
          duration: motionTokens.duration.slow,
          stagger: motionTokens.stagger,
          yPercent: 0,
          scrollTrigger: {
            trigger: root.current,
            start: "top 85%",
            once: true,
          },
        },
      );
    }, root);

    return () => context.revert();
  }, [children, controlled, delay, shouldReduceMotion, type]);

  return (
    <div
      ref={root}
      className="contents"
      data-controlled-split={controlled || undefined}
    >
      <Component
        aria-label={children.replace(/\s+/g, " ")}
        className={cn(className)}
        id={id}
      >
        <span className="sr-only">{children}</span>
        <span aria-hidden="true">
          {tokens.map((token, index) => {
            if (type === "words" && /^\s+$/.test(token)) return token;

            return (
              <Fragment key={`${token}-${index}`}>
                <span
                  className={cn(
                    "overflow-hidden",
                    type === "lines" ? "block" : "inline-block",
                  )}
                >
                  <span
                    className="inline-block"
                    data-split-token
                    style={
                      shouldReduceMotion
                        ? { opacity: 1, transform: "translateY(0)" }
                        : undefined
                    }
                  >
                    {token}
                  </span>
                </span>
              </Fragment>
            );
          })}
        </span>
      </Component>
    </div>
  );
}

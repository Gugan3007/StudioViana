"use client";

import { motion } from "framer-motion";

import { motionTokens } from "@/lib/animations/tokens";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";

export type CurtainPhase = "cover" | "idle" | "reveal";

export function CurtainWipe({ phase }: { phase: CurtainPhase }) {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return null;

  const x = phase === "idle" ? "-100%" : phase === "cover" ? "0%" : "100%";
  return (
    <motion.div
      aria-hidden="true"
      animate={{ x }}
      className="pointer-events-none fixed inset-0 z-[220] grid place-items-center bg-forest text-gold"
      data-curtain-phase={phase}
      data-route-curtain
      data-transition-state={phase}
      initial={false}
      transition={{
        duration:
          phase === "cover"
            ? motionTokens.overlay.enter
            : motionTokens.overlay.exit,
        ease: motionTokens.ease.framerExpo,
      }}
    >
      <span className="font-display text-2xl tracking-[-0.03em]">
        Studio Viana
      </span>
    </motion.div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

import { useLenis } from "@/lib/animations/useLenis";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";

export interface SkipIntroProps {
  destinationId: string;
  visible: boolean;
}

export function SkipIntro({ destinationId, visible }: SkipIntroProps) {
  const { lenis } = useLenis();
  const reducedMotion = useReducedMotion();
  const [skipping, setSkipping] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current !== null) clearTimeout(resetTimer.current);
    },
    [],
  );

  if (!visible) return null;

  const handleSkip = () => {
    if (skipping) return;
    const destination = document.getElementById(destinationId);
    if (!destination) return;

    setSkipping(true);
    if (lenis && !reducedMotion) {
      lenis.scrollTo(destination, { duration: 1.6 });
    } else {
      destination.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }

    resetTimer.current = setTimeout(() => setSkipping(false), 1700);
  };

  return (
    <button
      className="group fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-[max(1.5rem,env(safe-area-inset-right))] z-50 overflow-hidden pb-1 font-body text-[0.62rem] font-medium uppercase tracking-[0.24em] text-gold-light disabled:cursor-wait disabled:opacity-50"
      disabled={skipping}
      onClick={handleSkip}
      type="button"
    >
      Skip intro
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-px w-full origin-right scale-x-0 bg-gold-light transition-transform duration-500 group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100"
      />
    </button>
  );
}

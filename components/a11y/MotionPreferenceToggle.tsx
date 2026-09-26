"use client";

import { useMotionPreferences } from "@/lib/context/MotionContext";
import { cn } from "@/lib/utils";

export function MotionPreferenceToggle({ className }: { className?: string }) {
  const { setPreference, shouldReduceMotion } = useMotionPreferences();
  const label = `Reduce motion: ${shouldReduceMotion ? "on" : "off"}`;

  return (
    <button
      aria-label={label}
      aria-pressed={shouldReduceMotion}
      className={cn(
        "inline-flex min-h-11 items-center gap-3 font-body text-[0.58rem] uppercase tracking-[0.16em] text-cream/65 transition-colors hover:text-gold-light",
        className,
      )}
      onClick={() => setPreference(shouldReduceMotion ? "full" : "reduce")}
      type="button"
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative h-5 w-9 rounded-full border border-gold/60 transition-colors",
          shouldReduceMotion && "bg-gold/25",
        )}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 h-3.5 w-3.5 rounded-full bg-gold transition-transform",
            shouldReduceMotion && "translate-x-4",
          )}
        />
      </span>
      {label}
    </button>
  );
}

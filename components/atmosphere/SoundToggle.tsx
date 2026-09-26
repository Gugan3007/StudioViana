"use client";

import { useAmbientSound } from "@/components/atmosphere/AmbientAudio";
import { cn } from "@/lib/utils";

export function SoundToggle({ className }: { className?: string }) {
  const sound = useAmbientSound();
  if (!sound) return null;

  return (
    <button
      aria-label={`Turn ambient sound ${sound.enabled ? "off" : "on"}`}
      aria-pressed={sound.enabled}
      className={cn(
        "grid h-11 min-w-11 place-items-center rounded-full border border-gold/40 bg-forest/80 px-3 text-[0.52rem] uppercase tracking-[0.12em] text-cream backdrop-blur-md",
        className,
      )}
      data-cursor="link"
      onClick={sound.toggle}
      type="button"
    >
      <span aria-hidden="true">
        {sound.enabled ? "Sound · on" : "Sound · off"}
      </span>
    </button>
  );
}

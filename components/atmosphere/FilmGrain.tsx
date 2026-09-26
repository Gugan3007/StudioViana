"use client";

import { useSyncExternalStore } from "react";

import { useOptionalMotionPreferences } from "@/lib/context/MotionContext";

function subscribeVisibility(listener: () => void) {
  document.addEventListener("visibilitychange", listener);
  return () => document.removeEventListener("visibilitychange", listener);
}

function getVisibility() {
  return document.visibilityState === "visible";
}

export function FilmGrain() {
  const motion = useOptionalMotionPreferences();
  const pageVisible = useSyncExternalStore(
    subscribeVisibility,
    getVisibility,
    () => true,
  );

  if (motion?.shouldReduceMotion || motion?.lowPower) return null;

  return (
    <div
      aria-hidden="true"
      className="film-grain"
      data-paused={pageVisible ? undefined : "true"}
      data-testid="film-grain"
    />
  );
}

"use client";

import { useEffect } from "react";

import {
  setCursorState,
  type CursorState,
  useCursorState,
} from "@/lib/store/cursorStore";

const cursorStates = new Set<CursorState>([
  "default",
  "drag",
  "hidden",
  "link",
  "text",
  "view",
  "zoom",
]);

export function resolveCursorState(target: Element | null): CursorState {
  if (!target) return "default";
  const explicit = target.closest<HTMLElement>("[data-cursor]")?.dataset.cursor;
  if (explicit && cursorStates.has(explicit as CursorState)) {
    return explicit as CursorState;
  }
  if (
    target.closest(
      'input, textarea, select, [contenteditable="true"], [role="textbox"]',
    )
  ) {
    return "text";
  }
  if (target.closest('a, button, summary, [role="link"], [role="button"]')) {
    return "link";
  }
  return "default";
}

export function useCursor() {
  const state = useCursorState();

  useEffect(() => {
    const update = (event: PointerEvent) =>
      setCursorState(resolveCursorState(event.target as Element | null));
    const hide = () => setCursorState("hidden");
    const show = (event: PointerEvent) =>
      setCursorState(resolveCursorState(event.target as Element | null));

    document.addEventListener("pointerover", update, { passive: true });
    document.addEventListener("pointermove", show, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);
    return () => {
      document.removeEventListener("pointerover", update);
      document.removeEventListener("pointermove", show);
      document.documentElement.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      setCursorState("default");
    };
  }, []);

  return state;
}

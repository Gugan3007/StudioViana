"use client";

import { useSyncExternalStore } from "react";

export type CursorState =
  "default" | "drag" | "hidden" | "link" | "text" | "view" | "zoom";

let cursorState: CursorState = "default";
const listeners = new Set<() => void>();

export function getCursorState() {
  return cursorState;
}

export function setCursorState(nextState: CursorState) {
  if (cursorState === nextState) return;
  cursorState = nextState;
  listeners.forEach((listener) => listener());
}

export function subscribeCursorState(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useCursorState() {
  return useSyncExternalStore(
    subscribeCursorState,
    getCursorState,
    () => "default" as const,
  );
}

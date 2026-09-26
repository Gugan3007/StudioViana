"use client";

import type { ReactNode } from "react";

import { OverlayProvider } from "@/lib/context/OverlayContext";

/**
 * Application-level home for overlay ordering, focus management and the single
 * global scroll lock.
 */
export function OverlayManager({ children }: { children: ReactNode }) {
  return <OverlayProvider>{children}</OverlayProvider>;
}

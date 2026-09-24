"use client";

import type Lenis from "lenis";
import { createContext, useContext } from "react";

export interface LenisContextValue {
  lenis: Lenis | null;
}

export const LenisContext = createContext<LenisContextValue>({ lenis: null });

export function useLenis() {
  return useContext(LenisContext);
}

"use client";

import type Lenis from "lenis";
import { useCallback, useEffect, useRef } from "react";

import {
  acquireScrollLock,
  connectScrollLock,
  releaseScrollLock,
} from "@/lib/animations/scrollLock";

export function useScrollLock(lenis: Lenis | null, locked = true) {
  const token = useRef<ReturnType<typeof acquireScrollLock> | null>(null);
  const release = useCallback(() => {
    if (!token.current) return;
    releaseScrollLock(token.current);
    token.current = null;
  }, []);

  useEffect(() => {
    if (!locked) return;
    const owner = acquireScrollLock();
    token.current = owner;
    return release;
  }, [locked, release]);

  useEffect(() => {
    if (locked && token.current) connectScrollLock(token.current, lenis);
  }, [lenis, locked]);

  return release;
}

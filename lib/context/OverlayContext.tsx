"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface OverlayContextValue {
  overlayOpen: boolean;
  setOverlay: (source: string, open: boolean) => void;
}

interface OverlayEventDetail {
  open: boolean;
  source: string;
}

const OverlayContext = createContext<OverlayContextValue | null>(null);

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [sources, setSources] = useState<Set<string>>(() => new Set());
  const setOverlay = useCallback((source: string, open: boolean) => {
    setSources((current) => {
      const next = new Set(current);
      if (open) next.add(source);
      else next.delete(source);
      return next;
    });
  }, []);

  useEffect(() => {
    const coordinate = (event: Event) => {
      const detail = (event as CustomEvent<OverlayEventDetail>).detail;
      if (detail?.source) setOverlay(detail.source, Boolean(detail.open));
    };
    window.addEventListener("studio-viana:overlay-change", coordinate);
    return () =>
      window.removeEventListener("studio-viana:overlay-change", coordinate);
  }, [setOverlay]);

  const value = useMemo(
    () => ({ overlayOpen: sources.size > 0, setOverlay }),
    [setOverlay, sources],
  );
  return (
    <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>
  );
}

export function useOverlay() {
  const context = useContext(OverlayContext);
  if (!context)
    throw new Error("useOverlay must be used within OverlayProvider");
  return context;
}

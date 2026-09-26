"use client";

import {
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useLenis } from "@/lib/animations/useLenis";
import { useScrollLock } from "@/lib/animations/useScrollLock";
import { setCursorState } from "@/lib/store/cursorStore";

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface ManagedOverlayRegistration {
  id: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
  restoreFocus?: () => boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
  rootRef: RefObject<HTMLElement | null>;
}

interface OverlayEntry extends ManagedOverlayRegistration {
  instance: symbol;
  opener: HTMLElement | null;
}

interface OverlayContextValue {
  overlayOpen: boolean;
  overlayStack: readonly string[];
  registerOverlay: (registration: ManagedOverlayRegistration) => () => void;
  setOverlay: (source: string, open: boolean) => void;
}

interface OverlayEventDetail {
  open: boolean;
  source: string;
}

export const OverlayContext = createContext<OverlayContextValue | null>(null);

function restoreFocus(entry: OverlayEntry) {
  if (entry.restoreFocus && !entry.restoreFocus()) return;
  const target = entry.returnFocusRef?.current ?? entry.opener;
  if (target?.isConnected) target.focus();
}

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<OverlayEntry[]>([]);
  const [legacySources, setLegacySources] = useState<Set<string>>(
    () => new Set(),
  );
  const { lenis } = useLenis();
  const overlayOpen = entries.length > 0 || legacySources.size > 0;
  useScrollLock(lenis, overlayOpen);

  const setOverlay = useCallback((source: string, open: boolean) => {
    setLegacySources((current) => {
      const next = new Set(current);
      if (open) next.add(source);
      else next.delete(source);
      return next;
    });
  }, []);

  const registerOverlay = useCallback(
    (registration: ManagedOverlayRegistration) => {
      const entry: OverlayEntry = {
        ...registration,
        instance: Symbol(registration.id),
        opener: document.activeElement as HTMLElement | null,
      };

      setCursorState("default");
      setEntries((current) => [
        ...current.filter((candidate) => candidate.id !== registration.id),
        entry,
      ]);
      const initialFocus =
        registration.initialFocusRef?.current ?? registration.rootRef.current;
      initialFocus?.focus();

      return () => {
        setCursorState("default");
        setEntries((current) =>
          current.filter((candidate) => candidate.instance !== entry.instance),
        );
        restoreFocus(entry);
      };
    },
    [],
  );

  useEffect(() => {
    const coordinate = (event: Event) => {
      const detail = (event as CustomEvent<OverlayEventDetail>).detail;
      if (detail?.source) setOverlay(detail.source, Boolean(detail.open));
    };
    window.addEventListener("studio-viana:overlay-change", coordinate);
    return () =>
      window.removeEventListener("studio-viana:overlay-change", coordinate);
  }, [setOverlay]);

  useEffect(() => {
    const top = entries.at(-1);
    if (!top) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        top.onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const root = top.rootRef.current;
      if (!root) return;
      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>(focusableSelector),
      );
      if (focusable.length === 0) {
        event.preventDefault();
        root.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeInside = root.contains(document.activeElement);
      if (
        event.shiftKey &&
        (!activeInside || document.activeElement === first)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (!activeInside || document.activeElement === last)
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [entries]);

  const value = useMemo<OverlayContextValue>(
    () => ({
      overlayOpen,
      overlayStack: entries.map((entry) => entry.id),
      registerOverlay,
      setOverlay,
    }),
    [entries, overlayOpen, registerOverlay, setOverlay],
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

export function useManagedOverlay({
  id,
  initialFocusRef,
  onClose,
  open,
  restoreFocus: shouldRestoreFocus,
  returnFocusRef,
  rootRef,
}: ManagedOverlayRegistration & { open: boolean }) {
  const registerOverlay = useContext(OverlayContext)?.registerOverlay;
  const latest = useRef({ onClose, shouldRestoreFocus });

  useEffect(() => {
    latest.current = { onClose, shouldRestoreFocus };
  }, [onClose, shouldRestoreFocus]);

  useEffect(() => {
    if (!open || !registerOverlay) return;
    return registerOverlay({
      id,
      initialFocusRef,
      onClose: () => latest.current.onClose(),
      restoreFocus: () => latest.current.shouldRestoreFocus?.() ?? true,
      returnFocusRef,
      rootRef,
    });
  }, [id, initialFocusRef, open, registerOverlay, returnFocusRef, rootRef]);
}

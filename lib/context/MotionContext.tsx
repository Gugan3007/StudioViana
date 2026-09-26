"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

import { getNavigatorSignals, isLowPowerDevice } from "@/lib/utils/device";

export type MotionPreference = "full" | "reduce" | "system";

interface MotionContextValue {
  lowPower: boolean;
  preference: MotionPreference;
  setPreference: (preference: MotionPreference) => void;
  shouldReduceMotion: boolean;
  systemReducedMotion: boolean;
}

export const MOTION_STORAGE_KEY = "studio-viana:motion";
const MotionContext = createContext<MotionContextValue | null>(null);
const preferenceListeners = new Set<() => void>();
const noSubscription = () => () => undefined;

function isMotionPreference(value: string | null): value is MotionPreference {
  return value === "full" || value === "reduce" || value === "system";
}

function getPreferenceSnapshot(): MotionPreference {
  try {
    const stored = window.localStorage.getItem(MOTION_STORAGE_KEY);
    return isMotionPreference(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

function subscribePreference(listener: () => void) {
  preferenceListeners.add(listener);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === MOTION_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    preferenceListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function getSystemMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeSystemMotion(listener: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

function getLowPowerSnapshot() {
  return isLowPowerDevice(getNavigatorSignals(window.navigator));
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const preference = useSyncExternalStore(
    subscribePreference,
    getPreferenceSnapshot,
    (): MotionPreference => "system",
  );
  const systemReducedMotion = useSyncExternalStore(
    subscribeSystemMotion,
    getSystemMotionSnapshot,
    () => false,
  );
  const lowPower = useSyncExternalStore(
    noSubscription,
    getLowPowerSnapshot,
    () => false,
  );

  const shouldReduceMotion =
    preference === "reduce" || (preference === "system" && systemReducedMotion);

  const setPreference = useCallback((next: MotionPreference) => {
    try {
      window.localStorage.setItem(MOTION_STORAGE_KEY, next);
    } catch {
      // The in-memory preference still works in restricted privacy modes.
    }
    preferenceListeners.forEach((listener) => listener());
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = preference;
    document.documentElement.dataset.reduceMotion = String(shouldReduceMotion);
    if (lowPower) document.documentElement.dataset.lowPower = "true";
    else delete document.documentElement.dataset.lowPower;
  }, [lowPower, preference, shouldReduceMotion]);

  const value = useMemo<MotionContextValue>(
    () => ({
      lowPower,
      preference,
      setPreference,
      shouldReduceMotion,
      systemReducedMotion,
    }),
    [
      lowPower,
      preference,
      setPreference,
      shouldReduceMotion,
      systemReducedMotion,
    ],
  );

  return (
    <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
  );
}

export function useMotionPreferences() {
  const context = useContext(MotionContext);
  if (!context) {
    throw new Error(
      "useMotionPreferences must be used within a MotionProvider",
    );
  }
  return context;
}

export function useOptionalMotionPreferences() {
  return useContext(MotionContext);
}

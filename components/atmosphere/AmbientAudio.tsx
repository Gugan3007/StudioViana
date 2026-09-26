"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

const SOUND_STORAGE_KEY = "studio-viana:sound";
const listeners = new Set<() => void>();

interface AmbientSoundValue {
  enabled: boolean;
  toggle: () => void;
}

const AmbientSoundContext = createContext<AmbientSoundValue | null>(null);

function subscribeSound(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === SOUND_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSoundSnapshot() {
  try {
    return localStorage.getItem(SOUND_STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

function setSoundEnabled(enabled: boolean) {
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // A visitor can still use audio in storage-restricted browsing modes.
  }
  listeners.forEach((listener) => listener());
}

function playSafely(audio: HTMLAudioElement | null) {
  if (!audio) return;
  void audio.play().catch(() => undefined);
}

export function AmbientAudio({ children }: { children: ReactNode }) {
  const audio = useRef<HTMLAudioElement>(null);
  const engaged = useRef(false);
  const enabled = useSyncExternalStore(
    subscribeSound,
    getSoundSnapshot,
    () => false,
  );

  const toggle = useCallback(() => {
    engaged.current = true;
    setSoundEnabled(!enabled);
  }, [enabled]);

  useEffect(() => {
    const element = audio.current;
    if (!element) return;
    element.volume = 0.25;
    if (!enabled) {
      element.pause();
      return;
    }
    if (engaged.current && document.visibilityState === "visible") {
      playSafely(element);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || engaged.current) return;
    const activateRememberedChoice = () => {
      engaged.current = true;
      if (document.visibilityState === "visible") playSafely(audio.current);
    };
    document.addEventListener("pointerdown", activateRememberedChoice, {
      capture: true,
      once: true,
    });
    document.addEventListener("keydown", activateRememberedChoice, {
      capture: true,
      once: true,
    });
    return () => {
      document.removeEventListener("pointerdown", activateRememberedChoice, {
        capture: true,
      });
      document.removeEventListener("keydown", activateRememberedChoice, {
        capture: true,
      });
    };
  }, [enabled]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") audio.current?.pause();
      else if (enabled && engaged.current) playSafely(audio.current);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [enabled]);

  const value = useMemo(() => ({ enabled, toggle }), [enabled, toggle]);

  return (
    <AmbientSoundContext.Provider value={value}>
      {children}
      <audio
        ref={audio}
        data-testid="ambient-audio"
        loop
        preload="none"
        src="/audio/ambient.mp3"
      />
    </AmbientSoundContext.Provider>
  );
}

export function useAmbientSound() {
  return useContext(AmbientSoundContext);
}

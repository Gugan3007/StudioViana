"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface IntroContextValue {
  introComplete: boolean;
  markIntroComplete: () => void;
  markIntroActive: () => void;
}

const IntroContext = createContext<IntroContextValue | null>(null);

export function IntroProvider({ children }: { children: ReactNode }) {
  const [introComplete, setIntroComplete] = useState(false);
  const completionRef = useRef(false);

  const markIntroComplete = useCallback(() => {
    document.documentElement.dataset.introComplete = "true";
    if (completionRef.current) return;

    completionRef.current = true;
    setIntroComplete(true);
    window.dispatchEvent(new CustomEvent("studio-viana:intro-complete"));
  }, []);

  const markIntroActive = useCallback(() => {
    completionRef.current = false;
    setIntroComplete(false);
    delete document.documentElement.dataset.introComplete;
  }, []);

  useEffect(() => {
    const restoredPastIntro =
      document.documentElement.dataset.introComplete === "true" ||
      window.scrollY > 0;
    if (!restoredPastIntro) return;

    const restorationFrame = window.requestAnimationFrame(() => {
      completionRef.current = true;
      setIntroComplete(true);
      document.documentElement.dataset.introComplete = "true";
    });
    return () => window.cancelAnimationFrame(restorationFrame);
  }, []);

  const value = useMemo(
    () => ({ introComplete, markIntroActive, markIntroComplete }),
    [introComplete, markIntroActive, markIntroComplete],
  );

  return (
    <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
  );
}

export function useIntro(): IntroContextValue {
  const context = useContext(IntroContext);
  if (!context) {
    throw new Error("useIntro must be used within an IntroProvider");
  }
  return context;
}

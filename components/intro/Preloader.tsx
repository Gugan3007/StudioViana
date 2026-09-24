"use client";

import type Lenis from "lenis";
import { useCallback, useEffect, useRef, useState } from "react";

import { introConfig } from "@/components/intro/intro.config";
import { gsap } from "@/lib/animations/gsap";
import {
  preloadImages,
  type PreloadResult,
} from "@/lib/animations/preloadImages";

const introSeenKey = "studio-viana:intro-seen";

export interface PreloaderProps {
  urls: readonly string[];
  lenis: Lenis | null;
  reducedMotion: boolean;
  onComplete(result: PreloadResult): void;
}

export function Preloader({
  urls,
  lenis,
  reducedMotion,
  onComplete,
}: PreloaderProps) {
  const root = useRef<HTMLDivElement>(null);
  const exitContext = useRef<ReturnType<typeof gsap.context> | null>(null);
  const stoppedLenis = useRef<Lenis | null>(null);
  const previousOverflow = useRef<{ body: string; html: string } | null>(null);
  const finalizing = useRef(false);
  const [percent, setPercent] = useState(0);
  const [phase, setPhase] = useState<"loading" | "exiting">("loading");
  const urlSignature = urls.join("\u001f");

  const restoreNativeScroll = useCallback(() => {
    if (!previousOverflow.current) return;
    document.documentElement.style.overflow = previousOverflow.current.html;
    document.body.style.overflow = previousOverflow.current.body;
    previousOverflow.current = null;
  }, []);

  const releaseLenis = useCallback(() => {
    stoppedLenis.current?.start();
    stoppedLenis.current = null;
  }, []);

  const finish = useCallback(
    (result: PreloadResult) => {
      if (finalizing.current) return;
      finalizing.current = true;
      setPercent(100);
      setPhase("exiting");

      const complete = () => {
        try {
          sessionStorage.setItem(introSeenKey, "true");
        } catch {
          // Privacy modes can disable session storage; the intro still completes.
        }
        restoreNativeScroll();
        releaseLenis();
        onComplete(result);
      };

      if (reducedMotion || !root.current) {
        complete();
        return;
      }

      exitContext.current = gsap.context(() => {
        gsap
          .timeline({ onComplete: complete })
          .to("[data-preloader-progress-track]", {
            duration: 0.45,
            ease: "power2.inOut",
            inset: "0px",
          })
          .to(
            "[data-preloader-content]",
            { autoAlpha: 0, duration: 0.45, y: -12 },
            "-=0.18",
          )
          .to(root.current, { autoAlpha: 0, duration: 0.7 });
      }, root);
    },
    [onComplete, reducedMotion, releaseLenis, restoreNativeScroll],
  );

  useEffect(() => {
    previousOverflow.current = {
      html: document.documentElement.style.overflow,
      body: document.body.style.overflow,
    };
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      exitContext.current?.revert();
      exitContext.current = null;
      restoreNativeScroll();
      releaseLenis();
    };
  }, [releaseLenis, restoreNativeScroll]);

  useEffect(() => {
    if (!lenis || finalizing.current || stoppedLenis.current === lenis) return;
    stoppedLenis.current?.start();
    lenis.stop();
    stoppedLenis.current = lenis;
  }, [lenis]);

  useEffect(() => {
    let cancelled = false;
    let minimumTimer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();
    let repeatVisit = false;

    try {
      repeatVisit = sessionStorage.getItem(introSeenKey) === "true";
    } catch {
      repeatVisit = false;
    }

    const minimumMs = repeatVisit
      ? introConfig.preload.repeatVisitMs
      : introConfig.preload.firstVisitMs;
    const assetUrls = urlSignature ? urlSignature.split("\u001f") : [];
    const timeoutResult: PreloadResult = {
      loaded: [],
      failed: assetUrls,
      timedOut: true,
    };
    const maximumTimer = setTimeout(
      () => finish(timeoutResult),
      introConfig.preload.maximumMs,
    );

    void preloadImages(
      assetUrls,
      (progress) => {
        if (!cancelled) setPercent(progress.percent);
      },
      { timeoutMs: introConfig.preload.maximumMs },
    ).then((result) => {
      if (cancelled) return;
      const elapsed = Date.now() - startedAt;
      minimumTimer = setTimeout(
        () => finish(result),
        Math.max(0, minimumMs - elapsed),
      );
    });

    return () => {
      cancelled = true;
      clearTimeout(maximumTimer);
      if (minimumTimer !== undefined) clearTimeout(minimumTimer);
    };
  }, [finish, urlSignature]);

  return (
    <div
      ref={root}
      aria-label="Loading the Studio Viana introduction"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_45%,#294431_0%,#1f3326_48%,#16241b_100%)] text-cream"
      data-preloader
      data-preloader-phase={phase}
      role="status"
    >
      <div
        aria-hidden="true"
        className="intro-grain absolute inset-0 opacity-[0.07]"
      />
      <div
        aria-hidden="true"
        className="border-gold/70 pointer-events-none absolute inset-8 border max-sm:inset-4"
        data-preloader-progress-track
      />
      <div
        className="relative z-10 flex w-[min(78vw,36rem)] flex-col items-center"
        data-preloader-content
      >
        <p className="font-display text-[clamp(1.9rem,5vw,4.5rem)] tracking-[0.19em]">
          {"STUDIO VIANA".split("").map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="inline-block"
              data-preloader-letter
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {letter === " " ? "\u00a0" : letter}
            </span>
          ))}
        </p>
        <div className="bg-gold/25 mt-9 h-px w-full overflow-hidden">
          <span
            className="block h-full origin-left bg-gold-light transition-transform duration-150"
            data-preloader-progress
            style={{ transform: `scaleX(${percent / 100})` }}
          />
        </div>
        <p className="mt-4 font-body text-[0.6rem] font-medium tabular-nums tracking-[0.32em] text-gold-light">
          {String(percent).padStart(3, "0")}
        </p>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BrandMoment } from "@/components/intro/BrandMoment";
import { FlowerDive } from "@/components/intro/FlowerDive";
import {
  FlowerSequence,
  type FlowerSequenceHandle,
} from "@/components/intro/FlowerSequence";
import {
  getSequenceFrameUrls,
  getSequenceLoadOrder,
  introConfig,
  type IntroBreakpoint,
  type IntroMode,
} from "@/components/intro/intro.config";
import { LightTransition } from "@/components/intro/LightTransition";
import { Preloader } from "@/components/intro/Preloader";
import { SkipIntro } from "@/components/intro/SkipIntro";
import {
  gsap,
  refreshScrollTrigger,
  ScrollTrigger,
} from "@/lib/animations/gsap";
import {
  releasePreloadedImages,
  type PreloadResult,
} from "@/lib/animations/preloadImages";
import { useIsomorphicLayoutEffect } from "@/lib/animations/useIsomorphicLayoutEffect";
import { useLenis } from "@/lib/animations/useLenis";
import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { useIntro } from "@/lib/context/IntroContext";

type BreakpointSettings =
  (typeof introConfig.breakpoints)[keyof typeof introConfig.breakpoints];

function useIntroBreakpoint(): IntroBreakpoint {
  const [breakpoint, setBreakpoint] = useState<IntroBreakpoint>("desktop");

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)");
    const tablet = window.matchMedia(
      "(min-width: 768px) and (max-width: 1023px)",
    );
    const update = () =>
      setBreakpoint(
        mobile.matches ? "mobile" : tablet.matches ? "tablet" : "desktop",
      );

    update();
    mobile.addEventListener("change", update);
    tablet.addEventListener("change", update);

    return () => {
      mobile.removeEventListener("change", update);
      tablet.removeEventListener("change", update);
    };
  }, []);

  return breakpoint;
}

export function IntroSection() {
  const root = useRef<HTMLElement>(null);
  const sequence = useRef<FlowerSequenceHandle>(null);
  const reloadScrollY = useRef<number | null>(null);
  const { lenis } = useLenis();
  const { markIntroActive, markIntroComplete } = useIntro();
  const reducedMotion = useReducedMotion();
  const breakpoint = useIntroBreakpoint();
  const mode: IntroMode = introConfig.mode;
  const settings = introConfig.breakpoints[breakpoint];
  const [preloadComplete, setPreloadComplete] = useState(false);
  const [preloadResult, setPreloadResult] = useState<PreloadResult>();
  const [atHome, setAtHome] = useState(false);

  const sequenceFrames = useMemo(() => getSequenceFrameUrls(), []);
  const preloadUrls = useMemo(
    () =>
      mode === "sequence"
        ? [
            introConfig.assets.logo,
            introConfig.assets.desktopFlower,
            introConfig.assets.mobileFlower,
            ...getSequenceLoadOrder(sequenceFrames),
          ]
        : [
            introConfig.assets.logo,
            introConfig.assets.desktopFlower,
            introConfig.assets.mobileFlower,
            ...introConfig.assets.petals,
          ],
    [mode, sequenceFrames],
  );

  const handlePreloadComplete = useCallback(
    (result: PreloadResult) => {
      const sequenceUrlSet = new Set(sequenceFrames);
      releasePreloadedImages(
        mode === "sequence"
          ? result.loaded.filter((url) => !sequenceUrlSet.has(url))
          : result.loaded,
      );
      setPreloadResult(result);
      setPreloadComplete(true);
    },
    [mode, sequenceFrames],
  );

  useEffect(() => {
    const storageKey = `studio-viana:scroll-y:${window.location.pathname}`;
    const navigation = performance.getEntriesByType("navigation")[0] as
      PerformanceNavigationTiming | undefined;

    if (navigation?.type === "reload") {
      try {
        const storedPosition = Number(sessionStorage.getItem(storageKey));
        if (Number.isFinite(storedPosition) && storedPosition > 0) {
          reloadScrollY.current = storedPosition;
        }
      } catch {
        reloadScrollY.current = null;
      }
    }

    const persistScrollPosition = () => {
      try {
        sessionStorage.setItem(storageKey, String(window.scrollY));
      } catch {
        // Privacy modes may disable session storage; native restoration remains.
      }
    };

    window.addEventListener("pagehide", persistScrollPosition);
    return () => window.removeEventListener("pagehide", persistScrollPosition);
  }, []);

  useEffect(() => {
    if (!preloadComplete) return;
    let restorationFrame: number | undefined;
    let cancelled = false;
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    void fontsReady.then(() => {
      if (cancelled) return;
      ScrollTrigger.refresh();
      lenis?.resize();

      const restoredPosition = reloadScrollY.current;
      if (restoredPosition === null) return;
      restorationFrame = window.requestAnimationFrame(() => {
        const maximumScroll = Math.max(
          0,
          document.documentElement.scrollHeight - window.innerHeight,
        );
        const top = Math.min(restoredPosition, maximumScroll);
        if (lenis && !reducedMotion) {
          lenis.scrollTo(top, { immediate: true });
        } else {
          window.scrollTo(0, top);
        }
        reloadScrollY.current = null;
        const home = document.getElementById("home");
        const introEnd = home
          ? Math.max(0, home.offsetTop - window.innerHeight)
          : window.innerHeight;
        if (top >= introEnd) markIntroComplete();
        ScrollTrigger.refresh();
      });
    });

    return () => {
      cancelled = true;
      if (restorationFrame !== undefined) {
        window.cancelAnimationFrame(restorationFrame);
      }
    };
  }, [lenis, markIntroComplete, preloadComplete, reducedMotion]);

  useEffect(() => {
    if (preloadComplete && reducedMotion) markIntroComplete();
  }, [markIntroComplete, preloadComplete, reducedMotion]);

  useEffect(
    () => () => {
      markIntroActive();
    },
    [markIntroActive],
  );

  useIsomorphicLayoutEffect(() => {
    const section = root.current;
    if (!section || !preloadComplete || reducedMotion) return;

    let media: ReturnType<typeof gsap.matchMedia> | null = null;
    const context = gsap.context(() => {
      media = gsap.matchMedia();

      const buildTimeline = (
        activeSettings: BreakpointSettings,
        activeBreakpoint: IntroBreakpoint,
      ) => {
        section.dataset.introBreakpoint = activeBreakpoint;
        section.dataset.pinVh = String(activeSettings.pinVh);
        section.dataset.introActive = "true";

        const brandCopy = section.querySelectorAll("[data-intro-brand-copy]");
        const logo = section.querySelector("[data-intro-logo]");
        const frame = section.querySelector("[data-intro-frame]");
        const scrollCue = section.querySelector("[data-intro-scroll-cue]");
        const flowerMask = section.querySelector("[data-intro-flower-mask]");
        const flower = section.querySelector("[data-intro-flower]");
        const middle = section.querySelectorAll("[data-intro-middle]");
        const petals = section.querySelectorAll("[data-intro-petal]");
        const ring = section.querySelector("[data-intro-ring]");
        const ringStroke = ring?.querySelector("circle") ?? [];
        const vignette = section.querySelector("[data-intro-vignette]");
        const poemLines = Array.from(
          section.querySelectorAll<HTMLElement>("[data-intro-poem-line]"),
        );
        const light = section.querySelector("[data-intro-light]");
        const sequenceLayer = section.querySelector("[data-intro-sequence]");
        const exitLayers = [flowerMask, sequenceLayer, vignette].filter(
          (target): target is Element => target !== null,
        );
        const rotation =
          activeBreakpoint === "desktop"
            ? 8
            : activeBreakpoint === "tablet"
              ? 6
              : 4;

        const clearActiveState = () => {
          delete section.dataset.introActive;
        };
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () =>
              `+=${Math.round(window.innerHeight * (activeSettings.pinVh / 100))}`,
            pin: true,
            scrub: introConfig.scrub,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onEnter: () => {
              section.dataset.introActive = "true";
              markIntroActive();
              setAtHome(false);
            },
            onEnterBack: () => {
              section.dataset.introActive = "true";
              markIntroActive();
              setAtHome(false);
            },
            onLeave: () => {
              clearActiveState();
              markIntroComplete();
              setAtHome(true);
              refreshScrollTrigger();
            },
            onLeaveBack: () => {
              clearActiveState();
              markIntroActive();
              setAtHome(false);
            },
          },
        });

        for (const [label, position] of Object.entries(introConfig.timeline)) {
          timeline.addLabel(label, position);
        }

        timeline
          .set(brandCopy, { autoAlpha: 1, yPercent: 0 }, 0)
          .set(logo, { autoAlpha: 1, scale: 1 }, 0)
          .set([frame, scrollCue], { autoAlpha: 1 }, 0)
          .set(flowerMask, { clipPath: "circle(0% at 50% 50%)" }, 0)
          .set(
            flower,
            {
              autoAlpha: 1,
              rotation: 0,
              scale: 1.3,
              transformOrigin: `${introConfig.focalPoint.x}% ${introConfig.focalPoint.y}%`,
            },
            0,
          )
          .set(
            petals,
            {
              autoAlpha: 0,
              filter: "blur(0px)",
              scale: 1,
              xPercent: (index: number) => (index % 2 === 0 ? -18 : 18),
              yPercent: (index: number) => (index % 2 === 0 ? 7 : -9),
            },
            0,
          )
          .set(ring, { autoAlpha: 1, scale: 0.01 }, 0)
          .set(ringStroke, { strokeDashoffset: 302 }, 0)
          .set(vignette, { autoAlpha: 0 }, 0)
          .set(poemLines, { autoAlpha: 0 }, 0)
          .set(light, { autoAlpha: 0, scale: 0.5 }, 0);

        if (middle.length > 0) {
          timeline.set(middle, { autoAlpha: 0, scale: 1.3 }, 0);
        }
        if (sequenceLayer) {
          timeline.set(
            sequenceLayer,
            {
              autoAlpha: mode === "sequence" ? 1 : 0,
              clipPath: "circle(0% at 50% 50%)",
            },
            0,
          );
        }

        // Scene 1 · Brand moment · 0%–15%
        timeline
          .to(brandCopy, { autoAlpha: 0, duration: 11, yPercent: -34 }, 0)
          .to(
            logo,
            { autoAlpha: 0, duration: 13, scale: 0.85, yPercent: -5 },
            1,
          )
          .to([frame, scrollCue], { autoAlpha: 0, duration: 7 }, 3);

        // Scene 2 · Flower appears · 15%–35%
        const revealTarget = mode === "sequence" ? sequenceLayer : flowerMask;
        timeline
          .to(
            revealTarget,
            { clipPath: "circle(18% at 50% 50%)", duration: 20 },
            introConfig.timeline.flower,
          )
          .to(flower, { duration: 20, scale: 1.1 }, introConfig.timeline.flower)
          .to(ring, { duration: 20, scale: 1 }, introConfig.timeline.flower)
          .to(
            ringStroke,
            { duration: 16, strokeDashoffset: 0 },
            introConfig.timeline.flower + 2,
          )
          .to(
            petals,
            {
              autoAlpha: 0.78,
              duration: 12,
              scale: 1.12,
              stagger: 1.2,
              xPercent: 0,
              yPercent: 0,
            },
            introConfig.timeline.flower + 7,
          );

        // Scene 3 · The dive · 35%–80%
        timeline
          .to(
            revealTarget,
            { clipPath: "circle(150% at 50% 50%)", duration: 23 },
            introConfig.timeline.dive,
          )
          .to(
            ring,
            { autoAlpha: 0, duration: 12, scale: 4.4 },
            introConfig.timeline.dive,
          )
          .to(
            flower,
            {
              duration: 45,
              rotation,
              scale: activeSettings.diveScale,
            },
            introConfig.timeline.dive,
          )
          .to(
            petals,
            {
              autoAlpha: 0,
              duration: 35,
              filter: "blur(20px)",
              scale: activeSettings.diveScale * 2,
              stagger: 1.4,
              xPercent: (index: number) => (index % 2 === 0 ? -26 : 28),
              yPercent: (index: number) => (index % 2 === 0 ? -16 : 19),
            },
            introConfig.timeline.dive + 3,
          )
          .to(
            vignette,
            { autoAlpha: 0.82, duration: 34 },
            introConfig.timeline.dive + 7,
          );

        if (middle.length > 0) {
          timeline.to(
            middle,
            {
              autoAlpha: activeSettings.showMiddleLayer ? 0.4 : 0,
              duration: 30,
              filter: "blur(10px)",
              scale: activeSettings.diveScale * 1.18,
            },
            introConfig.timeline.dive + 4,
          );
        }

        if (mode === "sequence") {
          const frameProxy = { frame: 0 };
          timeline.to(
            frameProxy,
            {
              duration: 65,
              ease: "none",
              frame: sequenceFrames.length - 1,
              onUpdate: () =>
                sequence.current?.setFrame(Math.round(frameProxy.frame)),
              snap: { frame: 1 },
            },
            introConfig.timeline.flower,
          );
        }

        const poemStarts = [42, 56, 69] as const;
        poemLines.forEach((line, index) => {
          const words = line.querySelectorAll("[data-intro-poem-word]");
          const start = poemStarts[index] ?? 69;
          timeline
            .to(line, { autoAlpha: 1, duration: 0.2 }, start)
            .fromTo(
              words,
              { autoAlpha: 0, filter: "blur(10px)", yPercent: 35 },
              {
                autoAlpha: 1,
                duration: 3.5,
                filter: "blur(0px)",
                stagger: 0.18,
                yPercent: 0,
              },
              start,
            )
            .to(
              line,
              { autoAlpha: 0, duration: 2.8, yPercent: -12 },
              start + 8,
            );
        });

        // Scene 4 · Light transition · 80%–100%
        timeline
          .to(
            light,
            { autoAlpha: 1, duration: 18, scale: 2 },
            introConfig.timeline.light,
          )
          .to(
            exitLayers,
            { autoAlpha: 0, duration: 11 },
            introConfig.timeline.light + 8,
          );

        return () => {
          clearActiveState();
          delete section.dataset.introBreakpoint;
          delete section.dataset.pinVh;
        };
      };

      media.add("(min-width: 1024px)", () =>
        buildTimeline(introConfig.breakpoints.desktop, "desktop"),
      );
      media.add("(min-width: 768px) and (max-width: 1023px)", () =>
        buildTimeline(introConfig.breakpoints.tablet, "tablet"),
      );
      media.add("(max-width: 767px)", () =>
        buildTimeline(introConfig.breakpoints.mobile, "mobile"),
      );
    }, root);

    refreshScrollTrigger();

    return () => {
      media?.revert();
      context.revert();
      delete section.dataset.introActive;
      delete section.dataset.introBreakpoint;
      delete section.dataset.pinVh;
    };
  }, [
    breakpoint,
    markIntroActive,
    markIntroComplete,
    mode,
    preloadComplete,
    reducedMotion,
    sequenceFrames,
  ]);

  return (
    <section
      ref={root}
      aria-label="Studio Viana cinematic introduction"
      className="relative h-[100svh] overflow-hidden bg-forest text-cream"
      data-intro-mode={mode}
      data-intro-ready={preloadComplete || undefined}
      data-reduced-motion={reducedMotion || undefined}
      data-testid="intro-section"
    >
      <BrandMoment particleCount={settings.particles} />
      {mode === "sequence" ? (
        <FlowerSequence
          ref={sequence}
          focalPoint={introConfig.focalPoint}
          frameUrls={sequenceFrames}
          preloadResult={preloadResult}
        />
      ) : null}
      <FlowerDive
        mobile={breakpoint === "mobile"}
        petalLayers={settings.petalLayers}
        showMiddleLayer={settings.showMiddleLayer}
      />
      <LightTransition />

      {!preloadComplete ? (
        <Preloader
          lenis={lenis}
          onComplete={handlePreloadComplete}
          reducedMotion={reducedMotion}
          urls={preloadUrls}
        />
      ) : null}
      <SkipIntro
        destinationId="home"
        visible={preloadComplete && !reducedMotion && !atHome}
      />
    </section>
  );
}

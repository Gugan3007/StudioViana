import { act, render, screen, waitFor } from "@testing-library/react";
import {
  createElement,
  forwardRef,
  useEffect,
  useImperativeHandle,
} from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { IntroSection } from "@/components/intro/IntroSection";
import { IntroProvider } from "@/lib/context/IntroContext";

const timelineMocks = vi.hoisted(() => {
  const contextRevert = vi.fn();
  const mediaRevert = vi.fn();
  const mediaAdd = vi.fn();
  const timelineOptions: Array<Record<string, unknown>> = [];
  const timelines: Array<{
    addLabel: ReturnType<typeof vi.fn>;
    fromTo: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    to: ReturnType<typeof vi.fn>;
  }> = [];

  return {
    activeMedia: "desktop" as "desktop" | "mobile" | "tablet",
    contextRevert,
    mediaAdd,
    mediaRevert,
    mode: "layers" as "layers" | "sequence",
    nullTargets: [] as unknown[],
    reduceMotion: false,
    refresh: vi.fn(),
    sequenceSetFrame: vi.fn(),
    timelineOptions,
    timelines,
  };
});

vi.mock("@/components/intro/intro.config", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/components/intro/intro.config")>();
  const config = { ...original.introConfig };
  Object.defineProperty(config, "mode", {
    get: () => timelineMocks.mode,
  });
  return { ...original, introConfig: config };
});

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => timelineMocks.reduceMotion,
}));

vi.mock("@/lib/animations/useLenis", () => ({
  useLenis: () => ({ lenis: null }),
}));

vi.mock("@/lib/animations/gsap", () => ({
  gsap: {
    context: vi.fn((setup: () => void) => {
      setup();
      return { revert: timelineMocks.contextRevert };
    }),
    matchMedia: vi.fn(() => ({
      add: timelineMocks.mediaAdd.mockImplementation(
        (query: string, setup: () => void) => {
          const matches =
            (timelineMocks.activeMedia === "desktop" &&
              query.includes("min-width: 1024px")) ||
            (timelineMocks.activeMedia === "tablet" &&
              query.includes("min-width: 768px")) ||
            (timelineMocks.activeMedia === "mobile" &&
              query.includes("max-width: 767px"));
          if (matches) setup();
        },
      ),
      revert: timelineMocks.mediaRevert,
    })),
    timeline: vi.fn((options: Record<string, unknown>) => {
      timelineMocks.timelineOptions.push(options);
      const timeline = {
        addLabel: vi.fn(),
        fromTo: vi.fn(),
        set: vi.fn(),
        to: vi.fn(),
      };
      const recordNullTargets = (target: unknown) => {
        if (
          target == null ||
          (Array.isArray(target) && target.some((item) => item == null)) ||
          (target instanceof NodeList && target.length === 0)
        ) {
          timelineMocks.nullTargets.push(target);
        }
      };
      timeline.addLabel.mockImplementation(() => timeline);
      timeline.fromTo.mockImplementation((target: unknown) => {
        recordNullTargets(target);
        return timeline;
      });
      timeline.set.mockImplementation((target: unknown) => {
        recordNullTargets(target);
        return timeline;
      });
      timeline.to.mockImplementation(
        (target: unknown, vars: Record<string, unknown>) => {
          recordNullTargets(target);
          if (
            target &&
            typeof target === "object" &&
            "frame" in target &&
            typeof vars.frame === "number"
          ) {
            (target as { frame: number }).frame = vars.frame;
            if (typeof vars.onUpdate === "function") vars.onUpdate();
          }
          return timeline;
        },
      );
      timelineMocks.timelines.push(timeline);
      return timeline;
    }),
  },
  ScrollTrigger: { refresh: timelineMocks.refresh },
  refreshScrollTrigger: timelineMocks.refresh,
}));

vi.mock("@/components/intro/Preloader", () => ({
  Preloader: ({
    onComplete,
  }: {
    onComplete(result: {
      loaded: string[];
      failed: string[];
      timedOut: boolean;
    }): void;
  }) => {
    useEffect(() => {
      onComplete({ loaded: [], failed: [], timedOut: false });
    }, [onComplete]);
    return createElement("div", { "data-testid": "preloader" });
  },
}));

vi.mock("@/components/intro/BrandMoment", () => ({
  BrandMoment: () =>
    createElement(
      "div",
      { "data-intro-brand": true },
      createElement("span", { "data-intro-brand-copy": true }),
      createElement("span", { "data-intro-logo": true }),
      createElement("span", { "data-intro-frame": true }),
      createElement("span", { "data-intro-scroll-cue": true }),
    ),
}));

vi.mock("@/components/intro/FlowerDive", () => ({
  FlowerDive: ({ showMiddleLayer }: { showMiddleLayer: boolean }) =>
    createElement(
      "div",
      { "data-intro-dive": true },
      createElement(
        "div",
        { "data-intro-flower-mask": true },
        createElement("span", { "data-intro-flower": true }),
        showMiddleLayer
          ? createElement("span", { "data-intro-middle": true })
          : null,
        createElement("span", { "data-intro-petal": true }),
      ),
      createElement("svg", { "data-intro-ring": true }),
      createElement(
        "p",
        { "data-intro-poem-line": true },
        createElement("span", { "data-intro-poem-word": true }),
      ),
      createElement("span", { "data-intro-vignette": true }),
    ),
}));

vi.mock("@/components/intro/FlowerSequence", () => ({
  FlowerSequence: forwardRef(function MockSequence(_props, ref) {
    useImperativeHandle(ref, () => ({
      resize: vi.fn(),
      setFrame: timelineMocks.sequenceSetFrame,
    }));
    return createElement("canvas", { "data-intro-sequence": true });
  }),
}));

vi.mock("@/components/intro/LightTransition", () => ({
  LightTransition: () => createElement("div", { "data-intro-light": true }),
}));

vi.mock("@/components/intro/SkipIntro", () => ({
  SkipIntro: () => createElement("button", null, "Skip intro"),
}));

function renderIntro() {
  return render(
    <IntroProvider>
      <IntroSection />
    </IntroProvider>,
  );
}

describe("IntroSection master timeline", () => {
  beforeEach(() => {
    timelineMocks.contextRevert.mockClear();
    timelineMocks.activeMedia = "desktop";
    timelineMocks.mediaAdd.mockClear();
    timelineMocks.mediaRevert.mockClear();
    timelineMocks.mode = "layers";
    timelineMocks.nullTargets.length = 0;
    timelineMocks.reduceMotion = false;
    timelineMocks.refresh.mockClear();
    timelineMocks.sequenceSetFrame.mockClear();
    timelineMocks.timelineOptions.length = 0;
    timelineMocks.timelines.length = 0;
    delete document.documentElement.dataset.introComplete;
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 1000,
    });
  });

  it("renders a static unpinned intro when motion is reduced", async () => {
    timelineMocks.reduceMotion = true;
    renderIntro();

    await screen.findByTestId("intro-section");
    expect(screen.getByTestId("intro-section")).toHaveAttribute(
      "data-reduced-motion",
      "true",
    );
    expect(timelineMocks.mediaAdd).not.toHaveBeenCalled();
    expect(timelineMocks.timelineOptions).toHaveLength(0);
  });

  it("creates one desktop master timeline with normalized scene labels", async () => {
    const scrollTo = vi.spyOn(window, "scrollTo");
    renderIntro();

    await waitFor(() => expect(timelineMocks.timelines).toHaveLength(1));
    const options = timelineMocks.timelineOptions[0];
    const scrollTrigger = options.scrollTrigger as {
      end: () => string;
      invalidateOnRefresh: boolean;
      pin: boolean;
      scrub: number;
      trigger: HTMLElement;
    };

    expect(scrollTrigger.trigger).toBe(screen.getByTestId("intro-section"));
    expect(scrollTrigger).toMatchObject({
      pin: true,
      scrub: 0.35,
      invalidateOnRefresh: true,
    });
    expect(scrollTrigger.end()).toBe("+=2600");
    expect(timelineMocks.timelines[0].addLabel.mock.calls).toEqual([
      ["brand", 0],
      ["flower", 15],
      ["dive", 35],
      ["light", 80],
      ["complete", 100],
    ]);
    expect(scrollTo).not.toHaveBeenCalled();

    const animationVars = timelineMocks.timelines[0].to.mock.calls
      .map((call) => call[1] as Record<string, unknown>)
      .filter(Boolean);
    const fromToVars = timelineMocks.timelines[0].fromTo.mock.calls.flatMap(
      (call) => [call[1], call[2]] as Array<Record<string, unknown>>,
    );
    for (const vars of [...animationVars, ...fromToVars]) {
      expect(vars).not.toHaveProperty("clipPath");
      expect(vars).not.toHaveProperty("filter");
    }
    scrollTo.mockRestore();
  });

  it("drives sequence frames from the same master timeline", async () => {
    timelineMocks.mode = "sequence";
    renderIntro();

    await waitFor(() =>
      expect(timelineMocks.sequenceSetFrame).toHaveBeenCalledWith(149),
    );
    expect(timelineMocks.timelines).toHaveLength(1);
  });

  it("never schedules missing optional mobile layers as GSAP targets", async () => {
    timelineMocks.activeMedia = "mobile";
    renderIntro();

    await waitFor(() =>
      expect(screen.getByTestId("intro-section")).toHaveAttribute(
        "data-intro-breakpoint",
        "mobile",
      ),
    );
    expect(timelineMocks.nullTargets).toEqual([]);
  });

  it("reverts media and scoped animation state on unmount", async () => {
    const { unmount } = renderIntro();
    await waitFor(() => expect(timelineMocks.timelines).toHaveLength(1));
    document.documentElement.dataset.introComplete = "true";

    unmount();

    expect(timelineMocks.mediaRevert).toHaveBeenCalledOnce();
    expect(timelineMocks.contextRevert).toHaveBeenCalledOnce();
    expect(document.documentElement.dataset.introComplete).toBeUndefined();
  });

  it("publishes completion and reactivation from ScrollTrigger callbacks", async () => {
    const completionEvent = vi.fn();
    window.addEventListener("studio-viana:intro-complete", completionEvent, {
      once: true,
    });
    renderIntro();
    await waitFor(() => expect(timelineMocks.timelineOptions).toHaveLength(1));
    const scrollTrigger = timelineMocks.timelineOptions[0].scrollTrigger as {
      onEnterBack: () => void;
      onLeave: () => void;
    };

    act(() => scrollTrigger.onLeave());
    expect(document.documentElement).toHaveAttribute(
      "data-intro-complete",
      "true",
    );
    expect(completionEvent).toHaveBeenCalledOnce();

    act(() => scrollTrigger.onEnterBack());
    expect(document.documentElement.dataset.introComplete).toBeUndefined();
  });
});

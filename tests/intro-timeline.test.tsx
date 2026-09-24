import { render, screen, waitFor } from "@testing-library/react";
import { createElement, forwardRef, useEffect, useImperativeHandle } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { IntroSection } from "@/components/intro/IntroSection";

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
    contextRevert,
    mediaAdd,
    mediaRevert,
    mode: "layers" as "layers" | "sequence",
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
          if (query.includes("min-width: 1024px")) setup();
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
      timeline.addLabel.mockImplementation(() => timeline);
      timeline.fromTo.mockImplementation(() => timeline);
      timeline.set.mockImplementation(() => timeline);
      timeline.to.mockImplementation(
        (target: unknown, vars: Record<string, unknown>) => {
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
    onComplete(result: { loaded: string[]; failed: string[]; timedOut: boolean }): void;
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
  FlowerDive: () =>
    createElement(
      "div",
      { "data-intro-dive": true },
      createElement(
        "div",
        { "data-intro-flower-mask": true },
        createElement("span", { "data-intro-flower": true }),
        createElement("span", { "data-intro-middle": true }),
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

describe("IntroSection master timeline", () => {
  beforeEach(() => {
    timelineMocks.contextRevert.mockClear();
    timelineMocks.mediaAdd.mockClear();
    timelineMocks.mediaRevert.mockClear();
    timelineMocks.mode = "layers";
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
    render(<IntroSection />);

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
    render(<IntroSection />);

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
      scrub: 1.2,
      invalidateOnRefresh: true,
    });
    expect(scrollTrigger.end()).toBe("+=4000");
    expect(timelineMocks.timelines[0].addLabel.mock.calls).toEqual([
      ["brand", 0],
      ["flower", 15],
      ["dive", 35],
      ["light", 80],
      ["complete", 100],
    ]);
    expect(scrollTo).not.toHaveBeenCalled();
    scrollTo.mockRestore();
  });

  it("drives sequence frames from the same master timeline", async () => {
    timelineMocks.mode = "sequence";
    render(<IntroSection />);

    await waitFor(() =>
      expect(timelineMocks.sequenceSetFrame).toHaveBeenCalledWith(149),
    );
    expect(timelineMocks.timelines).toHaveLength(1);
  });

  it("reverts media and scoped animation state on unmount", async () => {
    const { unmount } = render(<IntroSection />);
    await waitFor(() => expect(timelineMocks.timelines).toHaveLength(1));
    document.documentElement.dataset.introComplete = "true";

    unmount();

    expect(timelineMocks.mediaRevert).toHaveBeenCalledOnce();
    expect(timelineMocks.contextRevert).toHaveBeenCalledOnce();
    expect(document.documentElement.dataset.introComplete).toBeUndefined();
  });
});

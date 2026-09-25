import { StrictMode } from "react";
import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

const mocks = vi.hoisted(() => {
  const instances: Array<{
    destroy: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
    raf: ReturnType<typeof vi.fn>;
    unsubscribe: ReturnType<typeof vi.fn>;
  }> = [];
  const activeTickers = new Set<(time: number) => void>();
  const ticker = {
    add: vi.fn((callback: (time: number) => void) =>
      activeTickers.add(callback),
    ),
    remove: vi.fn((callback: (time: number) => void) =>
      activeTickers.delete(callback),
    ),
    lagSmoothing: vi.fn(),
  };
  const Lenis = vi.fn(function LenisMock() {
    const unsubscribe = vi.fn();
    const instance = {
      destroy: vi.fn(),
      on: vi.fn(() => unsubscribe),
      raf: vi.fn(),
      unsubscribe,
    };
    instances.push(instance);
    return instance;
  });

  return {
    activeTickers,
    instances,
    Lenis,
    ticker,
    scrollTriggerUpdate: vi.fn(),
  };
});

vi.mock("lenis", () => ({ default: mocks.Lenis }));
vi.mock("@/lib/animations/gsap", () => ({
  gsap: { ticker: mocks.ticker },
  ScrollTrigger: { update: mocks.scrollTriggerUpdate },
}));

function installMatchMedia({ finePointer = true, reducedMotion = false } = {}) {
  const states = new Map<string, boolean>([
    ["(prefers-reduced-motion: reduce)", reducedMotion],
    ["(hover: hover) and (pointer: fine)", finePointer],
  ]);
  const listeners = new Map<
    string,
    Set<(event: MediaQueryListEvent) => void>
  >();
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => {
      const queryListeners = listeners.get(query) ?? new Set();
      listeners.set(query, queryListeners);
      return {
        get matches() {
          return states.get(query) ?? false;
        },
        media: query,
        onchange: null,
        addEventListener: (
          _type: "change",
          listener: (event: MediaQueryListEvent) => void,
        ) => queryListeners.add(listener),
        removeEventListener: (
          _type: "change",
          listener: (event: MediaQueryListEvent) => void,
        ) => queryListeners.delete(listener),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as MediaQueryList;
    }),
  );

  return {
    setMatches(query: string, nextMatches: boolean) {
      states.set(query, nextMatches);
      const event = {
        matches: nextMatches,
        media: query,
      } as MediaQueryListEvent;
      listeners.get(query)?.forEach((listener) => listener(event));
    },
  };
}

describe("SmoothScrollProvider", () => {
  beforeEach(() => {
    mocks.instances.length = 0;
    mocks.activeTickers.clear();
    mocks.Lenis.mockClear();
    mocks.ticker.add.mockClear();
    mocks.ticker.remove.mockClear();
    mocks.ticker.lagSmoothing.mockClear();
    mocks.scrollTriggerUpdate.mockClear();
    installMatchMedia();
  });

  it("synchronizes one Lenis instance to the GSAP ticker and cleans it up", () => {
    const { unmount } = render(
      <StrictMode>
        <SmoothScrollProvider>Content</SmoothScrollProvider>
      </StrictMode>,
    );
    const activeInstance = mocks.instances.at(-1)!;
    const tickerCallback = mocks.ticker.add.mock.calls.at(-1)![0];

    expect(mocks.Lenis).toHaveBeenLastCalledWith({
      lerp: 0.14,
      smoothWheel: true,
      wheelMultiplier: 1,
      syncTouch: false,
    });
    expect(activeInstance.on).toHaveBeenCalledWith(
      "scroll",
      mocks.scrollTriggerUpdate,
    );
    expect(mocks.activeTickers.size).toBe(1);
    expect(mocks.ticker.lagSmoothing).toHaveBeenCalledWith(500, 33);

    tickerCallback(1.25);
    expect(activeInstance.raf).toHaveBeenCalledWith(1250);

    unmount();
    expect(mocks.ticker.remove).toHaveBeenLastCalledWith(tickerCallback);
    expect(activeInstance.unsubscribe).toHaveBeenCalledOnce();
    expect(activeInstance.destroy).toHaveBeenCalledOnce();
    expect(mocks.activeTickers.size).toBe(0);
  });

  it("destroys active smooth scrolling when reduced motion is enabled", () => {
    const media = installMatchMedia();
    render(<SmoothScrollProvider>Content</SmoothScrollProvider>);
    const activeInstance = mocks.instances.at(-1)!;

    act(() => media.setMatches("(prefers-reduced-motion: reduce)", true));

    expect(activeInstance.destroy).toHaveBeenCalledOnce();
    expect(mocks.Lenis).toHaveBeenCalledTimes(1);
    expect(mocks.activeTickers.size).toBe(0);
  });

  it("keeps native scrolling on touch and coarse-pointer devices", () => {
    installMatchMedia({ finePointer: false });

    render(<SmoothScrollProvider>Content</SmoothScrollProvider>);

    expect(mocks.Lenis).not.toHaveBeenCalled();
    expect(mocks.ticker.add).not.toHaveBeenCalled();
    expect(mocks.activeTickers.size).toBe(0);
  });
});

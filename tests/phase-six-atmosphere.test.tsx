import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Atmosphere } from "@/components/atmosphere/Atmosphere";
import { SoundToggle } from "@/components/atmosphere/SoundToggle";
import { IntroProvider, useIntro } from "@/lib/context/IntroContext";
import {
  MOTION_STORAGE_KEY,
  MotionProvider,
} from "@/lib/context/MotionContext";
import { OverlayProvider } from "@/lib/context/OverlayContext";

type ObserverCallback = (
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver,
) => void;

let observerCallbacks: ObserverCallback[] = [];

class MockIntersectionObserver {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly thresholds = [0];
  constructor(callback: ObserverCallback) {
    observerCallbacks.push(callback);
  }
  disconnect = vi.fn();
  observe = vi.fn();
  takeRecords = vi.fn(() => []);
  unobserve = vi.fn();
}

function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionProvider>
      <IntroProvider>
        <OverlayProvider>{children}</OverlayProvider>
      </IntroProvider>
    </MotionProvider>
  );
}

function CompleteIntro() {
  const { markIntroComplete } = useIntro();
  return (
    <button onClick={markIntroComplete} type="button">
      Complete intro
    </button>
  );
}

describe("Phase 6 atmosphere", () => {
  beforeEach(() => {
    localStorage.clear();
    observerCallbacks = [];
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    document.head.innerHTML = '<meta name="theme-color" content="#1F3326">';
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
  });

  it("keeps progress hidden until the intro completes and omits unavailable audio", async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <CompleteIntro />
        <Atmosphere audioAvailable={false} />
      </Providers>,
    );

    expect(screen.queryByRole("button", { name: /ambient sound/i })).toBeNull();
    expect(screen.getByTestId("scroll-progress")).toHaveAttribute(
      "data-visible",
      "false",
    );
    await user.click(screen.getByRole("button", { name: "Complete intro" }));
    expect(screen.getByTestId("scroll-progress")).toHaveAttribute(
      "data-visible",
      "true",
    );
  });

  it("disables decorative grain for an explicit reduced-motion preference", () => {
    localStorage.setItem(MOTION_STORAGE_KEY, "reduce");
    render(
      <Providers>
        <Atmosphere audioAvailable={false} />
      </Providers>,
    );
    expect(screen.queryByTestId("film-grain")).toBeNull();
  });

  it("updates the browser theme color from the active section", () => {
    render(
      <Providers>
        <Atmosphere audioAvailable={false}>
          <section data-theme="light" />
          <section data-theme="dark" />
        </Atmosphere>
      </Providers>,
    );
    const dark = document.querySelector<HTMLElement>('[data-theme="dark"]')!;
    act(() => {
      observerCallbacks.forEach((callback) =>
        callback(
          [
            {
              isIntersecting: true,
              intersectionRatio: 0.8,
              target: dark,
            } as unknown as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver,
        ),
      );
    });
    expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute(
      "content",
      "#1F3326",
    );
  });

  it("starts only after opt-in, remembers it, and pauses while hidden", async () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockResolvedValue();
    const pause = vi
      .spyOn(HTMLMediaElement.prototype, "pause")
      .mockImplementation(() => undefined);
    const user = userEvent.setup();
    render(
      <Providers>
        <Atmosphere audioAvailable>
          <SoundToggle />
        </Atmosphere>
      </Providers>,
    );

    expect(play).not.toHaveBeenCalled();
    const toggle = screen.getByRole("button", {
      name: "Turn ambient sound on",
    });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(localStorage.getItem("studio-viana:sound")).toBe("on");
    expect(play).toHaveBeenCalledOnce();
    expect(screen.getByTestId("ambient-audio")).toHaveProperty("volume", 0.25);

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(pause).toHaveBeenCalled();

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(play).toHaveBeenCalledTimes(2);
  });
});

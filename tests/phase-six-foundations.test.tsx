import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MotionPreferenceToggle } from "@/components/a11y/MotionPreferenceToggle";
import { SkipLink } from "@/components/a11y/SkipLink";
import {
  MotionProvider,
  useMotionPreferences,
} from "@/lib/context/MotionContext";
import { isLowPowerDevice } from "@/lib/utils/device";

function installMatchMedia(reduced = false) {
  let matches = reduced;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      get matches() {
        return query.includes("prefers-reduced-motion") ? matches : false;
      },
      media: query,
      onchange: null,
      addEventListener: (
        _type: "change",
        listener: (event: MediaQueryListEvent) => void,
      ) => listeners.add(listener),
      removeEventListener: (
        _type: "change",
        listener: (event: MediaQueryListEvent) => void,
      ) => listeners.delete(listener),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
  return {
    setReduced(next: boolean) {
      matches = next;
      listeners.forEach((listener) =>
        listener({ matches: next } as MediaQueryListEvent),
      );
    },
  };
}

function MotionProbe() {
  const { lowPower, preference, setPreference, shouldReduceMotion } =
    useMotionPreferences();
  return (
    <>
      <output data-testid="motion-probe">
        {preference}:{String(shouldReduceMotion)}:{String(lowPower)}
      </output>
      <button onClick={() => setPreference("reduce")} type="button">
        Force calm
      </button>
    </>
  );
}

describe("Phase 6 motion and device foundations", () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.lowPower;
    delete document.documentElement.dataset.motion;
    vi.unstubAllGlobals();
    installMatchMedia();
  });

  it("classifies constrained devices without penalising capable devices", () => {
    expect(isLowPowerDevice({ hardwareConcurrency: 4 })).toBe(true);
    expect(isLowPowerDevice({ deviceMemory: 4, hardwareConcurrency: 8 })).toBe(
      true,
    );
    expect(
      isLowPowerDevice({
        connection: { saveData: true },
        deviceMemory: 8,
        hardwareConcurrency: 8,
      }),
    ).toBe(true);
    expect(
      isLowPowerDevice({
        connection: { saveData: false },
        deviceMemory: 8,
        hardwareConcurrency: 8,
      }),
    ).toBe(false);
  });

  it("lets a remembered full-motion choice override the operating system", () => {
    installMatchMedia(true);
    localStorage.setItem("studio-viana:motion", "full");

    render(
      <MotionProvider>
        <MotionProbe />
      </MotionProvider>,
    );

    expect(screen.getByTestId("motion-probe")).toHaveTextContent(
      "full:false:false",
    );
    expect(document.documentElement).toHaveAttribute("data-motion", "full");
  });

  it("persists an explicit calm choice and publishes it to the document", async () => {
    const user = userEvent.setup();
    render(
      <MotionProvider>
        <MotionProbe />
      </MotionProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Force calm" }));

    expect(localStorage.getItem("studio-viana:motion")).toBe("reduce");
    expect(document.documentElement).toHaveAttribute("data-motion", "reduce");
    expect(screen.getByTestId("motion-probe")).toHaveTextContent(
      "reduce:true:false",
    );
  });

  it("continues following operating-system changes in system mode", () => {
    const media = installMatchMedia();
    render(
      <MotionProvider>
        <MotionProbe />
      </MotionProvider>,
    );

    act(() => media.setReduced(true));

    expect(screen.getByTestId("motion-probe")).toHaveTextContent(
      "system:true:false",
    );
  });

  it("provides a first-focus skip link and an accessible footer toggle", async () => {
    const user = userEvent.setup();
    render(
      <MotionProvider>
        <SkipLink />
        <main id="main-content" tabIndex={-1}>
          Main content
        </main>
        <MotionPreferenceToggle />
      </MotionProvider>,
    );

    const skip = screen.getByRole("link", { name: "Skip to content" });
    const toggle = screen.getByRole("button", { name: "Reduce motion: off" });
    expect(skip).toHaveAttribute("href", "#main-content");
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await user.click(toggle);
    expect(
      screen.getByRole("button", { name: "Reduce motion: on" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});

import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useReducedMotion } from "@/lib/animations/useReducedMotion";

function installMatchMedia(initialMatches = false) {
  let matches = initialMatches;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  const mediaQuery = {
    get matches() {
      return matches;
    },
    media: "(prefers-reduced-motion: reduce)",
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
  } as MediaQueryList;

  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mediaQuery),
  );

  return {
    setMatches(nextMatches: boolean) {
      matches = nextMatches;
      const event = { matches, media: mediaQuery.media } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
  };
}

function MotionPreference() {
  return <output>{String(useReducedMotion())}</output>;
}

describe("useReducedMotion", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("reacts to changes in the operating-system motion preference", () => {
    const media = installMatchMedia();
    render(<MotionPreference />);

    expect(screen.getByText("false")).toBeVisible();

    act(() => media.setMatches(true));

    expect(screen.getByText("true")).toBeVisible();
  });
});

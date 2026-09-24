import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Reveal } from "@/components/animations/Reveal";
import { SplitTextReveal } from "@/components/animations/SplitTextReveal";
import { GoldDivider } from "@/components/ui/GoldDivider";

const mocks = vi.hoisted(() => ({
  reduceMotion: false,
  fromTo: vi.fn(),
  revert: vi.fn(),
}));

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => mocks.reduceMotion,
}));
vi.mock("@/lib/animations/gsap", () => ({
  gsap: {
    context: vi.fn((setup: () => void) => {
      setup();
      return { revert: mocks.revert };
    }),
    fromTo: mocks.fromTo,
  },
}));

describe("Reveal", () => {
  beforeEach(() => {
    mocks.reduceMotion = false;
    mocks.fromTo.mockClear();
    mocks.revert.mockClear();
  });

  afterEach(() => vi.clearAllMocks());

  it("keeps content immediately visible when reduced motion is enabled", () => {
    mocks.reduceMotion = true;
    render(<Reveal>Always readable</Reveal>);

    expect(screen.getByText("Always readable")).toBeVisible();
    expect(screen.getByText("Always readable")).toHaveStyle({ opacity: "1" });
    expect(mocks.fromTo).not.toHaveBeenCalled();
  });

  it("owns and reverts its GSAP context", () => {
    const { unmount } = render(<Reveal>Animated content</Reveal>);

    expect(mocks.fromTo).toHaveBeenCalledOnce();
    unmount();
    expect(mocks.revert).toHaveBeenCalledOnce();
  });
});

describe("SplitTextReveal", () => {
  it("keeps one accessible heading while preserving word punctuation and spacing", () => {
    const { container } = render(
      <SplitTextReveal as="h2" type="words">
        Flowers, forever.
      </SplitTextReveal>,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Flowers, forever." }),
    ).toBeVisible();
    const visualLayer = container.querySelector('[aria-hidden="true"]')!;
    expect(visualLayer.textContent).toBe("Flowers, forever.");
    expect(container.querySelectorAll("[data-split-token]")).toHaveLength(2);
  });

  it("uses explicit newlines as lines and otherwise keeps the string whole", () => {
    const { container, rerender } = render(
      <SplitTextReveal as="p" type="lines">
        {"First line\nSecond line"}
      </SplitTextReveal>,
    );
    expect(container.querySelectorAll("[data-split-token]")).toHaveLength(2);

    rerender(
      <SplitTextReveal as="p" type="lines">
        One complete sentence
      </SplitTextReveal>,
    );
    expect(container.querySelectorAll("[data-split-token]")).toHaveLength(1);
  });
});

describe("GoldDivider", () => {
  it("renders the final full-width transform when motion is reduced", () => {
    mocks.reduceMotion = true;
    mocks.fromTo.mockClear();
    render(<GoldDivider animate data-testid="divider" />);

    expect(screen.getByTestId("divider")).toHaveStyle({
      transform: "scaleX(1)",
    });
    expect(mocks.fromTo).not.toHaveBeenCalled();
  });
});

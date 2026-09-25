import { fireEvent, render, screen } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Reveal } from "@/components/animations/Reveal";
import { SplitTextReveal } from "@/components/animations/SplitTextReveal";
import { Float } from "@/components/animations/Float";
import { ImageReveal } from "@/components/animations/ImageReveal";
import { Marquee } from "@/components/animations/Marquee";
import { ParallaxImage } from "@/components/animations/ParallaxImage";
import { GoldDivider } from "@/components/ui/GoldDivider";

const mocks = vi.hoisted(() => ({
  reduceMotion: false,
  fromTo: vi.fn(),
  revert: vi.fn(),
  refresh: vi.fn(),
  timelineKill: vi.fn(),
  timelinePause: vi.fn(),
  timelinePlay: vi.fn(),
  timelineTimeScale: vi.fn(),
  to: vi.fn(),
  triggerKill: vi.fn(),
}));

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => mocks.reduceMotion,
}));
/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
vi.mock("next/image", () => ({
  default: function MockImage({
    fill,
    priority,
    ...props
  }: Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
    fill?: boolean;
    priority?: boolean;
    src: string;
  }) {
    return (
      <img
        {...props}
        data-fill={fill || undefined}
        data-priority={priority || undefined}
      />
    );
  },
}));
/* eslint-enable @next/next/no-img-element, jsx-a11y/alt-text */
vi.mock("@/lib/animations/gsap", () => ({
  gsap: {
    context: vi.fn((setup: () => void) => {
      setup();
      return { revert: mocks.revert };
    }),
    fromTo: mocks.fromTo,
    quickTo: vi.fn(() => vi.fn()),
    to: mocks.to,
    timeline: vi.fn(() => ({
      kill: mocks.timelineKill,
      pause: mocks.timelinePause,
      play: mocks.timelinePlay,
      timeScale: mocks.timelineTimeScale,
      to: vi.fn().mockReturnThis(),
    })),
  },
  ScrollTrigger: {
    create: vi.fn(() => ({ getVelocity: () => 0, kill: mocks.triggerKill })),
  },
  refreshScrollTrigger: mocks.refresh,
}));

describe("Reveal", () => {
  beforeEach(() => {
    mocks.reduceMotion = false;
    mocks.fromTo.mockClear();
    mocks.revert.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

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
  it("leaves controlled split tokens for a parent timeline", () => {
    mocks.reduceMotion = false;
    mocks.fromTo.mockClear();
    const { container } = render(
      <SplitTextReveal controlled as="h1" type="lines">
        {"Where flowers become\nforever memories."}
      </SplitTextReveal>,
    );

    expect(mocks.fromTo).not.toHaveBeenCalled();
    expect(container.querySelectorAll("[data-split-token]")).toHaveLength(2);
    expect(
      container.querySelector("[data-controlled-split]"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Where flowers become\s+forever memories\./,
      }),
    ).toBeVisible();
  });

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

  it("groups character tokens into unbreakable words", () => {
    const { container } = render(
      <SplitTextReveal as="h2" type="characters">
        The Grand Bouquet
      </SplitTextReveal>,
    );

    const words = container.querySelectorAll("[data-split-word]");
    expect(words).toHaveLength(3);
    expect(Array.from(words, (word) => word.textContent)).toEqual([
      "The",
      "Grand",
      "Bouquet",
    ]);
    expect(container.querySelectorAll("[data-split-token]")).toHaveLength(15);
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

describe("image animation primitives", () => {
  it("uses stable frames, requires useful alt text, and refreshes after load", () => {
    const { container } = render(
      <ParallaxImage
        alt="Botanical chenille study"
        src="/images/gallery/placeholder-botanical-01.svg"
      />,
    );

    expect(
      screen.getByRole("img", { name: "Botanical chenille study" }),
    ).toBeVisible();
    expect(container.firstChild).toHaveClass("aspect-[4/3]", "overflow-hidden");
    fireEvent.load(screen.getByRole("img"));
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("renders the complete image reveal state under reduced motion", () => {
    mocks.reduceMotion = true;
    const { container } = render(
      <ImageReveal
        alt="Soft floral texture"
        src="/images/gallery/placeholder-botanical-02.svg"
      />,
    );

    expect(container.firstChild).toHaveStyle({ clipPath: "inset(0% 0 0 0)" });
    expect(screen.getByRole("img")).toHaveStyle({ transform: "scale(1)" });
  });
});

describe("ambient motion primitives", () => {
  beforeEach(() => {
    mocks.reduceMotion = false;
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    mocks.to.mockReturnValue({
      kill: mocks.timelineKill,
      pause: mocks.timelinePause,
      play: mocks.timelinePlay,
    });
    vi.stubGlobal(
      "matchMedia",
      vi.fn(
        (query: string) =>
          ({
            matches: query.includes("pointer: fine"),
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
          }) as MediaQueryList,
      ),
    );
  });

  it("does not create Float motion for a coarse pointer", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(
        (query: string) =>
          ({
            matches: !query.includes("pointer: fine"),
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
          }) as MediaQueryList,
      ),
    );

    render(<Float>Still flower</Float>);

    expect(mocks.to).not.toHaveBeenCalled();
  });

  it("pauses and resumes Float motion as it leaves and enters the viewport", () => {
    mocks.reduceMotion = false;
    let visibilityCallback:
      ((entries: IntersectionObserverEntry[]) => void) | undefined;
    const observe = vi.fn();
    const disconnect = vi.fn();
    class MockIntersectionObserver {
      constructor(callback: (entries: IntersectionObserverEntry[]) => void) {
        visibilityCallback = callback;
      }

      disconnect = disconnect;
      observe = observe;
      unobserve = vi.fn();
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    render(<Float>Observed flower</Float>);
    expect(observe).toHaveBeenCalledOnce();

    visibilityCallback?.([
      { isIntersecting: true } as IntersectionObserverEntry,
    ]);
    expect(mocks.timelinePlay).toHaveBeenCalledOnce();
    visibilityCallback?.([
      { isIntersecting: false } as IntersectionObserverEntry,
    ]);
    expect(mocks.timelinePause).toHaveBeenCalledOnce();
  });

  it("removes Float pointer listeners when unmounted", () => {
    mocks.reduceMotion = false;
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const mediaQuery = {
      matches: true,
      media: "(hover: hover) and (pointer: fine)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as MediaQueryList;
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => mediaQuery),
    );

    const { unmount } = render(<Float>Floating flower</Float>);
    const pointerHandler = add.mock.calls.find(
      ([type]) => type === "pointermove",
    )?.[1];
    expect(pointerHandler).toBeTypeOf("function");

    unmount();
    expect(remove).toHaveBeenCalledWith("pointermove", pointerHandler);
    add.mockRestore();
    remove.mockRestore();
  });

  it("renders one accessible marquee phrase and two decorative copies", () => {
    const { container } = render(<Marquee text="Flowers that never fade" />);

    expect(container.querySelector(".sr-only")).toHaveTextContent(
      "Flowers that never fade",
    );
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
  });

  it("accepts reverse, velocity and skew controls", () => {
    render(<Marquee reverse skew text="Studio Viana" velocityFactor={1.5} />);

    expect(
      screen.getByText("Studio Viana", { selector: ".sr-only" }),
    ).toBeVisible();
  });

  it("pauses and resumes Marquee motion outside and inside the viewport", () => {
    mocks.reduceMotion = false;
    let visibilityCallback:
      ((entries: IntersectionObserverEntry[]) => void) | undefined;
    const observe = vi.fn();
    const disconnect = vi.fn();
    class MockIntersectionObserver {
      constructor(callback: (entries: IntersectionObserverEntry[]) => void) {
        visibilityCallback = callback;
      }

      disconnect = disconnect;
      observe = observe;
      unobserve = vi.fn();
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    const { unmount } = render(<Marquee text="Flowers that never fade" />);
    expect(observe).toHaveBeenCalledOnce();

    visibilityCallback?.([
      { isIntersecting: false } as IntersectionObserverEntry,
    ]);
    expect(mocks.timelinePause).toHaveBeenCalledOnce();
    visibilityCallback?.([
      { isIntersecting: true } as IntersectionObserverEntry,
    ]);
    expect(mocks.timelinePlay).toHaveBeenCalledOnce();

    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });
});

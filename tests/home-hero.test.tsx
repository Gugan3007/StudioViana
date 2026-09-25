import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ImgHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HomeHero } from "@/components/sections/home/HomeHero";
import { IntroProvider, useIntro } from "@/lib/context/IntroContext";

const heroMocks = vi.hoisted(() => ({
  reduceMotion: false,
  revert: vi.fn(),
  scrollTo: vi.fn(),
  timeline: {
    addLabel: vi.fn(),
    call: vi.fn(),
    fromTo: vi.fn(),
    set: vi.fn(),
    to: vi.fn(),
  },
}));

for (const method of ["addLabel", "call", "fromTo", "set", "to"] as const) {
  heroMocks.timeline[method].mockReturnValue(heroMocks.timeline);
}

vi.mock("@/lib/animations/useLenis", () => ({
  useLenis: () => ({ lenis: { scrollTo: heroMocks.scrollTo } }),
}));

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => heroMocks.reduceMotion,
}));

vi.mock("@/lib/animations/gsap", () => ({
  gsap: {
    context: vi.fn((setup: () => void) => {
      setup();
      return { revert: heroMocks.revert };
    }),
    matchMedia: vi.fn(() => ({ add: vi.fn(), revert: vi.fn() })),
    quickTo: vi.fn(() => vi.fn()),
    set: vi.fn(),
    timeline: vi.fn(() => heroMocks.timeline),
    to: vi.fn(() => ({ kill: vi.fn(), pause: vi.fn(), play: vi.fn() })),
  },
  ScrollTrigger: {
    create: vi.fn(() => ({ getVelocity: () => 0, kill: vi.fn() })),
  },
  refreshScrollTrigger: vi.fn(),
}));

/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
vi.mock("next/image", () => ({
  default: function MockImage({
    fill,
    placeholder,
    priority,
    src,
    ...props
  }: Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
    fill?: boolean;
    placeholder?: string;
    priority?: boolean;
    src: { src?: string } | string;
  }) {
    return (
      <img
        {...props}
        data-fill={fill || undefined}
        data-placeholder={placeholder}
        data-priority={priority || undefined}
        src={typeof src === "string" ? src : src.src}
      />
    );
  },
}));
/* eslint-enable @next/next/no-img-element, jsx-a11y/alt-text */

function CompletionControl() {
  const { markIntroComplete } = useIntro();
  return (
    <button onClick={markIntroComplete} type="button">
      Finish intro
    </button>
  );
}

function renderHero() {
  return render(
    <IntroProvider>
      <CompletionControl />
      <HomeHero />
      <section id="collection" />
    </IntroProvider>,
  );
}

describe("HomeHero", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    heroMocks.reduceMotion = false;
    heroMocks.revert.mockClear();
    heroMocks.scrollTo.mockClear();
    Object.values(heroMocks.timeline).forEach((mock) => mock.mockClear());
    delete document.documentElement.dataset.introComplete;
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 0,
    });
  });

  it("renders the locked hero copy, actions, and four descriptive product images", () => {
    renderHero();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Where flowers become forever memories.",
      }),
    ).toBeVisible();
    expect(
      screen.getByText(/Handcrafted chenille blooms, shaped stem by stem/),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Explore Collection" }),
    ).toHaveAttribute("href", "#collection");
    expect(
      screen.getByRole("link", { name: "Order on WhatsApp" }),
    ).toHaveAttribute("href", expect.stringMatching(/^https:\/\/wa\.me\//));
    expect(screen.getAllByRole("img")).toHaveLength(4);
    const images = screen.getAllByRole("img");
    for (const image of images) {
      expect(image).toHaveAttribute("data-placeholder", "blur");
      expect(image).not.toHaveAttribute("alt", "");
      expect(image).not.toHaveAttribute("data-priority");
    }
  });

  it("starts the controlled entrance once after intro completion", async () => {
    const user = userEvent.setup();
    renderHero();
    const hero = screen.getByTestId("home-hero");
    expect(hero).not.toHaveAttribute("data-hero-entered");

    await user.click(screen.getByRole("button", { name: "Finish intro" }));

    await waitFor(() =>
      expect(hero).toHaveAttribute("data-hero-entered", "true"),
    );
    expect(heroMocks.timeline.addLabel).toHaveBeenCalledWith("headline", 0.12);
    expect(heroMocks.timeline.addLabel).toHaveBeenCalledWith("images", 0.72);
  });

  it("starts on first view when a native jump reaches the hero before intro state settles", async () => {
    const user = userEvent.setup();
    let visibilityCallback:
      ((entries: IntersectionObserverEntry[]) => void) | undefined;
    const disconnect = vi.fn();
    class MockIntersectionObserver {
      constructor(callback: (entries: IntersectionObserverEntry[]) => void) {
        visibilityCallback = callback;
      }

      disconnect = disconnect;
      observe = vi.fn();
      unobserve = vi.fn();
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    renderHero();
    const hero = screen.getByTestId("home-hero");
    expect(hero).not.toHaveAttribute("data-hero-entered");

    act(() => {
      visibilityCallback?.([
        { isIntersecting: true } as IntersectionObserverEntry,
      ]);
    });

    await waitFor(() =>
      expect(hero).toHaveAttribute("data-hero-entered", "true"),
    );
    expect(heroMocks.timeline.fromTo).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Finish intro" }));
    expect(heroMocks.revert).not.toHaveBeenCalled();
  });

  it("renders the static final state when motion is reduced", async () => {
    heroMocks.reduceMotion = true;
    renderHero();

    await waitFor(() =>
      expect(screen.getByTestId("home-hero")).toHaveAttribute(
        "data-hero-entered",
        "true",
      ),
    );
    expect(heroMocks.timeline.fromTo).not.toHaveBeenCalled();
  });

  it("uses Lenis for the collection action", async () => {
    const user = userEvent.setup();
    renderHero();

    await user.click(screen.getByRole("link", { name: "Explore Collection" }));

    expect(heroMocks.scrollTo).toHaveBeenCalledWith(
      document.getElementById("collection")!.offsetTop,
      { duration: 1.4, offset: -84 },
    );
  });
});

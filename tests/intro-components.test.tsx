import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { createRef, type ImgHTMLAttributes } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AmbientParticles } from "@/components/intro/AmbientParticles";
import { BrandMoment } from "@/components/intro/BrandMoment";
import { FlowerDive } from "@/components/intro/FlowerDive";
import {
  FlowerSequence,
  type FlowerSequenceHandle,
} from "@/components/intro/FlowerSequence";
import { LightTransition } from "@/components/intro/LightTransition";
import { Preloader } from "@/components/intro/Preloader";
import { SkipIntro } from "@/components/intro/SkipIntro";
import type { PreloadResult } from "@/lib/animations/preloadImages";

const lifecycleMocks = vi.hoisted(() => ({
  contextLenis: null as null | {
    resize: ReturnType<typeof vi.fn>;
    scrollTo: ReturnType<typeof vi.fn>;
  },
  preload: vi.fn(),
  reduceMotion: false,
}));

vi.mock("@/lib/animations/preloadImages", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/lib/animations/preloadImages")>();
  return { ...original, preloadImages: lifecycleMocks.preload };
});

vi.mock("@/lib/animations/useLenis", () => ({
  useLenis: () => ({ lenis: lifecycleMocks.contextLenis }),
}));

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => lifecycleMocks.reduceMotion,
}));

/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
vi.mock("next/image", () => ({
  default: function MockImage(
    props: Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
      blurDataURL?: string;
      fill?: boolean;
      placeholder?: string;
      priority?: boolean;
      src: string;
    },
  ) {
    const { blurDataURL, fill, placeholder, priority, ...imageProps } = props;
    void blurDataURL;
    void placeholder;

    return (
      <img
        {...imageProps}
        data-fill={fill || undefined}
        data-priority={priority || undefined}
      />
    );
  },
}));
/* eslint-enable @next/next/no-img-element, jsx-a11y/alt-text */

describe("cinematic intro scenes", () => {
  beforeEach(() => {
    lifecycleMocks.contextLenis = null;
    lifecycleMocks.preload.mockReset();
    lifecycleMocks.reduceMotion = false;
    sessionStorage.clear();
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    vi.stubGlobal(
      "IntersectionObserver",
      vi.fn(function IntersectionObserverMock() {
        return {
          disconnect: vi.fn(),
          observe: vi.fn(),
          unobserve: vi.fn(),
        };
      }),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders the complete brand moment and accessible logo", () => {
    render(<BrandMoment particleCount={6} />);

    expect(screen.getByText("HANDCRAFTED CHENILLE FLORALS")).toBeVisible();
    expect(
      screen.getByText("Flowers that never fade, feelings that never end"),
    ).toBeVisible();
    expect(screen.getByText("TAMIL NADU · INDIA")).toBeVisible();
    expect(screen.getByText("2026–27 COLLECTION")).toBeVisible();
    expect(screen.getByText("Scroll to explore")).toBeVisible();
    expect(screen.getByRole("img", { name: "Studio Viana" })).toBeVisible();
    expect(document.querySelector("[data-intro-frame]")).toBeInTheDocument();
  });

  it("renders two decorative depth layers and one ordered poetic quotation", () => {
    render(<FlowerDive petalLayers={2} showMiddleLayer />);

    const quotation = screen.getByRole("blockquote", {
      name: "The making of forever",
    });
    const lines = within(quotation).getAllByTestId("poem-line");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toHaveTextContent("Shaped stem by stem…");
    expect(lines[1]).toHaveTextContent("petal by petal…");
    expect(lines[2]).toHaveTextContent("made to last forever.");
    expect(screen.getAllByTestId("petal-layer")).toHaveLength(2);
    expect(screen.getByTestId("flower-middle-layer")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(
      screen.getByRole("img", { name: /macro handcrafted/i }),
    ).toHaveAttribute("data-priority", "true");
  });

  it("uses the portrait flower and reduced layer set on mobile", () => {
    render(<FlowerDive mobile petalLayers={1} showMiddleLayer={false} />);

    expect(screen.getAllByTestId("petal-layer")).toHaveLength(1);
    expect(screen.queryByTestId("flower-middle-layer")).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /macro handcrafted/i }),
    ).toHaveAttribute("src", expect.stringContaining("mobile"));
  });

  it("keeps the light bloom and particles decorative and non-interactive", () => {
    const { rerender } = render(<AmbientParticles count={4} />);

    expect(document.querySelectorAll("[data-intro-particle]")).toHaveLength(4);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();

    rerender(<LightTransition />);
    expect(screen.getByTestId("light-transition")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("caps sequence canvas DPR, clamps frame requests, and cleans up", () => {
    const disconnect = vi.fn();
    const imageConstructor = vi.spyOn(window, "Image");
    const cancelAnimationFrame = vi.spyOn(window, "cancelAnimationFrame");
    const requestAnimationFrame = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation(() => 42);
    vi.stubGlobal(
      "ResizeObserver",
      vi.fn(function ResizeObserverMock() {
        return { disconnect, observe: vi.fn(), unobserve: vi.fn() };
      }),
    );
    Object.defineProperty(window, "devicePixelRatio", {
      configurable: true,
      value: 3,
    });
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 500,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 600,
    });
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      setTransform: vi.fn(),
    } as unknown as CanvasRenderingContext2D);

    const ref = createRef<FlowerSequenceHandle>();
    const { container, unmount } = render(
      <FlowerSequence
        ref={ref}
        focalPoint={{ x: 50, y: 48 }}
        frameUrls={["/frame-1.webp", "/frame-2.webp", "/frame-3.webp"]}
      />,
    );
    const canvas = container.querySelector("canvas")!;

    expect(imageConstructor).not.toHaveBeenCalled();
    expect(canvas.width).toBe(1000);
    expect(canvas.height).toBe(1200);
    act(() => ref.current?.setFrame(-2));
    expect(canvas).toHaveAttribute("data-frame", "0");
    act(() => ref.current?.setFrame(1.6));
    expect(canvas).toHaveAttribute("data-frame", "2");
    act(() => ref.current?.setFrame(99));
    expect(canvas).toHaveAttribute("data-frame", "2");

    unmount();
    expect(cancelAnimationFrame).toHaveBeenCalledWith(42);
    expect(disconnect).toHaveBeenCalledOnce();
    requestAnimationFrame.mockRestore();
    cancelAnimationFrame.mockRestore();
    imageConstructor.mockRestore();
  });

  it("locks scrolling, waits for first-visit minimum, and stops late Lenis", async () => {
    vi.useFakeTimers();
    let resolvePreload!: (value: PreloadResult) => void;
    lifecycleMocks.preload.mockReturnValue(
      new Promise<PreloadResult>((resolve) => {
        resolvePreload = resolve;
      }),
    );
    const onComplete = vi.fn();
    const lenis = { start: vi.fn(), stop: vi.fn() };
    const { rerender } = render(
      <Preloader
        lenis={null}
        onComplete={onComplete}
        reducedMotion
        urls={["/flower.svg"]}
      />,
    );

    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <Preloader
        lenis={lenis as never}
        onComplete={onComplete}
        reducedMotion
        urls={["/flower.svg"]}
      />,
    );
    expect(lenis.stop).toHaveBeenCalledOnce();

    await act(async () => {
      resolvePreload({ loaded: ["/flower.svg"], failed: [], timedOut: false });
      await Promise.resolve();
    });
    await act(() => vi.advanceTimersByTimeAsync(1799));
    expect(onComplete).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(1));

    expect(onComplete).toHaveBeenCalledOnce();
    expect(lenis.start).toHaveBeenCalledOnce();
    expect(document.documentElement.style.overflow).toBe("");
    expect(document.body.style.overflow).toBe("");
    expect(sessionStorage.getItem("studio-viana:intro-seen")).toBe("true");
  });

  it("uses the repeat-visit minimum and preserves partial timeout results", async () => {
    vi.useFakeTimers();
    sessionStorage.setItem("studio-viana:intro-seen", "true");
    let resolvePreload!: (value: PreloadResult) => void;
    lifecycleMocks.preload.mockReturnValueOnce(
      new Promise<PreloadResult>((resolve) => {
        resolvePreload = resolve;
      }),
    );
    const onRepeatComplete = vi.fn();
    const { unmount } = render(
      <Preloader
        lenis={null}
        onComplete={onRepeatComplete}
        reducedMotion
        urls={["/repeat.svg"]}
      />,
    );

    await act(async () => {
      resolvePreload({ loaded: ["/repeat.svg"], failed: [], timedOut: false });
      await Promise.resolve();
    });
    await act(() => vi.advanceTimersByTimeAsync(799));
    expect(onRepeatComplete).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(onRepeatComplete).toHaveBeenCalledOnce();
    unmount();

    sessionStorage.clear();
    lifecycleMocks.preload.mockImplementation(
      (
        _urls: readonly string[],
        _onProgress: unknown,
        options: { timeoutMs: number },
      ) =>
        new Promise<PreloadResult>((resolve) => {
          setTimeout(
            () =>
              resolve({
                loaded: ["/ready.svg"],
                failed: ["/stalled.svg"],
                timedOut: true,
              }),
            options.timeoutMs,
          );
        }),
    );
    const onTimeout = vi.fn();
    render(
      <Preloader
        lenis={null}
        onComplete={onTimeout}
        reducedMotion
        urls={["/ready.svg", "/stalled.svg"]}
      />,
    );
    await act(() => vi.advanceTimersByTimeAsync(6000));
    expect(onTimeout).toHaveBeenCalledOnce();
    expect(onTimeout).toHaveBeenCalledWith({
      loaded: ["/ready.svg"],
      failed: ["/stalled.svg"],
      timedOut: true,
    });
    await act(() => vi.runOnlyPendingTimersAsync());
    expect(onTimeout).toHaveBeenCalledOnce();
  });

  it("restores scrolling and only restarts a Lenis instance it stopped", () => {
    vi.useFakeTimers();
    lifecycleMocks.preload.mockReturnValue(new Promise(() => undefined));
    document.documentElement.style.overflow = "clip";
    document.body.style.overflow = "scroll";
    const lenis = { start: vi.fn(), stop: vi.fn() };
    const { unmount } = render(
      <Preloader
        lenis={lenis as never}
        onComplete={vi.fn()}
        reducedMotion
        urls={["/flower.svg"]}
      />,
    );

    expect(lenis.stop).toHaveBeenCalledOnce();
    unmount();

    expect(lenis.start).toHaveBeenCalledOnce();
    expect(document.documentElement.style.overflow).toBe("clip");
    expect(document.body.style.overflow).toBe("scroll");
  });

  it("skips with Lenis and falls back to native scrolling", () => {
    vi.useFakeTimers();
    const resize = vi.fn();
    const scrollTo = vi.fn();
    lifecycleMocks.contextLenis = { resize, scrollTo };
    const destination = document.createElement("section");
    destination.id = "home";
    destination.scrollIntoView = vi.fn();
    document.body.append(destination);

    const { rerender } = render(<SkipIntro destinationId="home" visible />);
    fireEvent.click(screen.getByRole("button", { name: "Skip intro" }));
    expect(resize).toHaveBeenCalledOnce();
    expect(scrollTo).toHaveBeenCalledWith(destination, { duration: 1.6 });

    lifecycleMocks.contextLenis = null;
    lifecycleMocks.reduceMotion = false;
    rerender(<SkipIntro destinationId="home" visible />);
    act(() => vi.runOnlyPendingTimers());
    fireEvent.click(screen.getByRole("button", { name: "Skip intro" }));
    expect(destination.scrollIntoView).toHaveBeenLastCalledWith({
      behavior: "smooth",
      block: "start",
    });

    lifecycleMocks.reduceMotion = true;
    rerender(<SkipIntro destinationId="home" visible />);
    act(() => vi.runOnlyPendingTimers());
    fireEvent.click(screen.getByRole("button", { name: "Skip intro" }));
    expect(destination.scrollIntoView).toHaveBeenLastCalledWith({
      behavior: "auto",
      block: "start",
    });
    destination.remove();
  });
});

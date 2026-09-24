import { act, render, screen, within } from "@testing-library/react";
import { createRef, type ImgHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AmbientParticles } from "@/components/intro/AmbientParticles";
import { BrandMoment } from "@/components/intro/BrandMoment";
import { FlowerDive } from "@/components/intro/FlowerDive";
import {
  FlowerSequence,
  type FlowerSequenceHandle,
} from "@/components/intro/FlowerSequence";
import { LightTransition } from "@/components/intro/LightTransition";

/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
vi.mock("next/image", () => ({
  default: function MockImage(props: Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
    blurDataURL?: string;
    fill?: boolean;
    placeholder?: string;
    priority?: boolean;
    src: string;
  }) {
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
    expect(screen.getByRole("img", { name: /macro handcrafted/i })).toHaveAttribute(
      "data-priority",
      "true",
    );
  });

  it("uses the portrait flower and reduced layer set on mobile", () => {
    render(<FlowerDive mobile petalLayers={1} showMiddleLayer={false} />);

    expect(screen.getAllByTestId("petal-layer")).toHaveLength(1);
    expect(screen.queryByTestId("flower-middle-layer")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: /macro handcrafted/i })).toHaveAttribute(
      "src",
      expect.stringContaining("mobile"),
    );
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
  });
});

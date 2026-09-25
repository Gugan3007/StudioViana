import { act, renderHook, waitFor } from "@testing-library/react";
import type Lenis from "lenis";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useNavTheme } from "@/components/layout/useNavTheme";
import { useScrollDirection } from "@/components/layout/useScrollDirection";

type LenisListener = (instance: Lenis) => void;

function createLenisSource() {
  let listener: LenisListener | undefined;
  const unsubscribe = vi.fn();
  const lenis = {
    on: vi.fn((_event: "scroll", nextListener: LenisListener) => {
      listener = nextListener;
      return unsubscribe;
    }),
  } as unknown as Lenis;

  return {
    emit(animatedScroll: number, direction: -1 | 0 | 1) {
      listener?.({ animatedScroll, direction } as Lenis);
    },
    lenis,
    unsubscribe,
  };
}

describe("navigation hooks", () => {
  const originalElementsFromPoint = document.elementsFromPoint;

  beforeEach(() => {
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 0,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(document, "elementsFromPoint", {
      configurable: true,
      value: originalElementsFromPoint,
    });
  });

  it("changes direction only after meaningful Lenis movement", () => {
    const source = createLenisSource();
    const { result, unmount } = renderHook(() =>
      useScrollDirection(source.lenis),
    );

    act(() => source.emit(1, 1));
    expect(result.current).toBe("up");
    act(() => source.emit(300, 1));
    expect(result.current).toBe("down");
    act(() => source.emit(299, -1));
    expect(result.current).toBe("down");
    act(() => source.emit(220, -1));
    expect(result.current).toBe("up");

    unmount();
    expect(source.unsubscribe).toHaveBeenCalledOnce();
  });

  it("uses the nearest declared theme region beneath the navbar", async () => {
    const darkSection = document.createElement("section");
    const darkBand = document.createElement("div");
    darkBand.dataset.theme = "dark";
    const darkCopy = document.createElement("span");
    darkBand.append(darkCopy);
    darkSection.append(darkBand);
    const lightSection = document.createElement("section");
    Object.defineProperty(document, "elementsFromPoint", {
      configurable: true,
      value: vi.fn(() => [lightSection, darkCopy, darkSection]),
    });
    const source = createLenisSource();
    const { result } = renderHook(() => useNavTheme(source.lenis));

    act(() => source.emit(420, 1));

    await waitFor(() => expect(result.current).toBe("dark"));
    expect(document.elementsFromPoint).toHaveBeenCalledWith(
      window.innerWidth / 2,
      42,
    );
  });

  it("returns to light when no dark section is under the header", () => {
    const lightSection = document.createElement("section");
    Object.defineProperty(document, "elementsFromPoint", {
      configurable: true,
      value: vi.fn(() => [lightSection]),
    });
    const { result } = renderHook(() => useNavTheme(null));

    act(() => window.dispatchEvent(new Event("scroll")));

    expect(result.current).toBe("light");
  });

  it("samples the expensive hit test at most once per animation frame", () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    const elementsFromPoint = vi.fn(() => []);
    Object.defineProperty(document, "elementsFromPoint", {
      configurable: true,
      value: elementsFromPoint,
    });
    const source = createLenisSource();

    renderHook(() => useNavTheme(source.lenis));
    act(() => frames.shift()?.(16));
    expect(elementsFromPoint).toHaveBeenCalledOnce();

    act(() => {
      source.emit(100, 1);
      source.emit(200, 1);
      source.emit(300, 1);
    });
    expect(elementsFromPoint).toHaveBeenCalledOnce();

    act(() => frames.shift()?.(32));
    expect(elementsFromPoint).toHaveBeenCalledTimes(2);
  });
});

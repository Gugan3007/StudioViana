import { afterEach, describe, expect, it, vi } from "vitest";

import { preloadImages } from "@/lib/animations/preloadImages";

interface FakeImageOptions {
  delayMs?: number;
  fail?: ReadonlySet<string>;
  decodeFail?: ReadonlySet<string>;
  neverSettle?: boolean;
  onActiveChange?: (active: number) => void;
}

function makeImageFactory({
  delayMs = 0,
  fail = new Set(),
  decodeFail = new Set(),
  neverSettle = false,
  onActiveChange,
}: FakeImageOptions = {}) {
  let active = 0;

  return () => {
    const listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();
    let source = "";

    const image = {
      decoding: "auto",
      get src() {
        return source;
      },
      set src(value: string) {
        source = value;
        active += 1;
        onActiveChange?.(active);

        if (neverSettle) return;

        window.setTimeout(() => {
          active -= 1;
          onActiveChange?.(active);
          const type = fail.has(value) ? "error" : "load";
          for (const listener of listeners.get(type) ?? []) {
            if (typeof listener === "function") listener(new Event(type));
            else listener.handleEvent(new Event(type));
          }
        }, delayMs);
      },
      addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
      ) {
        const typeListeners = listeners.get(type) ?? new Set();
        typeListeners.add(listener);
        listeners.set(type, typeListeners);
      },
      removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
      ) {
        listeners.get(type)?.delete(listener);
      },
      decode: vi.fn(() =>
        decodeFail.has(source)
          ? Promise.reject(new Error("decode failed"))
          : Promise.resolve(),
      ),
    };

    return image as unknown as HTMLImageElement;
  };
}

describe("preloadImages", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("decodes unique images and reports real completion progress", async () => {
    vi.useFakeTimers();
    const progress: number[] = [];
    const promise = preloadImages(
      ["/one.webp", "/one.webp", "/two.webp"],
      (value) => progress.push(value.percent),
      { createImage: makeImageFactory(), concurrency: 1 },
    );

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(progress).toEqual([0, 50, 100]);
    expect(result).toEqual({
      loaded: ["/one.webp", "/two.webp"],
      failed: [],
      timedOut: false,
    });
  });

  it("counts network and decode failures without rejecting the batch", async () => {
    vi.useFakeTimers();
    const promise = preloadImages(
      ["/good.webp", "/network.webp", "/decode.webp"],
      undefined,
      {
        createImage: makeImageFactory({
          fail: new Set(["/network.webp"]),
          decodeFail: new Set(["/decode.webp"]),
        }),
        concurrency: 2,
      },
    );

    await vi.runAllTimersAsync();

    await expect(promise).resolves.toEqual({
      loaded: ["/good.webp"],
      failed: ["/network.webp", "/decode.webp"],
      timedOut: false,
    });
  });

  it("never exceeds the configured request concurrency", async () => {
    vi.useFakeTimers();
    let maximumActive = 0;
    const promise = preloadImages(
      ["/1.webp", "/2.webp", "/3.webp", "/4.webp"],
      undefined,
      {
        concurrency: 2,
        createImage: makeImageFactory({
          delayMs: 20,
          onActiveChange(active) {
            maximumActive = Math.max(maximumActive, active);
          },
        }),
      },
    );

    await vi.runAllTimersAsync();
    await promise;

    expect(maximumActive).toBe(2);
  });

  it("times out pending work once and advances progress to 100 percent", async () => {
    vi.useFakeTimers();
    const progress: number[] = [];
    const promise = preloadImages(
      ["/one.webp", "/two.webp"],
      (value) => progress.push(value.percent),
      {
        concurrency: 1,
        createImage: makeImageFactory({ neverSettle: true }),
        timeoutMs: 50,
      },
    );

    await vi.advanceTimersByTimeAsync(50);

    await expect(promise).resolves.toEqual({
      loaded: [],
      failed: ["/one.webp", "/two.webp"],
      timedOut: true,
    });
    expect(progress).toEqual([0, 50, 100]);
  });
});

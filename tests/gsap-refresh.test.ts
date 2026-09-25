import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  defaults: vi.fn(),
  refresh: vi.fn(),
  registerPlugin: vi.fn(),
}));

vi.mock("gsap", () => ({
  gsap: {
    defaults: mocks.defaults,
    registerPlugin: mocks.registerPlugin,
  },
}));
vi.mock("gsap/Flip", () => ({ Flip: {} }));
vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: { refresh: mocks.refresh },
}));

import { refreshScrollTrigger } from "@/lib/animations/gsap";

describe("refreshScrollTrigger", () => {
  let callbacks: FrameRequestCallback[];

  beforeEach(() => {
    callbacks = [];
    mocks.refresh.mockClear();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callbacks.push(callback);
      return callbacks.length;
    });
  });

  it("coalesces bursts of image-load refreshes into one animation frame", () => {
    refreshScrollTrigger();
    refreshScrollTrigger();
    refreshScrollTrigger();

    expect(window.requestAnimationFrame).toHaveBeenCalledOnce();
    expect(mocks.refresh).not.toHaveBeenCalled();

    callbacks[0](16);
    expect(mocks.refresh).toHaveBeenCalledOnce();

    refreshScrollTrigger();
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
  });
});

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Testimonials } from "@/components/sections/testimonials/Testimonials";

const testimonialMocks = vi.hoisted(() => ({
  callbacks: [] as IntersectionObserverCallback[],
  reduceMotion: false,
}));

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => testimonialMocks.reduceMotion,
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

describe("Phase 4 testimonials", () => {
  beforeEach(() => {
    testimonialMocks.callbacks = [];
    testimonialMocks.reduceMotion = false;
    class MockIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        testimonialMocks.callbacks.push(callback);
      }
      disconnect = vi.fn();
      observe = vi.fn();
      takeRecords = vi.fn(() => []);
      unobserve = vi.fn();
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  it("navigates placeholder reviews and does not autoplay when reduced", () => {
    vi.useFakeTimers();
    testimonialMocks.reduceMotion = true;
    render(<Testimonials />);
    const region = screen.getByRole("region", {
      name: "Customer testimonials",
    });
    expect(region).toHaveAttribute("aria-live", "polite");
    const first = within(region).getByTestId("testimonial-name").textContent;

    fireEvent.click(
      within(region).getByRole("button", { name: "Next testimonial" }),
    );
    expect(
      within(region).getByTestId("testimonial-name"),
    ).not.toHaveTextContent(first ?? "");
    const manuallySelected =
      within(region).getByTestId("testimonial-name").textContent;
    act(() => vi.advanceTimersByTime(12_000));
    expect(within(region).getByTestId("testimonial-name")).toHaveTextContent(
      manuallySelected ?? "",
    );
    vi.useRealTimers();
  });

  it("autoplays only while visible and unhovered", () => {
    vi.useFakeTimers();
    const { container } = render(<Testimonials />);
    const region = screen.getByRole("region", {
      name: "Customer testimonials",
    });
    const first = within(region).getByTestId("testimonial-name").textContent;

    act(() => vi.advanceTimersByTime(6_000));
    expect(within(region).getByTestId("testimonial-name")).toHaveTextContent(
      first ?? "",
    );
    act(() => {
      testimonialMocks.callbacks[0]?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    act(() => vi.advanceTimersByTime(6_000));
    expect(
      within(region).getByTestId("testimonial-name"),
    ).not.toHaveTextContent(first ?? "");

    const visibleName =
      within(region).getByTestId("testimonial-name").textContent;
    fireEvent.pointerEnter(container.querySelector("#testimonials")!);
    act(() => vi.advanceTimersByTime(6_000));
    expect(within(region).getByTestId("testimonial-name")).toHaveTextContent(
      visibleName ?? "",
    );
    vi.useRealTimers();
  });
});

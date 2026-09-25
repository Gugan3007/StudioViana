import { render, screen } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InstagramStrip } from "@/components/sections/instagram/InstagramStrip";
import { VelocityMarquee } from "@/components/sections/instagram/VelocityMarquee";

const socialMocks = vi.hoisted(() => ({
  reduceMotion: false,
  set: vi.fn(),
  to: vi.fn(() => ({ kill: vi.fn() })),
  triggerUpdate: undefined as
    ((self: { getVelocity: () => number }) => void) | undefined,
}));

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => socialMocks.reduceMotion,
}));

vi.mock("@/lib/animations/useFinePointer", () => ({
  useFinePointer: () => true,
}));

vi.mock("@/lib/animations/gsap", () => ({
  gsap: {
    quickTo: vi.fn(() => vi.fn()),
    set: socialMocks.set,
    timeline: vi.fn(() => ({
      fromTo: vi.fn().mockReturnThis(),
      kill: vi.fn(),
      pause: vi.fn(),
      play: vi.fn(),
      to: vi.fn().mockReturnThis(),
    })),
    to: socialMocks.to,
  },
  ScrollTrigger: {
    create: vi.fn(
      (config: {
        onUpdate?: (self: { getVelocity: () => number }) => void;
      }) => {
        socialMocks.triggerUpdate = config.onUpdate;
        return { getVelocity: () => 0, kill: vi.fn() };
      },
    ),
  },
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

describe("Phase 4 social finale", () => {
  beforeEach(() => {
    socialMocks.reduceMotion = false;
    socialMocks.triggerUpdate = undefined;
    vi.clearAllMocks();
  });

  it("renders ten profile links and two accessible velocity rows", () => {
    const { container } = render(
      <>
        <InstagramStrip />
        <VelocityMarquee />
      </>,
    );

    expect(
      screen.getAllByRole("link", { name: /View .* on Instagram/ }),
    ).toHaveLength(10);
    expect(container.querySelectorAll("#instagram a[href]")).toHaveLength(22);
    const duplicateLinks = container.querySelectorAll(
      "#instagram [data-instagram-duplicate]",
    );
    expect(duplicateLinks).toHaveLength(10);
    duplicateLinks.forEach((link) => {
      expect(link).toHaveAttribute("aria-hidden", "true");
      expect(link).toHaveAttribute("tabindex", "-1");
    });
    expect(
      screen.getByText(/Handcrafted, made to order and curated with love/),
    ).toHaveClass("sr-only");
  });

  it("settles the Instagram rail and clears its transform on cleanup", () => {
    vi.useFakeTimers();
    const { unmount } = render(<InstagramStrip />);

    socialMocks.triggerUpdate?.({ getVelocity: () => -2_400 });
    expect(socialMocks.to).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ timeScale: expect.any(Number) }),
    );
    vi.advanceTimersByTime(250);
    expect(socialMocks.to).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ timeScale: 1 }),
    );

    unmount();
    expect(socialMocks.set).toHaveBeenCalledWith(expect.anything(), {
      clearProps: "transform",
    });
    vi.useRealTimers();
  });
});

import { render, screen } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ImageReveal } from "@/components/animations/ImageReveal";
import { AboutStudio } from "@/components/sections/home/AboutStudio";
import { WordScrubText } from "@/components/sections/home/WordScrubText";

const aboutMocks = vi.hoisted(() => ({
  fromTo: vi.fn(),
  reduceMotion: false,
  refresh: vi.fn(),
  revert: vi.fn(),
  set: vi.fn(),
  to: vi.fn(),
}));

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => aboutMocks.reduceMotion,
}));

vi.mock("@/lib/animations/gsap", () => ({
  gsap: {
    context: vi.fn((setup: () => void) => {
      setup();
      return { revert: aboutMocks.revert };
    }),
    fromTo: aboutMocks.fromTo,
    set: aboutMocks.set,
    to: aboutMocks.to,
  },
  refreshScrollTrigger: aboutMocks.refresh,
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

describe("WordScrubText", () => {
  beforeEach(() => {
    aboutMocks.reduceMotion = false;
    vi.clearAllMocks();
  });

  it("keeps one semantic paragraph while decorative words stay hidden", () => {
    const { container } = render(
      <WordScrubText>Every gift should tell a story.</WordScrubText>,
    );

    expect(screen.getByText("Every gift should tell a story.")).toBeVisible();
    expect(container.querySelectorAll("[data-scrub-word]")).toHaveLength(6);
    expect(container.querySelector("[data-scrub-copy]")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(aboutMocks.fromTo).toHaveBeenCalledWith(
      expect.anything(),
      { opacity: 0.95 },
      expect.objectContaining({ opacity: 1 }),
    );
  });

  it("renders all words at full opacity for reduced motion", () => {
    aboutMocks.reduceMotion = true;
    const { container } = render(
      <WordScrubText>Petal by petal.</WordScrubText>,
    );

    for (const word of container.querySelectorAll("[data-scrub-word]")) {
      expect(word).toHaveStyle({ opacity: "1" });
    }
    expect(aboutMocks.fromTo).not.toHaveBeenCalled();
  });
});

describe("AboutStudio", () => {
  beforeEach(() => {
    aboutMocks.reduceMotion = false;
    vi.clearAllMocks();
  });

  it("renders the founder story, signature, image, and all four values", () => {
    render(<AboutStudio />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Where flowers become forever memories.",
      }),
    ).toBeVisible();
    expect(screen.getByText("Dr. Sadhana")).toBeVisible();
    expect(screen.getByText("FOUNDER, STUDIO VIANA")).toBeVisible();
    expect(screen.getByText("100%")).toBeVisible();
    expect(screen.getByText("Made to Order")).toBeVisible();
    expect(screen.getByText("Your colours, your flowers")).toBeVisible();
    expect(screen.getByText("Blooms that never fade")).toBeVisible();
    expect(
      screen.getByRole("img", {
        name: /lilac and pearl handcrafted chenille bouquet/i,
      }),
    ).toHaveAttribute("data-placeholder", "blur");
  });

  it("supports a top-down ImageReveal entrance", () => {
    render(
      <ImageReveal
        alt="Top-down reveal sample"
        direction="top"
        src="/images/gallery/placeholder-botanical-01.svg"
      />,
    );

    expect(aboutMocks.fromTo).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      { clipPath: "inset(0 0 100% 0)" },
      expect.objectContaining({ clipPath: "inset(0% 0 0 0)" }),
    );
  });

  it("keeps the completed 100% value when reduced motion settles after mount", () => {
    aboutMocks.reduceMotion = false;
    const { container, rerender } = render(<AboutStudio />);
    container.querySelector<HTMLElement>("[data-count]")!.textContent = "0%";
    aboutMocks.reduceMotion = true;
    rerender(<AboutStudio />);

    expect(screen.getByText("100%")).toBeVisible();
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
  });
});

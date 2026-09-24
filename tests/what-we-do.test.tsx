import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ServiceColumn } from "@/components/sections/home/ServiceColumn";
import { WhatWeDo } from "@/components/sections/home/WhatWeDo";
import { services } from "@/lib/data/products";

const craftMocks = vi.hoisted(() => ({
  reduceMotion: false,
  fromTo: vi.fn(),
  quickTo: vi.fn(() => vi.fn()),
  revert: vi.fn(),
  set: vi.fn(),
  timeline: {
    fromTo: vi.fn().mockReturnThis(),
    kill: vi.fn(),
    to: vi.fn().mockReturnThis(),
  },
  to: vi.fn(() => ({ kill: vi.fn() })),
}));

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => craftMocks.reduceMotion,
}));

vi.mock("@/lib/animations/gsap", () => ({
  gsap: {
    context: vi.fn((setup: () => void) => {
      setup();
      return { revert: craftMocks.revert };
    }),
    fromTo: craftMocks.fromTo,
    quickTo: craftMocks.quickTo,
    set: craftMocks.set,
    timeline: vi.fn(() => craftMocks.timeline),
    to: craftMocks.to,
  },
  ScrollTrigger: {
    create: vi.fn(() => ({ kill: vi.fn() })),
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

function mediaQuery(matches: boolean): MediaQueryList {
  return {
    matches,
    media: "(hover: hover) and (pointer: fine)",
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
}

describe("WhatWeDo", () => {
  beforeEach(() => {
    craftMocks.reduceMotion = false;
    vi.clearAllMocks();
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => mediaQuery(false)),
    );
  });

  it("renders four numbered services from canonical data", () => {
    render(<WhatWeDo />);

    expect(screen.getAllByRole("article")).toHaveLength(4);
    expect(
      screen.getByRole("heading", { name: "Corporate Events" }),
    ).toBeVisible();
    expect(
      screen.getByText(
        "Curated gift hampers built around a floral centrepiece, dressed for birthdays, anniversaries and thank-you gestures.",
      ),
    ).toBeVisible();
    expect(screen.getAllByRole("link", { name: /discover/i })).toSatisfy(
      (links: HTMLElement[]) =>
        links.every((link) => link.getAttribute("href") === "#collection"),
    );
  });

  it("marks only the marquee band as a dark navigation theme", () => {
    const { container } = render(<WhatWeDo />);

    expect(screen.getByTestId("craft-marquee")).toHaveAttribute(
      "data-theme",
      "dark",
    );
    expect(container.querySelectorAll('[data-theme="dark"]')).toHaveLength(1);
  });

  it("uses the exact band headline and renders its complete static state for reduced motion", () => {
    craftMocks.reduceMotion = false;
    const { container, rerender } = render(<WhatWeDo />);
    for (const number of container.querySelectorAll<HTMLElement>(
      "article > p:first-child",
    )) {
      number.textContent = "00";
    }
    craftMocks.reduceMotion = true;
    rerender(<WhatWeDo />);

    expect(
      screen.getByRole("heading", { name: "Made by hand. Made for moments." }),
    ).toBeVisible();
    expect(container.querySelector("[data-expanding-frame]")).toHaveStyle({
      clipPath: "inset(0% 0% round 0px)",
    });
    expect(container.querySelector("[data-expanding-image]")).toHaveStyle({
      transform: "scale(1)",
    });
    expect(screen.getByText("01")).toBeVisible();
    expect(screen.getByText("04")).toBeVisible();
    expect(screen.queryAllByText("00")).toHaveLength(0);
  });

  it("mounts and toggles the cursor preview only for a fine pointer", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => mediaQuery(true)),
    );
    const { container } = render(
      <ServiceColumn
        image="/images/products/just-for-you-hamper.jpg"
        service={services[0]}
      />,
    );

    const article = screen.getByRole("article");
    await waitFor(() =>
      expect(
        container.querySelector("[data-cursor-preview]"),
      ).toBeInTheDocument(),
    );

    fireEvent.pointerEnter(article);
    expect(container.querySelector("[data-cursor-preview]")).toHaveAttribute(
      "data-visible",
      "true",
    );
    fireEvent.pointerLeave(article);
    expect(container.querySelector("[data-cursor-preview]")).toHaveAttribute(
      "data-visible",
      "false",
    );
  });
});

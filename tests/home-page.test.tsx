import { render, screen, waitFor, within } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";

import Home from "@/app/page";

vi.mock("@/components/intro/IntroSection", () => ({
  IntroSection: () =>
    createElement("section", {
      "aria-label": "Studio Viana cinematic introduction",
      "data-testid": "intro-section",
    }),
}));

vi.mock("@/lib/context/IntroContext", () => ({
  useIntro: () => ({
    introComplete: true,
    markIntroActive: vi.fn(),
    markIntroComplete: vi.fn(),
  }),
}));

vi.mock("@/lib/animations/useLenis", () => ({
  useLenis: () => ({ lenis: null }),
}));

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => true,
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

describe("Studio Viana home page", () => {
  it("composes the complete Phase 5 one-page journey in the approved order", async () => {
    render(<Home />);
    await screen.findByRole(
      "heading",
      {
        level: 2,
        name: "Design your bouquet",
      },
      { timeout: 5_000 },
    );
    const main = screen.getByRole("main");
    const intro = within(main).getByTestId("intro-section");
    const hero = document.querySelector("#home");
    const ids = [...document.querySelectorAll("main > section[id]")].map(
      (node) => node.id,
    );

    expect(ids).toEqual([
      "home",
      "about",
      "craft",
      "collection",
      "craft-closeup",
      "process",
      "gallery",
      "testimonials",
      "instagram",
      "pricing",
      "order",
      "corporate",
      "faq",
      "contact",
    ]);
    expect(hero).toBeInTheDocument();
    expect(intro.compareDocumentPosition(hero!)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(
      within(main).getByRole("heading", {
        level: 1,
        name: "Where flowers become forever memories.",
      }),
    ).toBeVisible();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.queryByText("Phase 2 begins here")).not.toBeInTheDocument();
    expect(
      screen.queryByText("A quiet place to test the flow"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Design System")).not.toBeInTheDocument();
    expect(
      within(main).getByRole("heading", { level: 2, name: "The Collection" }),
    ).toBeVisible();
    expect(within(main).getAllByText("Flower Cards").length).toBeGreaterThan(0);
    expect(
      within(main).getAllByText("Corporate & Bulk Orders").length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText("Phase 3")).not.toBeInTheDocument();
    expect(screen.queryByText("Phase 5")).not.toBeInTheDocument();
    expect(
      within(main).getByRole("heading", { level: 2, name: "Pricing Guide" }),
    ).toBeVisible();
    expect(
      within(main).getByRole("heading", {
        level: 2,
        name: "Design your bouquet",
      }),
    ).toBeVisible();
  });

  it("keeps all navigation targets labelled and includes the exact Home copy", async () => {
    render(<Home />);

    await waitFor(
      () => {
        expect(
          document.querySelector("[data-phase-five-loading]"),
        ).not.toBeInTheDocument();
      },
      { timeout: 5_000 },
    );

    expect(
      screen.getByText(
        /Handcrafted chenille blooms, shaped stem by stem and petal by petal/,
      ),
    ).toBeVisible();

    for (const id of [
      "home",
      "about",
      "craft",
      "collection",
      "craft-closeup",
      "process",
      "gallery",
      "testimonials",
      "instagram",
      "pricing",
      "order",
      "corporate",
      "faq",
      "contact",
    ]) {
      const section = document.getElementById(id);
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute("aria-labelledby");
      const labelId = section?.getAttribute("aria-labelledby");
      expect(labelId && document.getElementById(labelId)).toBeInTheDocument();
    }
  });
});

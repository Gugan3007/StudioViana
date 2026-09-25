import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ImgHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GrandBouquetShowcase } from "@/components/sections/collection/GrandBouquetShowcase";

const showcaseMocks = vi.hoisted(() => ({
  finePointer: true,
  fromTo: vi.fn(),
  reduceMotion: false,
  revert: vi.fn(),
}));

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => showcaseMocks.reduceMotion,
}));

vi.mock("@/lib/animations/useFinePointer", () => ({
  useFinePointer: () => showcaseMocks.finePointer,
}));

vi.mock("@/lib/animations/gsap", () => ({
  gsap: {
    context: vi.fn((setup: () => void) => {
      setup();
      return { revert: showcaseMocks.revert };
    }),
    fromTo: showcaseMocks.fromTo,
  },
}));

/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
vi.mock("next/image", () => ({
  default: function MockImage({
    fill,
    placeholder,
    src,
    ...props
  }: Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
    fill?: boolean;
    placeholder?: string;
    src: { src?: string } | string;
  }) {
    return (
      <img
        {...props}
        data-fill={fill || undefined}
        data-placeholder={placeholder}
        src={typeof src === "string" ? src : src.src}
      />
    );
  },
}));
/* eslint-enable @next/next/no-img-element, jsx-a11y/alt-text */

describe("GrandBouquetShowcase", () => {
  beforeEach(() => {
    showcaseMocks.finePointer = true;
    showcaseMocks.reduceMotion = false;
    showcaseMocks.fromTo.mockClear();
  });

  it("renders the dark signature moment and opens its canonical product", async () => {
    const user = userEvent.setup();
    const onOpenDetail = vi.fn();
    const { container } = render(
      <GrandBouquetShowcase onOpenDetail={onOpenDetail} />,
    );

    const section = container.querySelector("section")!;
    expect(section).toHaveAttribute("data-theme", "dark");
    expect(
      screen.getByRole("heading", { name: "The Grand Bouquet" }),
    ).toBeVisible();
    expect(
      screen.getByText(
        "Our most opulent creation — a full, rounded dome of blooms wrapped in imported sheer, for the moments that deserve a grand gesture.",
      ),
    ).toBeVisible();
    expect(screen.getByText("₹1,250")).toBeVisible();
    expect(container.querySelectorAll("[data-pearl]")).toHaveLength(18);

    await user.click(screen.getByRole("button", { name: "View Details" }));
    expect(onOpenDetail).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "grand-bouquet" }),
      expect.any(HTMLElement),
    );
  });

  it("removes continuous particles and scrub motion when reduced", () => {
    showcaseMocks.reduceMotion = true;
    const { container } = render(
      <GrandBouquetShowcase onOpenDetail={vi.fn()} />,
    );

    expect(container.querySelectorAll("[data-pearl]")).toHaveLength(0);
    expect(showcaseMocks.fromTo).not.toHaveBeenCalled();
  });
});

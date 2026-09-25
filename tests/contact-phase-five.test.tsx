import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ImgHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContactSection } from "@/components/sections/contact/ContactSection";
import { site } from "@/lib/data/site";

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => true,
}));
vi.mock("@/lib/animations/gsap", () => ({
  gsap: {
    context: vi.fn((setup: () => void) => {
      setup();
      return { revert: vi.fn() };
    }),
    fromTo: vi.fn(),
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

describe("Phase 5 contact finale", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("renders all editable contact links, region, hours and framed image", () => {
    const { container } = render(<ContactSection />);
    const contact = container.querySelector("#contact") as HTMLElement;
    expect(contact).toHaveAttribute("data-theme", "dark");
    expect(
      screen.getByRole("heading", {
        name: "Let's create something beautiful together.",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("img", { name: /pink gerbera flower card/i }),
    ).toBeVisible();
    expect(within(contact).getByRole("link", { name: site.email })).toHaveAttribute(
      "href",
      `mailto:${site.email}`,
    );
    expect(within(contact).getByRole("link", { name: site.instagramHandle })).toHaveAttribute(
      "href",
      site.instagramUrl,
    );
    expect(within(contact).getByRole("link", { name: site.whatsappDisplay })).toHaveAttribute(
      "href",
      expect.stringContaining("wa.me/919488713438"),
    );
    expect(screen.getByText(site.businessHours)).toBeVisible();
    expect(screen.getByText(new RegExp(site.deliveryRegions.join(".*")))).toBeVisible();
  });

  it("copies a contact value and exposes gentle feedback", async () => {
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);
    render(<ContactSection />);
    await user.click(screen.getByRole("button", { name: "Copy email" }));
    expect(writeText).toHaveBeenCalledWith(site.email);
    expect(screen.getByText("Copied ✓")).toBeVisible();
  });
});

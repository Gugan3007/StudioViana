import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";

import { BulkEnquiryForm } from "@/components/sections/corporate/BulkEnquiryForm";
import { ClientLogos } from "@/components/sections/corporate/ClientLogos";
import { CorporateSection } from "@/components/sections/corporate/CorporateSection";

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => true,
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

describe("Phase 5 corporate enquiries", () => {
  it("renders the framed dark story, use cases and features", () => {
    const { container } = render(<CorporateSection />);
    expect(container.querySelector("#corporate")).toHaveAttribute(
      "data-theme",
      "dark",
    );
    expect(
      screen.getByRole("heading", {
        name: "Corporate gifting & return gifts, made by hand.",
      }),
    ).toBeVisible();
    expect(screen.getByText("Weddings & receptions")).toBeVisible();
    expect(screen.getByText("Corporate events & launches")).toBeVisible();
    expect(screen.getByText("Custom branding & tags")).toBeVisible();
    expect(screen.getAllByRole("img")).toHaveLength(3);
  });

  it("suppresses an empty client logo strip", () => {
    const { container, rerender } = render(<ClientLogos logos={[]} />);
    expect(container).toBeEmptyDOMElement();
    rerender(
      <ClientLogos
        logos={[{ name: "Studio client", src: "/brand/client.svg" }]}
      />,
    );
    expect(
      screen.getByText("Trusted for celebrations across Tamil Nadu"),
    ).toBeVisible();
  });

  it("validates gently, opens a formatted quote and shows success", async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<BulkEnquiryForm />);

    await user.click(
      screen.getByRole("button", { name: "Request a quote on WhatsApp" }),
    );
    expect(screen.getByText("Please tell us your name.")).toBeVisible();
    expect(
      screen.getByText("Please enter a valid Indian phone number."),
    ).toBeVisible();

    await user.type(screen.getByLabelText("Name"), "Meera Rao");
    await user.type(
      screen.getByLabelText("Organisation (optional)"),
      "Rao Family",
    );
    await user.type(screen.getByLabelText("Phone"), "9876543210");
    await user.selectOptions(screen.getByLabelText("Event type"), "Wedding");
    await user.selectOptions(screen.getByLabelText("Quantity"), "50–100");
    await user.type(screen.getByLabelText("Event date"), "2026-12-01");
    await user.selectOptions(
      screen.getByLabelText("Budget per piece (optional)"),
      "₹250–₹500",
    );
    await user.type(
      screen.getByLabelText("Tell us about the occasion"),
      "Blush flower-card favours for our guests.",
    );
    await user.click(
      screen.getByRole("button", { name: "Request a quote on WhatsApp" }),
    );

    expect(open).toHaveBeenCalledOnce();
    const href = open.mock.calls[0][0] as string;
    expect(decodeURIComponent(href)).toContain("Quantity: 50–100");
    expect(screen.getByRole("heading", { name: "Thank you!" })).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Start another enquiry" }),
    );
    expect(screen.getByLabelText("Name")).toBeVisible();
    open.mockRestore();
  });
});

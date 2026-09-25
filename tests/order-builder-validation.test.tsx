import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrderBuilder } from "@/components/sections/order/OrderBuilder";
import {
  isUrgentOrderDate,
  minimumOrderDate,
} from "@/components/sections/order/StepDetails";
import { phaseFiveConfig } from "@/lib/data/site";
import { resetOrderStore, useOrderStore } from "@/lib/store/orderStore";

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => true,
}));
vi.mock("@/lib/animations/useLenis", () => ({
  useLenis: () => ({ lenis: null }),
}));
vi.mock("@/lib/animations/gsap", () => ({ refreshScrollTrigger: vi.fn() }));
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, placeholder, ...imageProps } = props;
    void fill;
    void priority;
    void placeholder;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...imageProps} />;
  },
}));

describe("Phase 5 order builder validation", () => {
  beforeEach(() => {
    localStorage.clear();
    resetOrderStore(false);
  });

  it("keeps next disabled until required choices exist", async () => {
    const user = userEvent.setup();
    render(<OrderBuilder />);
    expect(screen.getByRole("button", { name: "Continue to Flowers" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /Medium Bouquets/ }));
    expect(screen.getByRole("button", { name: "Continue to Flowers" })).toBeEnabled();
  });

  it("announces kind customer and delivery errors", async () => {
    const user = userEvent.setup();
    useOrderStore.setState({
      ...useOrderStore.getState(),
      flowers: ["Lily"],
      occasion: "Anniversary",
      palettes: ["Lilac"],
      pieceSlug: "medium-bouquets",
      step: 4,
      wrapStyle: "Sheer white",
    });
    render(<OrderBuilder />);
    await user.click(screen.getByRole("radio", { name: "Delivery" }));
    fireEvent.change(screen.getByLabelText("Needed by date"), {
      target: { value: minimumOrderDate() },
    });
    await user.click(screen.getByRole("button", { name: "Review your order" }));
    expect(screen.getByText("Please tell us the name we should use.")).toBeVisible();
    expect(screen.getByText("Please enter a valid Indian phone number.")).toBeVisible();
    expect(
      screen.getByText("Please tell us where you would like this delivered."),
    ).toBeVisible();
  });

  it("computes the configured minimum and urgent date window", () => {
    const now = new Date("2026-09-26T12:00:00");
    expect(minimumOrderDate(now)).toBe("2026-09-29");
    expect(isUrgentOrderDate("2026-09-29", now)).toBe(true);
    expect(isUrgentOrderDate("2026-10-10", now)).toBe(false);
    expect(phaseFiveConfig.leadTimeDays).toBe(3);
  });
});

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FAQSection } from "@/components/sections/faq/FAQSection";
import { faqItems } from "@/lib/data/faq";

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => true,
}));

describe("Phase 5 FAQ", () => {
  it("renders all eight editable questions with accessible relationships", () => {
    render(<FAQSection />);
    expect(screen.getByRole("heading", { name: "Good to know" })).toBeVisible();
    expect(faqItems).toHaveLength(8);
    for (const faq of faqItems) {
      const button = screen.getByRole("button", { name: faq.question });
      expect(button).toHaveAttribute("aria-controls", `faq-panel-${faq.id}`);
    }
    const first = screen.getByRole("button", { name: faqItems[0].question });
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(
      within(screen.getByRole("region", { name: faqItems[0].question })).getByText(
        faqItems[0].answer,
      ),
    ).toBeVisible();
  });

  it("keeps only one accordion item open", async () => {
    const user = userEvent.setup();
    render(<FAQSection />);
    const first = screen.getByRole("button", { name: faqItems[0].question });
    const second = screen.getByRole("button", { name: faqItems[1].question });
    await user.click(second);
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "true");
    await user.click(second);
    expect(second).toHaveAttribute("aria-expanded", "false");
  });
});

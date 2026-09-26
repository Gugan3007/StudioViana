import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { OverlayProvider } from "@/lib/context/OverlayContext";
import { IntroProvider, useIntro } from "@/lib/context/IntroContext";

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => true,
}));

function CompleteIntro() {
  const { markIntroComplete } = useIntro();
  return (
    <button onClick={markIntroComplete} type="button">
      Complete intro
    </button>
  );
}

function WhatsAppHarness() {
  return (
    <IntroProvider>
      <OverlayProvider>
        <CompleteIntro />
        <FloatingWhatsApp />
      </OverlayProvider>
    </IntroProvider>
  );
}

describe("Phase 5 floating WhatsApp", () => {
  it("appears after intro and hides for any coordinated overlay", async () => {
    const user = userEvent.setup();
    document.documentElement.removeAttribute("data-intro-complete");
    render(<WhatsAppHarness />);
    expect(
      screen.queryByRole("link", { name: "Chat with us on WhatsApp" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Complete intro" }));
    const link = screen.getByRole("link", { name: "Chat with us on WhatsApp" });
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("wa.me/919488713438"),
    );

    act(() => {
      window.dispatchEvent(
        new CustomEvent("studio-viana:overlay-change", {
          detail: { open: true, source: "lightbox" },
        }),
      );
    });
    expect(
      screen.queryByRole("link", { name: "Chat with us on WhatsApp" }),
    ).not.toBeInTheDocument();
    act(() => {
      window.dispatchEvent(
        new CustomEvent("studio-viana:overlay-change", {
          detail: { open: false, source: "lightbox" },
        }),
      );
    });
    expect(
      screen.getByRole("link", { name: "Chat with us on WhatsApp" }),
    ).toBeVisible();
  });
});

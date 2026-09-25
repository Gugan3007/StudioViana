import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Navbar } from "@/components/layout/Navbar";
import { IntroProvider } from "@/lib/context/IntroContext";

const navigationMocks = vi.hoisted(() => ({
  kill: vi.fn(),
  lenis: {
    on: vi.fn(() => vi.fn()),
    scrollTo: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  },
  revert: vi.fn(),
}));

vi.mock("@/lib/animations/useLenis", () => ({
  useLenis: () => ({ lenis: navigationMocks.lenis }),
}));

vi.mock("@/lib/animations/useReducedMotion", () => ({
  useReducedMotion: () => false,
}));

vi.mock("@/lib/animations/gsap", () => {
  const timeline = {
    fromTo: vi.fn(),
    reverse: vi.fn(),
    set: vi.fn(),
    to: vi.fn(),
  };
  timeline.fromTo.mockReturnValue(timeline);
  timeline.set.mockReturnValue(timeline);
  timeline.to.mockReturnValue(timeline);

  return {
    gsap: {
      context: vi.fn((setup: () => void) => {
        setup();
        return { revert: navigationMocks.revert };
      }),
      set: vi.fn(),
      timeline: vi.fn(() => timeline),
      to: vi.fn(),
    },
    ScrollTrigger: {
      create: vi.fn(
        (options: {
          onToggle?: (state: { isActive: boolean }) => void;
          trigger?: HTMLElement;
        }) => {
          if (options.trigger?.id === "about") {
            options.onToggle?.({ isActive: true });
          }
          return { kill: navigationMocks.kill };
        },
      ),
    },
  };
});

function renderNavigation() {
  document.documentElement.dataset.introComplete = "true";
  return render(
    <IntroProvider>
      <Navbar />
      <main>
        <section id="home" />
        <section id="about" />
        <section id="craft" />
        <section id="craft-closeup" />
        <section id="collection" />
        <section id="gallery" />
        <section id="pricing" />
        <section id="contact" />
      </main>
    </IntroProvider>,
  );
}

describe("Navbar", () => {
  beforeEach(() => {
    navigationMocks.kill.mockClear();
    navigationMocks.lenis.on.mockClear();
    navigationMocks.lenis.scrollTo.mockClear();
    navigationMocks.lenis.start.mockClear();
    navigationMocks.lenis.stop.mockClear();
    navigationMocks.revert.mockClear();
    Object.defineProperty(document, "elementsFromPoint", {
      configurable: true,
      value: vi.fn(() => []),
    });
  });

  it("renders the wordmark, active section, and friendly WhatsApp action", async () => {
    renderNavigation();

    expect(
      screen.getByRole("navigation", { name: "Primary navigation" }),
    ).toBeVisible();
    expect(screen.getByText("Studio Viana")).toBeVisible();
    expect(await screen.findByRole("link", { name: "About" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: "Order on WhatsApp" }),
    ).toHaveAttribute(
      "href",
      expect.stringMatching(
        /^https:\/\/wa\.me\/919488713438\?text=.*Studio%20Viana/,
      ),
    );
    expect(screen.getByRole("link", { name: "Gallery" })).toHaveAttribute(
      "href",
      "#gallery",
    );
  });

  it("smooth-scrolls to anchors with the fixed-header offset", async () => {
    const user = userEvent.setup();
    renderNavigation();

    await user.click(screen.getByRole("link", { name: "Craft" }));

    expect(navigationMocks.lenis.scrollTo).toHaveBeenCalledWith(
      document.getElementById("craft-closeup")!.offsetTop,
      { duration: 1.4, offset: -84 },
    );
  });

  it("opens a numbered menu, traps focus, closes on Escape, and restores the trigger", async () => {
    const user = userEvent.setup();
    renderNavigation();
    const trigger = screen.getByRole("button", { name: "Open menu" });

    await user.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Mobile navigation" });
    expect(dialog).toBeVisible();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(navigationMocks.lenis.stop).toHaveBeenCalledOnce();
    expect(within(dialog).getByText("01")).toBeVisible();
    expect(within(dialog).getByText("06")).toBeVisible();
    expect(within(dialog).getByText("studioviana30@gmail.com")).toBeVisible();
    expect(within(dialog).getByText("@studio_viana.in")).toBeVisible();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(navigationMocks.lenis.start).toHaveBeenCalledOnce();
    expect(trigger).toHaveFocus();
  });

  it("closes after selecting a menu destination", async () => {
    const user = userEvent.setup();
    renderNavigation();
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const dialog = screen.getByRole("dialog", { name: "Mobile navigation" });

    await user.click(within(dialog).getByRole("link", { name: "Pricing" }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(navigationMocks.lenis.scrollTo).toHaveBeenCalledWith(
        document.getElementById("pricing")!.offsetTop,
        { duration: 1.4, offset: -84 },
      ),
    );
    expect(
      navigationMocks.lenis.start.mock.invocationCallOrder[0],
    ).toBeLessThan(navigationMocks.lenis.scrollTo.mock.invocationCallOrder[0]);
  });
});

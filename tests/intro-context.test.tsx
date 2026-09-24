import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  IntroProvider,
  useIntro,
} from "@/lib/context/IntroContext";

function Probe() {
  const { introComplete, markIntroActive, markIntroComplete } = useIntro();

  return (
    <>
      <output data-testid="intro-state">
        {introComplete ? "complete" : "active"}
      </output>
      <button onClick={markIntroComplete} type="button">
        Complete intro
      </button>
      <button onClick={markIntroActive} type="button">
        Reactivate intro
      </button>
    </>
  );
}

describe("IntroProvider", () => {
  beforeEach(() => {
    delete document.documentElement.dataset.introComplete;
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 0,
    });
  });

  it("publishes completion through state, the html dataset, and a custom event", async () => {
    const listener = vi.fn();
    const user = userEvent.setup();
    window.addEventListener("studio-viana:intro-complete", listener, {
      once: true,
    });

    render(
      <IntroProvider>
        <Probe />
      </IntroProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Complete intro" }));

    expect(screen.getByTestId("intro-state")).toHaveTextContent("complete");
    expect(document.documentElement).toHaveAttribute(
      "data-intro-complete",
      "true",
    );
    expect(listener).toHaveBeenCalledOnce();
  });

  it("clears completion when the intro becomes active again", async () => {
    const user = userEvent.setup();
    document.documentElement.dataset.introComplete = "true";
    render(
      <IntroProvider>
        <Probe />
      </IntroProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Reactivate intro" }));

    expect(screen.getByTestId("intro-state")).toHaveTextContent("active");
    expect(document.documentElement.dataset.introComplete).toBeUndefined();
  });

  it("initializes complete when a restored page is already below the intro", async () => {
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 1200,
    });

    render(
      <IntroProvider>
        <Probe />
      </IntroProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("intro-state")).toHaveTextContent("complete"),
    );
    expect(document.documentElement).toHaveAttribute(
      "data-intro-complete",
      "true",
    );
  });
});

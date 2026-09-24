import { render, screen, within } from "@testing-library/react";
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

describe("Phase 1 home page", () => {
  it("places the cinematic intro directly before the cream Home hero", () => {
    render(<Home />);
    const main = screen.getByRole("main");
    const intro = within(main).getByTestId("intro-section");
    const hero = document.querySelector("#home");

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
    expect(screen.getByText("Phase 2 begins here")).toBeVisible();
    expect(screen.queryByText("Design System")).not.toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RollText } from "@/components/interaction/RollText";
import { Button } from "@/components/ui/Button";
import { resolveCursorState } from "@/components/cursor/useCursor";
import {
  getCursorState,
  setCursorState,
  type CursorState,
} from "@/lib/store/cursorStore";

describe("Phase 6 interaction primitives", () => {
  it("resolves explicit cursor intent before semantic fallbacks", () => {
    const view = document.createElement("div");
    view.dataset.cursor = "view";
    const nested = document.createElement("span");
    view.append(nested);

    expect(resolveCursorState(nested)).toBe("view");
    expect(resolveCursorState(document.createElement("input"))).toBe("text");
    expect(resolveCursorState(document.createElement("textarea"))).toBe("text");
    expect(resolveCursorState(document.createElement("button"))).toBe("link");
    expect(resolveCursorState(document.createElement("p"))).toBe("default");
  });

  it("supports every global cursor state without changing store identity", () => {
    const states: CursorState[] = [
      "default",
      "view",
      "drag",
      "zoom",
      "link",
      "text",
      "hidden",
    ];
    states.forEach((state) => {
      setCursorState(state);
      expect(getCursorState()).toBe(state);
    });
    setCursorState("default");
  });

  it("rolls a visual duplicate without duplicating its accessible name", () => {
    render(<RollText>Order now</RollText>);

    expect(screen.getAllByText("Order now")).toHaveLength(2);
    expect(screen.getAllByText("Order now")[1]).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("gives shared buttons link cursor intent, magnetism and one name", () => {
    render(<Button magnetic>Order now</Button>);

    const button = screen.getByRole("button", { name: "Order now" });
    expect(button).toHaveAttribute("data-cursor", "link");
    expect(button.closest("[data-magnetic-root]")).toBeInTheDocument();
    expect(screen.getAllByText("Order now")).toHaveLength(2);
  });
});

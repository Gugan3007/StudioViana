import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { beforeEach, describe, expect, it } from "vitest";

import { OverlayManager } from "@/components/overlay/OverlayManager";
import { useManagedOverlay, useOverlay } from "@/lib/context/OverlayContext";
import { getCursorState, setCursorState } from "@/lib/store/cursorStore";

function Dialog({
  id,
  onClose,
  opener,
}: {
  id: string;
  onClose: () => void;
  opener: React.RefObject<HTMLButtonElement | null>;
}) {
  const root = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useManagedOverlay({
    id,
    initialFocusRef: close,
    onClose,
    open: true,
    returnFocusRef: opener,
    rootRef: root,
  });

  return (
    <div ref={root} aria-label={id} aria-modal="true" role="dialog">
      <button ref={close} onClick={onClose} type="button">
        Close {id}
      </button>
      <button type="button">Last {id}</button>
    </div>
  );
}

function StackStatus() {
  const { overlayOpen, overlayStack } = useOverlay();
  return (
    <output data-testid="overlay-status">
      {overlayOpen ? overlayStack.join(",") : "closed"}
    </output>
  );
}

function Harness() {
  const firstTrigger = useRef<HTMLButtonElement>(null);
  const secondTrigger = useRef<HTMLButtonElement>(null);
  const [firstOpen, setFirstOpen] = useState(false);
  const [secondOpen, setSecondOpen] = useState(false);

  return (
    <OverlayManager>
      <button
        ref={firstTrigger}
        onClick={() => setFirstOpen(true)}
        type="button"
      >
        Open first
      </button>
      <button
        ref={secondTrigger}
        onClick={() => setSecondOpen(true)}
        type="button"
      >
        Open second
      </button>
      <StackStatus />
      {firstOpen ? (
        <Dialog
          id="first"
          onClose={() => setFirstOpen(false)}
          opener={firstTrigger}
        />
      ) : null}
      {secondOpen ? (
        <Dialog
          id="second"
          onClose={() => setSecondOpen(false)}
          opener={secondTrigger}
        />
      ) : null}
    </OverlayManager>
  );
}

describe("Phase 6 overlay manager", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    setCursorState("default");
  });

  it("orders overlays and lets Escape close only the top-most dialog", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Open first" }));
    expect(screen.getByTestId("overlay-status")).toHaveTextContent("first");
    expect(screen.getByRole("button", { name: "Close first" })).toHaveFocus();
    expect(document.documentElement.style.overflow).toBe("hidden");

    setCursorState("view");
    await user.click(screen.getByRole("button", { name: "Open second" }));
    expect(screen.getByTestId("overlay-status")).toHaveTextContent(
      "first,second",
    );
    expect(screen.getByRole("button", { name: "Close second" })).toHaveFocus();
    expect(getCursorState()).toBe("default");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "second" })).toBeNull();
    expect(screen.getByRole("dialog", { name: "first" })).toBeVisible();
    expect(document.documentElement.style.overflow).toBe("hidden");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "first" })).toBeNull();
    expect(screen.getByRole("button", { name: "Open first" })).toHaveFocus();
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("contains keyboard focus inside the top-most dialog", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Open first" }));
    const close = screen.getByRole("button", { name: "Close first" });
    const last = screen.getByRole("button", { name: "Last first" });

    last.focus();
    await user.tab();
    expect(close).toHaveFocus();

    act(() => close.focus());
    await user.tab({ shift: true });
    expect(last).toHaveFocus();
  });
});

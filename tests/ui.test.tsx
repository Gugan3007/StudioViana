import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { Heading } from "@/components/ui/Heading";
import { PillTag } from "@/components/ui/PillTag";
import { PriceTag } from "@/components/ui/PriceTag";
import { Section } from "@/components/ui/Section";
import { SectionLabel } from "@/components/ui/SectionLabel";

describe("Heading", () => {
  it("keeps semantic level separate from visual size and highlights one phrase", () => {
    render(
      <Heading as="h2" size="h1" italic="forever">
        Flowers live forever
      </Heading>,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Flowers live forever" }),
    ).toHaveClass("text-[length:clamp(2.5rem,5vw,4.5rem)]");
    expect(screen.getByText("forever")).toHaveClass("italic");
  });
});

describe("Button", () => {
  it("renders links and buttons with their native semantics", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <Button href="/catalogue" variant="outline-gold">
        Explore
      </Button>,
    );

    expect(screen.getByRole("link", { name: "Explore" })).toHaveAttribute(
      "href",
      "/catalogue",
    );

    rerender(
      <Button type="button" variant="solid-forest" onClick={onClick}>
        Order
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Order" });
    expect(button).toHaveAttribute("type", "button");
    await user.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe("layout primitives", () => {
  it("renders semantic dark sections and optional twelve-column containers", () => {
    render(
      <Section tone="dark" aria-label="Dark specimen">
        <Container grid data-testid="container">
          Content
        </Container>
      </Section>,
    );

    expect(screen.getByRole("region", { name: "Dark specimen" })).toHaveClass(
      "bg-forest",
    );
    expect(screen.getByTestId("container")).toHaveClass("grid", "grid-cols-12");
  });
});

describe("brand details", () => {
  it("renders labels, tags, prices, and dividers", () => {
    render(
      <>
        <SectionLabel>Our craft</SectionLabel>
        <PillTag>Handmade · Made to order</PillTag>
        <PriceTag>₹1,250</PriceTag>
        <GoldDivider data-testid="divider" />
      </>,
    );

    expect(screen.getByText("Our craft")).toHaveClass("uppercase");
    expect(screen.getByText("Handmade · Made to order")).toBeVisible();
    expect(screen.getByText("₹1,250")).toBeVisible();
    expect(screen.getByTestId("divider")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});

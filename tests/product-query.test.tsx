import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useProductQueryParam } from "@/components/product/useProductQueryParam";

describe("useProductQueryParam", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/?campaign=fall");
  });

  it("opens a shareable product URL without dropping unrelated params", () => {
    const { result } = renderHook(() => useProductQueryParam());

    act(() => result.current.openProduct("medium-bouquets"));

    expect(result.current.productSlug).toBe("medium-bouquets");
    expect(window.location.search).toBe(
      "?campaign=fall&product=medium-bouquets",
    );
  });

  it("reads direct URLs and closes when browser history removes the product", () => {
    window.history.replaceState(
      {},
      "",
      "/?campaign=fall&product=grand-bouquet",
    );
    const { result } = renderHook(() => useProductQueryParam());
    expect(result.current.productSlug).toBe("grand-bouquet");

    act(() => {
      window.history.replaceState({}, "", "/?campaign=fall");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(result.current.productSlug).toBeNull();
  });

  it("replaces related products and removes invalid product params safely", () => {
    const { result } = renderHook(() => useProductQueryParam());
    act(() => result.current.openProduct("medium-bouquets"));
    act(() => result.current.replaceProduct("mini-bouquets"));
    expect(result.current.productSlug).toBe("mini-bouquets");
    expect(window.location.search).toContain("campaign=fall");

    act(() => result.current.closeProduct());
    expect(result.current.productSlug).toBeNull();
    expect(window.location.search).toBe("?campaign=fall");

    act(() => {
      window.history.replaceState(
        {},
        "",
        "/?campaign=fall&product=not-a-product",
      );
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(result.current.productSlug).toBeNull();
    expect(window.location.search).toBe("?campaign=fall");
  });
});

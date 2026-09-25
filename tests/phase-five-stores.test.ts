import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  hydrateBagStore,
  resetBagStore,
  useBagStore,
} from "@/lib/store/bagStore";
import {
  hydrateOrderStore,
  resetOrderStore,
  useOrderStore,
} from "@/lib/store/orderStore";

describe("Phase 5 order store", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    resetOrderStore(false);
  });

  it("updates one typed order, supports bag hand-off and resets", () => {
    useOrderStore.getState().update({ pieceSlug: "medium-bouquets" });
    useOrderStore.getState().toggleFlower("Lily");
    useOrderStore.getState().toggleFlower("Tulip");
    useOrderStore.getState().setStep(3);
    useOrderStore.getState().prefillFromBag([
      {
        id: "bag-a",
        productSlug: "flower-cards",
        quantity: 20,
        unitPrice: 150,
      },
    ]);

    expect(useOrderStore.getState()).toMatchObject({
      bagItems: [expect.objectContaining({ productSlug: "flower-cards" })],
      flowers: ["Lily", "Tulip"],
      pieceSlug: "medium-bouquets",
      step: 4,
    });

    resetOrderStore(false);
    expect(useOrderStore.getState()).toMatchObject({
      bagItems: [],
      flowers: [],
      palettes: [],
      quantity: 1,
      step: 1,
    });
  });

  it("persists with a debounce and restores explicitly", () => {
    useOrderStore.getState().update({ customerName: "Ananya" });
    expect(localStorage.getItem("studio-viana-order")).toBeNull();
    vi.advanceTimersByTime(350);
    expect(localStorage.getItem("studio-viana-order")).toContain("Ananya");

    resetOrderStore(false);
    hydrateOrderStore();
    expect(useOrderStore.getState().customerName).toBe("Ananya");
  });
});

describe("Phase 5 bag store", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    resetBagStore(false);
  });

  it("adds, combines, updates and removes order items", () => {
    const bag = useBagStore.getState();
    bag.addItem({
      productSlug: "single-stem-florals",
      quantity: 2,
      unitPrice: 120,
      flower: "Lily",
    });
    useBagStore.getState().addItem({
      productSlug: "single-stem-florals",
      quantity: 3,
      unitPrice: 120,
      flower: "Lily",
    });
    const [item] = useBagStore.getState().items;
    expect(item.quantity).toBe(5);
    expect(useBagStore.getState().itemCount()).toBe(5);
    expect(useBagStore.getState().estimatedTotal()).toBe(600);

    useBagStore.getState().updateQuantity(item.id, 2);
    expect(useBagStore.getState().estimatedTotal()).toBe(240);
    useBagStore.getState().removeItem(item.id);
    expect(useBagStore.getState().items).toEqual([]);
  });

  it("persists with a debounce and restores explicitly", () => {
    useBagStore.getState().addItem({
      productSlug: "flower-cards",
      quantity: 4,
      unitPrice: 150,
    });
    expect(localStorage.getItem("studio-viana-bag")).toBeNull();
    vi.advanceTimersByTime(350);
    expect(localStorage.getItem("studio-viana-bag")).toContain("flower-cards");

    resetBagStore(false);
    hydrateBagStore();
    expect(useBagStore.getState().items[0]).toMatchObject({
      productSlug: "flower-cards",
      quantity: 4,
    });
  });
});

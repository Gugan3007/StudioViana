import { create } from "zustand";

export interface BagItem {
  readonly flower?: string;
  readonly id: string;
  readonly palette?: string;
  readonly productSlug: string;
  readonly quantity: number;
  readonly size?: "1 bloom" | "2 blooms";
  readonly unitPrice: number;
  readonly variant?: string;
}

export type NewBagItem = Omit<BagItem, "id">;

interface BagStore {
  addItem: (item: NewBagItem) => void;
  clear: () => void;
  estimatedTotal: () => number;
  itemCount: () => number;
  items: BagItem[];
  removeItem: (id: string) => void;
  replaceItems: (items: BagItem[]) => void;
  updateQuantity: (id: string, quantity: number) => void;
}

const STORAGE_KEY = "studio-viana-bag";
const PERSIST_DELAY = 300;
let persistTimer: ReturnType<typeof setTimeout> | undefined;

const itemSignature = (item: NewBagItem) =>
  [
    item.productSlug,
    item.variant,
    item.flower,
    item.size,
    item.palette,
    item.unitPrice,
  ].join("|");

const newId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `bag-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const useBagStore = create<BagStore>((set, get) => ({
  items: [],
  addItem: (incoming) =>
    set((state) => {
      const existing = state.items.find(
        (item) => itemSignature(item) === itemSignature(incoming),
      );
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === existing.id
              ? { ...item, quantity: item.quantity + incoming.quantity }
              : item,
          ),
        };
      }
      return { items: [...state.items, { ...incoming, id: newId() }] };
    }),
  clear: () => set({ items: [] }),
  estimatedTotal: () =>
    get().items.reduce(
      (total, item) => total + item.unitPrice * item.quantity,
      0,
    ),
  itemCount: () =>
    get().items.reduce((total, item) => total + item.quantity, 0),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  replaceItems: (items) => set({ items }),
  updateQuantity: (id, quantity) =>
    set((state) => ({
      items: state.items
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, Math.min(500, quantity)) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    })),
}));

const schedulePersistence = (items: BagItem[]) => {
  if (typeof window === "undefined") return;
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
  }, PERSIST_DELAY);
};

useBagStore.subscribe((state) => schedulePersistence(state.items));

export function hydrateBagStore() {
  if (typeof window === "undefined") return;
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as
      | { items?: BagItem[] }
      | null;
    if (Array.isArray(saved?.items)) useBagStore.setState({ items: saved.items });
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function resetBagStore(clearPersisted = true) {
  if (clearPersisted && typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  useBagStore.setState({ items: [] });
}

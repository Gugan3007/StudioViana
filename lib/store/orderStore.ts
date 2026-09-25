import { create } from "zustand";

import type { BagItem } from "@/lib/store/bagStore";

export interface OrderState {
  bagItems: BagItem[];
  customPalette?: string;
  customerName?: string;
  deliveryArea?: string;
  deliveryMethod?: "pickup" | "delivery";
  email?: string;
  flowers: string[];
  messageCard?: string;
  neededBy?: string;
  notes?: string;
  occasion?: string;
  palettes: string[];
  phone?: string;
  pieceSlug?: string;
  quantity: number;
  size?: "1 bloom" | "2 blooms";
  step: number;
  submitted: boolean;
  variant?: string;
  wrapStyle?: string;
}

interface OrderActions {
  prefillFromBag: (items: BagItem[]) => void;
  reset: () => void;
  setStep: (step: number) => void;
  toggleFlower: (flower: string) => void;
  togglePalette: (palette: string) => void;
  update: (patch: Partial<OrderState>) => void;
}

export type OrderStore = OrderState & OrderActions;

const STORAGE_KEY = "studio-viana-order";
const PERSIST_DELAY = 300;
let persistTimer: ReturnType<typeof setTimeout> | undefined;

export const initialOrderState: OrderState = {
  bagItems: [],
  flowers: [],
  palettes: [],
  quantity: 1,
  step: 1,
  submitted: false,
};

const serializableOrder = (state: OrderState) => ({
  bagItems: state.bagItems,
  customPalette: state.customPalette,
  customerName: state.customerName,
  deliveryArea: state.deliveryArea,
  deliveryMethod: state.deliveryMethod,
  email: state.email,
  flowers: state.flowers,
  messageCard: state.messageCard,
  neededBy: state.neededBy,
  notes: state.notes,
  occasion: state.occasion,
  palettes: state.palettes,
  phone: state.phone,
  pieceSlug: state.pieceSlug,
  quantity: state.quantity,
  size: state.size,
  step: state.step,
  submitted: state.submitted,
  variant: state.variant,
  wrapStyle: state.wrapStyle,
});

export const useOrderStore = create<OrderStore>((set) => ({
  ...initialOrderState,
  prefillFromBag: (items) =>
    set({ bagItems: items, step: 4, submitted: false }),
  reset: () => set(initialOrderState),
  setStep: (step) => set({ step: Math.max(1, Math.min(5, step)) }),
  toggleFlower: (flower) =>
    set((state) => ({
      flowers: state.flowers.includes(flower)
        ? state.flowers.filter((item) => item !== flower)
        : [...state.flowers, flower],
    })),
  togglePalette: (palette) =>
    set((state) => {
      if (state.palettes.includes(palette)) {
        return { palettes: state.palettes.filter((item) => item !== palette) };
      }
      if (state.palettes.length >= 3) return state;
      return { palettes: [...state.palettes, palette] };
    }),
  update: (patch) => set(patch),
}));

const schedulePersistence = (state: OrderStore) => {
  if (typeof window === "undefined") return;
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(serializableOrder(state)),
    );
  }, PERSIST_DELAY);
};

useOrderStore.subscribe(schedulePersistence);

export function hydrateOrderStore() {
  if (typeof window === "undefined") return;
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as
      | Partial<OrderState>
      | null;
    if (saved && typeof saved === "object") {
      useOrderStore.setState({
        ...initialOrderState,
        ...saved,
        bagItems: Array.isArray(saved.bagItems) ? saved.bagItems : [],
        flowers: Array.isArray(saved.flowers) ? saved.flowers : [],
        palettes: Array.isArray(saved.palettes) ? saved.palettes.slice(0, 3) : [],
      });
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function resetOrderStore(clearPersisted = true) {
  if (clearPersisted && typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  useOrderStore.setState(initialOrderState);
}

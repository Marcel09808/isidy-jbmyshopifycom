import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  CART_QUERY,
  addShopifyCartLine,
  createShopifyCart,
  removeShopifyCartLine,
  storefrontApiRequest,
  updateShopifyCartLine,
  type ShopifyProduct,
} from "@/lib/shopify";

export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

interface CartState {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<boolean>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [], cartId: null, checkoutUrl: null, isLoading: false, isSyncing: false, error: null,
      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
      addItem: async (item) => {
        set({ isLoading: true, error: null });
        try {
          const state = get();
          const existing = state.items.find((entry) => entry.variantId === item.variantId);
          if (!state.cartId) {
            const result = await createShopifyCart(item.variantId, item.quantity);
            if (!result) throw new Error("No se pudo crear el carrito.");
            set({ cartId: result.cartId, checkoutUrl: result.checkoutUrl, items: [{ ...item, lineId: result.lineId }] });
          } else if (existing?.lineId) {
            const quantity = existing.quantity + item.quantity;
            const result = await updateShopifyCartLine(state.cartId, existing.lineId, quantity);
            if (result.cartNotFound) get().clearCart();
            else if (result.success) set({ items: get().items.map((entry) => entry.variantId === item.variantId ? { ...entry, quantity } : entry) });
          } else {
            const result = await addShopifyCartLine(state.cartId, item.variantId, item.quantity);
            if (result.cartNotFound) get().clearCart();
            else if (result.success) set({ items: [...get().items, { ...item, lineId: result.lineId ?? null }] });
          }
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "No se pudo añadir el pack." });
          return false;
        } finally { set({ isLoading: false }); }
      },
      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) return get().removeItem(variantId);
        const state = get();
        const item = state.items.find((entry) => entry.variantId === variantId);
        if (!state.cartId || !item?.lineId) return;
        set({ isLoading: true });
        try {
          const result = await updateShopifyCartLine(state.cartId, item.lineId, quantity);
          if (result.cartNotFound) get().clearCart();
          else if (result.success) set({ items: get().items.map((entry) => entry.variantId === variantId ? { ...entry, quantity } : entry) });
        } finally { set({ isLoading: false }); }
      },
      removeItem: async (variantId) => {
        const state = get();
        const item = state.items.find((entry) => entry.variantId === variantId);
        if (!state.cartId || !item?.lineId) return;
        set({ isLoading: true });
        try {
          const result = await removeShopifyCartLine(state.cartId, item.lineId);
          if (result.cartNotFound) get().clearCart();
          else if (result.success) {
            const items = get().items.filter((entry) => entry.variantId !== variantId);
            items.length ? set({ items }) : get().clearCart();
          }
        } finally { set({ isLoading: false }); }
      },
      syncCart: async () => {
        const { cartId, isSyncing } = get();
        if (!cartId || isSyncing) return;
        set({ isSyncing: true });
        try {
          const data = await storefrontApiRequest<{ cart: { totalQuantity: number } | null }>(CART_QUERY, { id: cartId });
          if (!data?.cart || data.cart.totalQuantity === 0) get().clearCart();
        } catch { /* Preserve the local cart during transient API failures. */ }
        finally { set({ isSyncing: false }); }
      },
    }),
    {
      name: "bervona-shopify-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ items, cartId, checkoutUrl }) => ({ items, cartId, checkoutUrl }),
    },
  ),
);
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem, StoreCartGroup } from "@/types/cart";

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Computed values
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getGroupedItems: () => StoreCartGroup[];
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem: CartItem) => {
        const { items } = get();
        const existingItem = items.find((item) => item.id === newItem.id);

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === newItem.id
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            ),
          });
        } else {
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (productId: string) => {
        set({
          items: get().items.filter((item) => item.id !== productId),
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getGroupedItems: () => {
        const { items } = get();
        const groups: Record<string, StoreCartGroup> = {};

        items.forEach((item) => {
          const storeId = item.store.id;
          if (!groups[storeId]) {
            groups[storeId] = {
              storeId,
              storeName: item.store.name,
              storeSlug: item.store.slug,
              items: [],
              subtotal: 0,
              shippingFee: 0, // Calculated later at checkout
            };
          }

          groups[storeId].items.push(item);
          groups[storeId].subtotal += item.price * item.quantity;
        });

        return Object.values(groups);
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

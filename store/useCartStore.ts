import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  cartItemId?: string;
  name: string;
  price: number;
  image: string;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (keyOrId: string) => void;
  updateQuantity: (keyOrId: string, quantity: number) => void;
  clearCart: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      addItem: (newItem) =>
        set((state) => {
          const key = `${newItem.id}-${newItem.selectedColor}-${newItem.selectedSize}`;
          const existingIndex = state.items.findIndex(
            (item) =>
              (item.cartItemId || `${item.id}-${item.selectedColor}-${item.selectedSize}`) === key
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex].quantity += newItem.quantity;
            return { items: updatedItems };
          }

          return {
            items: [...state.items, { ...newItem, cartItemId: key }],
          };
        }),

      removeItem: (keyOrId) =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              item.cartItemId !== keyOrId &&
              `${item.id}-${item.selectedColor}-${item.selectedSize}` !== keyOrId &&
              item.id !== keyOrId
          ),
        })),

      updateQuantity: (keyOrId, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) => {
              const key = item.cartItemId || `${item.id}-${item.selectedColor}-${item.selectedSize}`;
              if (key === keyOrId || item.id === keyOrId) {
                return { ...item, quantity: Math.max(0, quantity) };
              }
              return item;
            })
            .filter((item) => item.quantity > 0),
        })),

      clearCart: () => set({ items: [] }),

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "mantra-cart-storage",
    }
  )
);
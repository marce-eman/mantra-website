import { create } from 'zustand';
import { Product } from '@/data/products';

export interface CartItem extends Product {
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, color: string, size: string) => void;
  updateQuantity: (id: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  addItem: (newItem) => {
    set((state) => {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === newItem.id && item.selectedColor === newItem.selectedColor && item.selectedSize === newItem.selectedSize
      );
      if (existingItemIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return { items: updatedItems, isOpen: true }; // Open drawer on add
      }
      return { items: [...state.items, newItem], isOpen: true }; // Open drawer on add
    });
  },
  removeItem: (id, color, size) => {
    set((state) => ({
      items: state.items.filter(
        (item) => !(item.id === id && item.selectedColor === color && item.selectedSize === size)
      )
    }));
  },
  updateQuantity: (id, color, size, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id && item.selectedColor === color && item.selectedSize === size
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    }));
  },
  clearCart: () => set({ items: [] }),
  toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
  openDrawer: () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),
  getSubtotal: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }
}));

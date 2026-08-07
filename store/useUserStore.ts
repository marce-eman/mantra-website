import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserStore {
  isGuest: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  setGuest: (guest: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  isGuest: true, // Default to guest as per instructions
  user: null,
  login: (user) => set({ isGuest: false, user }),
  logout: () => set({ isGuest: true, user: null }),
  setGuest: (guest) => set({ isGuest: guest })
}));

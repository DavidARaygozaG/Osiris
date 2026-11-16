import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAdminStore = create(
  persist(
    (set) => ({
      isAdmin: false,
      setAdmin: (val) => set({ isAdmin: val }),
      logout: () => set({ isAdmin: false }),
    }),
    { name: 'osiris-admin' }
  )
);

'use client';

import { create } from 'zustand';

export const useUiStore = create((set) => ({
  searchOpen: false,
  settingsOpen: false,
  toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),
  toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen })),
}));

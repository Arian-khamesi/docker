import { create } from 'zustand'

interface UIState {
  activeTab: string | null;
  isSubmenuOpen: boolean;
  setActiveTab: (tabId: string | null) => void;
  toggleSubmenu: (open?: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: "dashboard", // پیش‌فرض
  isSubmenuOpen: true,
  setActiveTab: (tabId) => set({ activeTab: tabId }),
  toggleSubmenu: (open) => set((state) => ({ 
    isSubmenuOpen: open !== undefined ? open : !state.isSubmenuOpen 
  })),
}))

import { create } from "zustand";

interface UIState {
  sidebarOpenMobile: boolean;
  shortcutsModalOpen: boolean;
  trashBadgeCount: number;

  toggleSidebarMobile: () => void;
  setSidebarMobile: (open: boolean) => void;
  setShortcutsModalOpen: (open: boolean) => void;
  setTrashBadgeCount: (count: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpenMobile: false,
  shortcutsModalOpen: false,
  trashBadgeCount: 0,

  toggleSidebarMobile: () => set((s) => ({ sidebarOpenMobile: !s.sidebarOpenMobile })),
  setSidebarMobile: (open) => set({ sidebarOpenMobile: open }),
  setShortcutsModalOpen: (open) => set({ shortcutsModalOpen: open }),
  setTrashBadgeCount: (count) => set({ trashBadgeCount: count }),
}));

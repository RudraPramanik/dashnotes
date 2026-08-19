import { create } from "zustand";

export type ShellState = {
  sidebarOpen: boolean;
  contextPanelOpen: boolean;
  paletteOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openContextPanel: () => void;
  closeContextPanel: () => void;
  setPaletteOpen: (open: boolean) => void;
};

export const useShellStore = create<ShellState>((set) => ({
  sidebarOpen: true,
  contextPanelOpen: false,
  paletteOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openContextPanel: () => set({ contextPanelOpen: true }),
  closeContextPanel: () => set({ contextPanelOpen: false }),
  setPaletteOpen: (open) => set({ paletteOpen: open }),
}));

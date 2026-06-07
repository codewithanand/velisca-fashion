import { create } from 'zustand';

const useUiStore = create((set) => ({
  sidebarOpen: false,
  theme: 'light',
  confirmDialog: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),

  showConfirm: (config) => set({ confirmDialog: config }),
  hideConfirm: () => set({ confirmDialog: null }),
}));

export default useUiStore;

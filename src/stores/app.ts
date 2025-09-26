import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  isDarkMode: boolean;
  sidebarCollapsed: boolean;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isDarkMode: typeof window !== 'undefined' ? 
        window.matchMedia('(prefers-color-scheme: dark)').matches : false,
      sidebarCollapsed: false,
      
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setDarkMode: (isDark: boolean) => set({ isDarkMode: isDark }),
    }),
    {
      name: 'app-storage',
    }
  )
);
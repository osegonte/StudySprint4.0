// frontend/src/common/stores/appStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  currentPage: string
  toggleTheme: () => void
  toggleSidebar: () => void
  setCurrentPage: (page: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: true,
      currentPage: 'dashboard',
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
      toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
      })),
      setCurrentPage: (page) => set({ currentPage: page }),
    }),
    {
      name: 'studysprint-app-state',
    }
  )
)

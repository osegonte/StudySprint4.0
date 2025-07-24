import { create } from 'zustand';

interface PreferencesState {
  language: string;
  defaultView: 'grid' | 'list';
  darkMode: boolean;
  setLanguage: (lang: string) => void;
  setDefaultView: (view: 'grid' | 'list') => void;
  setDarkMode: (dark: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  language: 'en',
  defaultView: 'grid',
  darkMode: false,
  setLanguage: (language) => set({ language }),
  setDefaultView: (defaultView) => set({ defaultView }),
  setDarkMode: (darkMode) => set({ darkMode }),
})); 
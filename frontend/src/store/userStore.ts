import { create } from 'zustand';

interface UserProfile {
  id: string;
  name: string;
  email?: string;
  onboardingComplete: boolean;
  preferencesSet: boolean;
  firstTime: boolean;
}

interface UserState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  completeOnboarding: () => void;
  setPreferencesSet: (set: boolean) => void;
  setFirstTime: (first: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  completeOnboarding: () => set((state) => state.profile ? { profile: { ...state.profile, onboardingComplete: true } } : {}),
  setPreferencesSet: (preferencesSet) => set((state) => state.profile ? { profile: { ...state.profile, preferencesSet } } : {}),
  setFirstTime: (firstTime) => set((state) => state.profile ? { profile: { ...state.profile, firstTime } } : {}),
  logout: () => set({ profile: null }),
})); 
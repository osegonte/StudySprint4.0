import { create } from 'zustand';

interface OnboardingState {
  showOnboarding: boolean;
  step: number;
  setShowOnboarding: (show: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  showOnboarding: true,
  step: 0,
  setShowOnboarding: (show) => set({ showOnboarding: show }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(0, state.step - 1) })),
  reset: () => set({ showOnboarding: true, step: 0 }),
})); 
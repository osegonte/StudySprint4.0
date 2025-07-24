import { create } from 'zustand';

interface SessionState {
  activeSessionId: string | null;
  timer: number;
  isRunning: boolean;
  setActiveSession: (id: string | null) => void;
  setTimer: (seconds: number) => void;
  setIsRunning: (running: boolean) => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  activeSessionId: null,
  timer: 0,
  isRunning: false,
  setActiveSession: (id) => set({ activeSessionId: id }),
  setTimer: (seconds) => set({ timer: seconds }),
  setIsRunning: (running) => set({ isRunning: running }),
  resetSession: () => set({ activeSessionId: null, timer: 0, isRunning: false }),
})); 
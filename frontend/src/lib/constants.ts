// src/lib/constants.ts
export const APP_CONFIG = {
  name: 'StudySprint 4.0',
  version: '4.0.0',
  description: 'Advanced Study Management System',
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    timeout: 10000,
  },
};

export const ROUTES = {
  DASHBOARD: '/',
  TOPICS: '/topics',
  PDFS: '/pdfs',
  STUDY: '/study',
  GOALS: '/goals',
  NOTES: '/notes',
  EXERCISES: '/exercises',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
} as const;

export const STUDY_CONFIG = {
  DEFAULT_POMODORO_WORK: 25,
  DEFAULT_POMODORO_SHORT_BREAK: 5,
  DEFAULT_POMODORO_LONG_BREAK: 15,
  DEFAULT_SESSION_GOAL: 60,
  READING_SPEED_AVERAGE: 250,
  FOCUS_SCORE_THRESHOLD: 80,
} as const;
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// src/lib/validation.ts
import { z } from 'zod';

export const topicSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  difficulty_level: z.number().min(1).max(5).optional(),
  priority_level: z.number().min(1).max(5).optional(),
});

export const goalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  goal_type: z.string().min(1, 'Goal type is required'),
  priority: z.string().optional(),
  target_value: z.number().positive().optional(),
  target_date: z.string().optional(),
});

export const noteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  note_type: z.string().optional(),
  pdf_id: z.string().optional(),
  topic_id: z.string().optional(),
});

// src/types/auth.ts
export interface User {
  id: string;
  name: string;
  email: string;
  level?: number;
  xp?: number;
  avatar?: string;
  preferences?: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  language: string;
  timezone: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

// src/types/study.ts
export interface StudyMetrics {
  total_study_time: number;
  focus_score: number;
  productivity_score: number;
  pages_read: number;
  sessions_completed: number;
  goals_achieved: number;
  current_streak: number;
}

export interface StudyPreferences {
  pomodoro_work_minutes: number;
  pomodoro_short_break: number;
  pomodoro_long_break: number;
  default_session_duration: number;
  notifications_enabled: boolean;
  focus_mode: boolean;
}

// src/types/content.ts
export interface ContentItem {
  id: string;
  title: string;
  type: 'pdf' | 'note' | 'exercise';
  topic_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SearchResult {
  id: string;
  title: string;
  type: string;
  snippet: string;
  relevance_score: number;
  source: string;
}

// src/types/global.ts
export interface APIResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ErrorResponse {
  message: string;
  code: string;
  details?: Record<string, any>;
}

export type SortOrder = 'asc' | 'desc';

export type ViewMode = 'grid' | 'list';

export type FilterOption = {
  label: string;
  value: string;
  count?: number;
};
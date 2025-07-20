// frontend/src/modules/sessions/types/index.ts
export interface StudySession {
  id: string;
  pdf_id?: string;
  topic_id?: string;
  exercise_id?: string;
  session_type: 'study' | 'exercise' | 'review' | 'research';
  session_name?: string;
  start_time: string;
  end_time?: string;
  planned_duration_minutes: number;
  total_minutes: number;
  active_minutes: number;
  idle_minutes: number;
  break_minutes: number;
  pages_visited: number;
  pages_completed: number;
  starting_page: number;
  ending_page: number;
  pomodoro_cycles: number;
  interruptions: number;
  focus_score: number;
  productivity_score: number;
  difficulty_rating?: number;
  energy_level?: number;
  mood_rating?: number;
  environment_type?: string;
  notes?: string;
  goals_set: string[];
  goals_achieved: string[];
  xp_earned: number;
  session_data: Record<string, any>;
  created_at: string;
  is_active: boolean;
  duration_seconds: number;
  efficiency_score: number;
}

export interface StudySessionCreate {
  pdf_id?: string;
  topic_id?: string;
  exercise_id?: string;
  session_type: 'study' | 'exercise' | 'review' | 'research';
  session_name?: string;
  planned_duration_minutes: number;
  starting_page: number;
  goals_set: string[];
  environment_type?: 'home' | 'library' | 'cafe' | 'office' | 'outdoor' | 'other';
}

export interface StudySessionUpdate {
  current_page?: number;
  ending_page?: number;
  pages_visited?: number;
  pages_completed?: number;
  interruptions?: number;
  notes?: string;
  goals_achieved?: string[];
  active_minutes?: number;
  idle_minutes?: number;
  break_minutes?: number;
}

export interface StudySessionEnd {
  ending_page?: number;
  difficulty_rating?: number;
  energy_level?: number;
  mood_rating?: number;
  goals_achieved?: string[];
  notes?: string;
  session_summary?: string;
}

export interface TimerState {
  session_id: string;
  is_active: boolean;
  elapsed_seconds: number;
  active_seconds?: number;
  idle_seconds?: number;
  break_seconds?: number;
  current_page?: number;
  focus_events: number;
  idle_events: number;
  last_activity: string;
  pomodoro_active: boolean;
  pomodoro_time_remaining?: number;
  focus_score?: number;
  time_since_activity?: number;
}

export interface PomodoroSession {
  id: string;
  study_session_id: string;
  cycle_number: number;
  cycle_type: 'work' | 'short_break' | 'long_break';
  planned_duration_minutes: number;
  actual_duration_minutes?: number;
  completed: boolean;
  interruptions: number;
  interruption_types: string[];
  effectiveness_rating?: number;
  focus_rating?: number;
  task_completed?: boolean;
  notes?: string;
  xp_earned: number;
  started_at: string;
  completed_at?: string;
  is_active: boolean;
}

export interface SessionAnalytics {
  total_sessions: number;
  total_study_time_minutes: number;
  average_session_duration: number;
  average_focus_score: number;
  average_productivity_score: number;
  total_pages_read: number;
  average_reading_speed_wpm: number;
  total_pomodoro_cycles: number;
  total_xp_earned: number;
  focus_trend: number[];
  productivity_trend: number[];
  daily_study_minutes: number[];
  best_study_time?: string;
  most_productive_environment?: string;
  average_session_rating: number;
}
Smart, efficient model for everyday use Learn more

Artifact
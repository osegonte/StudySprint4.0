// src/services/api.ts
import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      throw new Error('Network connection failed. Please check your internet connection.');
    }

    // Handle HTTP errors
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        localStorage.removeItem('authToken');
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        break;
      case 403:
        throw new Error(data?.message || 'Access forbidden');
      case 404:
        throw new Error(data?.message || 'Resource not found');
      case 422:
        throw new Error(data?.message || 'Validation failed');
      case 500:
        throw new Error('Server error. Please try again later.');
      default:
        throw new Error(data?.message || `Request failed with status ${status}`);
    }
    
    return Promise.reject(error);
  }
);

// Type definitions based on API specification
export interface Topic {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  difficulty_level: number;
  priority_level: number;
  total_pdfs: number;
  total_exercises: number;
  study_progress: number;
  estimated_completion_hours: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface TopicWithStats extends Topic {
  completed_pdfs: number;
  total_pages: number;
  pages_read: number;
  total_study_time_minutes: number;
  last_studied?: string;
  completion_percentage: number;
}

export interface TopicCreate {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  difficulty_level?: number;
  priority_level?: number;
}

export interface PDF {
  id: string;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  total_pages: number;
  current_page: number;
  last_read_page: number;
  reading_progress: number;
  pdf_type: string;
  difficulty_level: number;
  topic_id?: string;
  parent_pdf_id?: string;
  estimated_read_time_minutes: number;
  actual_read_time_minutes: number;
  is_completed: boolean;
  completion_date?: string;
  upload_status: string;
  processing_status: string;
  content_hash?: string;
  language: string;
  author?: string;
  subject?: string;
  keywords: string[];
  file_metadata: Record<string, any>;
  ai_analysis: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  pdf_id?: string;
  topic_id?: string;
  exercise_id?: string;
  session_type: string;
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

export interface Goal {
  id: string;
  title: string;
  description?: string;
  goal_type: string;
  status: string;
  priority: string;
  specific_description?: string;
  measurable_criteria: {
    metric: string;
    target_value: number;
    current_value: number;
  };
  achievable_plan?: string;
  relevant_reason?: string;
  time_bound_deadline?: string;
  target_value: number;
  current_value: number;
  progress_percentage: number;
  streak_count: number;
  best_streak: number;
  difficulty_rating: number;
  importance_rating: number;
  estimated_hours: number;
  actual_hours: number;
  xp_reward: number;
  badges_earned: string[];
  milestones: any[];
  created_at: string;
  updated_at: string;
  target_date: string;
}

export interface Note {
  id: string;
  title: string;
  content?: string;
  note_type: string;
  pdf_id?: string;
  topic_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: number;
  title: string;
  description?: string;
  question: string;
  answer: string;
  explanation?: string;
  topic_id: string;
  exercise_type: string;
  difficulty: number;
  estimated_time: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  total_attempts: number;
  success_rate: number;
  average_time: number;
  last_attempted?: string;
}

// API Service Classes - Production Ready without Mock Data
export class TopicsAPI {
  static async getAll(): Promise<Topic[]> {
    const response = await apiClient.get<Topic[]>('/topics/');
    return response.data;
  }

  static async getById(id: string): Promise<Topic> {
    const response = await apiClient.get<Topic>(`/topics/${id}`);
    return response.data;
  }

  static async getWithStats(id: string): Promise<TopicWithStats> {
    const response = await apiClient.get<TopicWithStats>(`/topics/${id}/stats`);
    return response.data;
  }

  static async create(topic: TopicCreate): Promise<Topic> {
    const response = await apiClient.post<Topic>('/topics/', topic);
    return response.data;
  }

  static async update(id: string, topic: Partial<TopicCreate>): Promise<Topic> {
    const response = await apiClient.put<Topic>(`/topics/${id}`, topic);
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete(`/topics/${id}`);
  }

  static async search(query: string): Promise<Topic[]> {
    const response = await apiClient.get<Topic[]>(`/topics/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  static async getHierarchy(): Promise<TopicWithStats[]> {
    const response = await apiClient.get<TopicWithStats[]>('/topics/hierarchy');
    return response.data;
  }

  static async archive(id: string): Promise<void> {
    await apiClient.post(`/topics/${id}/archive`);
  }

  static async restore(id: string): Promise<void> {
    await apiClient.post(`/topics/${id}/restore`);
  }

  static async updateProgress(id: string): Promise<void> {
    await apiClient.post(`/topics/${id}/update-progress`);
  }
}

export class PDFsAPI {
  static async getAll(params?: {
    query?: string;
    topic_id?: string;
    pdf_type?: string;
    difficulty_level?: number;
    is_completed?: boolean;
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<{ pdfs: PDF[]; total: number; page: number; page_size: number; total_pages: number }> {
    const response = await apiClient.get('/pdfs/', { params });
    return response.data;
  }

  static async getById(id: string): Promise<PDF> {
    const response = await apiClient.get<PDF>(`/pdfs/${id}`);
    return response.data;
  }

  static async upload(formData: FormData, onProgress?: (progress: number) => void): Promise<{ pdf_id: string; message: string; upload_status: string; processing_status: string }> {
    const response = await apiClient.post('/pdfs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  }

  static async update(id: string, pdf: Partial<PDF>): Promise<PDF> {
    const response = await apiClient.put<PDF>(`/pdfs/${id}`, pdf);
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete(`/pdfs/${id}`);
  }

  static async getContent(id: string): Promise<Blob> {
    const response = await apiClient.get(`/pdfs/${id}/content`, {
      responseType: 'blob',
    });
    return response.data;
  }

  static async searchContent(query: string, topicId?: string): Promise<{
    query: string;
    results: Array<{
      pdf_id: string;
      title: string;
      description?: string;
      matches: Array<{
        context: string;
        highlighted_text: string;
      }>;
    }>;
    total_matches: number;
  }> {
    const params = { query, ...(topicId && { topic_id: topicId }) };
    const response = await apiClient.get('/pdfs/search/content', { params });
    return response.data;
  }
}

export class StudySessionsAPI {
  static async startSession(sessionData: {
    pdf_id?: string;
    topic_id?: string;
    exercise_id?: string;
    session_type?: string;
    session_name?: string;
    planned_duration_minutes?: number;
    starting_page?: number;
    goals_set?: string[];
    environment_type?: string;
  }): Promise<StudySession> {
    const response = await apiClient.post<StudySession>('/study-sessions/start', sessionData);
    return response.data;
  }

  static async getCurrentSession(): Promise<StudySession | null> {
    const response = await apiClient.get<StudySession | null>('/study-sessions/current');
    return response.data;
  }

  static async updateSession(id: string, updates: {
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
  }): Promise<StudySession> {
    const response = await apiClient.put<StudySession>(`/study-sessions/${id}`, updates);
    return response.data;
  }

  static async endSession(id: string, endData: {
    ending_page?: number;
    difficulty_rating?: number;
    energy_level?: number;
    mood_rating?: number;
    goals_achieved?: string[];
    notes?: string;
    session_summary?: string;
  }): Promise<StudySession> {
    const response = await apiClient.post<StudySession>(`/study-sessions/${id}/end`, endData);
    return response.data;
  }

  static async pauseSession(id: string): Promise<StudySession> {
    const response = await apiClient.post<StudySession>(`/study-sessions/${id}/pause`);
    return response.data;
  }

  static async resumeSession(id: string): Promise<StudySession> {
    const response = await apiClient.post<StudySession>(`/study-sessions/${id}/resume`);
    return response.data;
  }

  static async getAll(params?: {
    pdf_id?: string;
    topic_id?: string;
    session_type?: string;
    start_date?: string;
    end_date?: string;
    min_duration?: number;
    min_focus_score?: number;
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<{ sessions: StudySession[]; total: number; page: number; page_size: number; total_pages: number }> {
    const response = await apiClient.get('/study-sessions/', { params });
    return response.data;
  }

  static async getById(id: string): Promise<StudySession> {
    const response = await apiClient.get<StudySession>(`/study-sessions/${id}`);
    return response.data;
  }

  static async getAnalyticsOverview(params?: {
    start_date?: string;
    end_date?: string;
    topic_id?: string;
  }): Promise<{
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
  }> {
    const response = await apiClient.get('/study-sessions/analytics/overview', { params });
    return response.data;
  }

  static async getDailyAnalytics(days: number = 30): Promise<{
    period: string;
    start_date: string;
    end_date: string;
    analytics: any;
  }> {
    const response = await apiClient.get(`/study-sessions/analytics/daily?days=${days}`);
    return response.data;
  }

  static async registerActivity(sessionId: string, activityType: string = 'interaction'): Promise<{ status: string; type: string }> {
    const response = await apiClient.post(`/study-sessions/${sessionId}/activity?activity_type=${activityType}`);
    return response.data;
  }

  static async registerInterruption(sessionId: string, interruptionType: string = 'unknown'): Promise<{ status: string; type: string }> {
    const response = await apiClient.post(`/study-sessions/${sessionId}/interruption?interruption_type=${interruptionType}`);
    return response.data;
  }

  static async getTimerState(sessionId: string): Promise<{
    session_id: string;
    is_active: boolean;
    elapsed_seconds: number;
    active_seconds: number;
    idle_seconds: number;
    break_seconds: number;
    planned_duration: number;
    progress_percentage: number;
    activity_count: number;
    interruptions: number;
    focus_score: number;
    is_idle: boolean;
    time_since_activity: number;
    pomodoro_cycles: number;
  }> {
    const response = await apiClient.get(`/study-sessions/${sessionId}/timer-state`);
    return response.data;
  }
}

export class GoalsAPI {
  static async getAll(params?: {
    status_filter?: string;
    goal_type?: string;
    priority?: string;
  }): Promise<{
    goals: Goal[];
    total: number;
    summary: {
      total_goals: number;
      active_goals: number;
      completed_goals: number;
      overdue_goals: number;
      completion_rate: number;
      total_xp_earned: number;
      average_progress: number;
      achievements_unlocked: number;
    };
    insights: string[];
    upcoming_deadlines: Array<{
      goal_id: string;
      title: string;
      target_date: string;
      days_remaining: number;
      progress_percentage: number;
    }>;
  }> {
    const response = await apiClient.get('/goals/', { params });
    return response.data;
  }

  static async getById(id: string): Promise<Goal> {
    const response = await apiClient.get<Goal>(`/goals/${id}`);
    return response.data;
  }

  static async create(goal: {
    title: string;
    description?: string;
    goal_type: string;
    priority?: string;
    specific_description?: string;
    achievable_plan?: string;
    relevant_reason?: string;
    deadline?: string;
    target_value?: number;
    target_date?: string;
    difficulty_rating?: number;
    importance_rating?: number;
    estimated_hours?: number;
  }): Promise<Goal> {
    const response = await apiClient.post<Goal>('/goals/', goal);
    return response.data;
  }

  static async updateProgress(id: string, newValue: number): Promise<Goal> {
    const response = await apiClient.put<Goal>(`/goals/${id}/progress`, { new_value: newValue });
    return response.data;
  }

  static async getMilestones(id: string): Promise<{ goal_id: string; milestones: any[] }> {
    const response = await apiClient.get(`/goals/${id}/milestones`);
    return response.data;
  }

  static async getAchievements(): Promise<{
    achievements: Array<{
      id: string;
      title: string;
      description: string;
      xp_reward: number;
      earned_date: string;
      goal_id: string;
    }>;
    total_earned: number;
    total_xp: number;
    recent: any[];
  }> {
    const response = await apiClient.get('/goals/achievements');
    return response.data;
  }

  static async getInsights(): Promise<{
    insights: string[];
    performance_summary: {
      total_goals: number;
      completion_rate: number;
    };
    recommendations: string[];
  }> {
    const response = await apiClient.get('/goals/insights');
    return response.data;
  }

  static async getAnalyticsOverview(): Promise<{
    summary: Record<string, any>;
    trends: Record<string, any>;
    insights: string[];
    achievements: any[];
  }> {
    const response = await apiClient.get('/goals/analytics/overview');
    return response.data;
  }

  static async getDashboard(): Promise<{
    summary: Record<string, any>;
    active_goals: Goal[];
    insights: string[];
    achievements: any[];
    upcoming_deadlines: any[];
    recommendations: string[];
  }> {
    const response = await apiClient.get('/goals/analytics/dashboard');
    return response.data;
  }
}

export class NotesAPI {
  static async getAll(): Promise<Note[]> {
    const response = await apiClient.get<Note[]>('/notes/');
    return response.data;
  }

  static async create(note: {
    title: string;
    content?: string;
    note_type?: string;
    pdf_id?: string;
    topic_id?: string;
  }): Promise<Note> {
    const response = await apiClient.post<Note>('/notes/', note);
    return response.data;
  }

  static async createHighlight(highlight: {
    pdf_id: string;
    page_number: number;
    selected_text?: string;
    color?: string;
  }): Promise<{
    id: string;
    pdf_id: string;
    page_number: number;
    selected_text?: string;
    color: string;
    created_at: string;
  }> {
    const response = await apiClient.post('/notes/highlights', highlight);
    return response.data;
  }
}

export class ExercisesAPI {
  static async getById(id: number): Promise<Exercise> {
    const response = await apiClient.get<Exercise>(`/exercises/${id}`);
    return response.data;
  }

  static async create(exercise: {
    title: string;
    description?: string;
    question: string;
    answer: string;
    explanation?: string;
    topic_id: string;
    exercise_type?: string;
    estimated_time?: number;
  }): Promise<Exercise> {
    const response = await apiClient.post<Exercise>('/exercises/', exercise);
    return response.data;
  }

  static async submitAttempt(attempt: {
    exercise_id: number;
    user_answer: string;
    confidence_level: number;
    time_taken: number;
  }): Promise<{
    id: number;
    exercise_id: number;
    user_answer: string;
    is_correct: boolean;
    score: number;
    time_taken?: number;
    confidence_level?: number;
    attempted_at: string;
    exercise_title?: string;
    correct_answer?: string;
    explanation?: string;
  }> {
    const response = await apiClient.post('/exercises/attempts', attempt);
    return response.data;
  }

  static async getAnalyticsOverview(topicId?: string): Promise<{
    total_exercises: number;
    exercises_completed: number;
    completion_rate: number;
    average_score: number;
    time_spent: number;
    exercises_due: number;
    improvement_trend: string;
  }> {
    const params = topicId ? { topic_id: topicId } : {};
    const response = await apiClient.get('/exercises/analytics/overview', { params });
    return response.data;
  }
}

export class AnalyticsAPI {
  static async getDashboard(): Promise<{
    overview: {
      goals: {
        total_goals: number;
        active_goals: number;
        completed_goals: number;
        total_xp: number;
      };
      study: {
        total_study_time_minutes: number;
        total_sessions: number;
        avg_focus_score: number;
        productivity_score: number;
        weekly_study_hours: number[];
        consistency_score: number;
      };
      achievements: {
        total_earned: number;
        total_xp: number;
      };
    };
    performance: {
      focus_trend: number[];
      productivity_trend: number[];
      goal_completion_trend: number[];
    };
    insights: string[];
    quick_stats: {
      today_study_time: number;
      today_goals_progress: number;
      week_completion_rate: number;
      current_streak: number;
    };
  }> {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data;
  }

  static async getPerformance(period: 'day' | 'week' | 'month' = 'week'): Promise<{
    period: string;
    time_data: {
      labels: string[];
      study_minutes: number[];
      focus_scores: number[];
      goals_progress: number[];
    };
    performance_score: number;
    productivity_metrics: {
      efficiency_score: number;
      consistency_score: number;
      focus_quality: number;
      goal_alignment: number;
    };
    insights: string[];
  }> {
    const response = await apiClient.get(`/analytics/performance?period=${period}`);
    return response.data;
  }

  static async getRealTimeMetrics(): Promise<{
    timestamp: string;
    active_session: {
      is_active: boolean;
      session_id?: string;
      elapsed_minutes: number;
    };
    today_stats: {
      study_time_minutes: number;
      focus_score: number;
      pages_read: number;
      goals_progress: number;
      productivity_score: number;
    };
    live_insights: string[];
    quick_actions: Array<{
      action: string;
      url: string;
    }>;
  }> {
    const response = await apiClient.get('/analytics/real-time');
    return response.data;
  }

  static async getSummary(period: 'week' | 'month' | 'year' = 'month'): Promise<{
    period: string;
    period_start: string;
    period_end: string;
    study_summary: {
      total_study_time_minutes: number;
      total_sessions: number;
      avg_session_duration: number;
      total_pages_read: number;
      avg_focus_score: number;
      productivity_score: number;
    };
    goals_summary: {
      goals_worked_on: number;
      goals_completed: number;
      milestones_achieved: number;
      total_xp_earned: number;
      completion_rate: number;
    };
    performance_trends: {
      study_time_trend: string;
      focus_improvement: string;
      goal_completion: string;
      consistency_score: number;
    };
  }> {
    const response = await apiClient.get(`/analytics/summary?period=${period}`);
    return response.data;
  }

  static async getTopicAnalytics(): Promise<Array<{
    topic_name: string;
    study_time_minutes: number;
    completion_percentage: number;
    focus_score: number;
    sessions_count: number;
    pages_read: number;
    trend: string;
  }>> {
    const response = await apiClient.get('/analytics/topics');
    return response.data;
  }

  static async getInsights(category?: string, limit: number = 10): Promise<{
    insights: Array<{
      category: string;
      type: string;
      title: string;
      description: string;
      confidence?: number;
      action_items: string[];
      streak_count?: number;
    }>;
    total_available: number;
    generated_at: string;
  }> {
    const params = { ...(category && { category }), limit };
    const response = await apiClient.get('/analytics/insights', { params });
    return response.data;
  }
}

// Export all APIs in a single object
export const API = {
  topics: TopicsAPI,
  pdfs: PDFsAPI,
  sessions: StudySessionsAPI,
  goals: GoalsAPI,
  notes: NotesAPI,
  exercises: ExercisesAPI,
  analytics: AnalyticsAPI,
};

// Error handling utilities
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Health check utility
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

export default API;
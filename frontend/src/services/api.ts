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
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
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
  estimated_read_time_minutes: number;
  actual_read_time_minutes: number;
  is_completed: boolean;
  completion_date?: string;
  upload_status: string;
  processing_status: string;
  language: string;
  author?: string;
  subject?: string;
  keywords: string[];
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  pdf_id?: string;
  topic_id?: string;
  session_type: string;
  session_name?: string;
  start_time: string;
  end_time?: string;
  planned_duration_minutes: number;
  total_minutes: number;
  active_minutes: number;
  focus_score: number;
  productivity_score: number;
  is_active: boolean;
  created_at: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  goal_type: string;
  status: string;
  priority: string;
  target_value: number;
  current_value: number;
  progress_percentage: number;
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
}

// API Service Classes
export class TopicsAPI {
  static async getAll(): Promise<Topic[]> {
    const response = await apiClient.get<Topic[]>('/topics/');
    return response.data;
  }

  static async getById(id: string): Promise<Topic> {
    const response = await apiClient.get<Topic>(`/topics/${id}`);
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

  static async getHierarchy(): Promise<Topic[]> {
    const response = await apiClient.get<Topic[]>('/topics/hierarchy');
    return response.data;
  }

  static async archive(id: string): Promise<void> {
    await apiClient.post(`/topics/${id}/archive`);
  }

  static async restore(id: string): Promise<void> {
    await apiClient.post(`/topics/${id}/restore`);
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
  }): Promise<{ pdfs: PDF[]; total: number; page: number; page_size: number; total_pages: number }> {
    const response = await apiClient.get('/pdfs/', { params });
    return response.data;
  }

  static async getById(id: string): Promise<PDF> {
    const response = await apiClient.get<PDF>(`/pdfs/${id}`);
    return response.data;
  }

  static async upload(formData: FormData, onProgress?: (progress: number) => void): Promise<{ pdf_id: string; message: string }> {
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

  static async searchContent(query: string, topicId?: string): Promise<any> {
    const params = { query, ...(topicId && { topic_id: topicId }) };
    const response = await apiClient.get('/pdfs/search/content', { params });
    return response.data;
  }
}

export class StudySessionsAPI {
  static async startSession(sessionData: {
    pdf_id?: string;
    topic_id?: string;
    session_type?: string;
    planned_duration_minutes?: number;
    starting_page?: number;
    goals_set?: string[];
  }): Promise<StudySession> {
    const response = await apiClient.post<StudySession>('/study-sessions/start', sessionData);
    return response.data;
  }

  static async getCurrentSession(): Promise<StudySession | null> {
    const response = await apiClient.get<StudySession | null>('/study-sessions/current');
    return response.data;
  }

  static async updateSession(id: string, updates: Partial<StudySession>): Promise<StudySession> {
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
    page?: number;
    page_size?: number;
  }): Promise<{ sessions: StudySession[]; total: number; page: number; page_size: number; total_pages: number }> {
    const response = await apiClient.get('/study-sessions/', { params });
    return response.data;
  }

  static async getAnalytics(params?: {
    start_date?: string;
    end_date?: string;
    topic_id?: string;
  }): Promise<any> {
    const response = await apiClient.get('/study-sessions/analytics/overview', { params });
    return response.data;
  }
}

export class GoalsAPI {
  static async getAll(params?: {
    status_filter?: string;
    goal_type?: string;
    priority?: string;
  }): Promise<{ goals: Goal[]; total: number; summary: any }> {
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

  static async getInsights(): Promise<any> {
    const response = await apiClient.get('/goals/insights');
    return response.data;
  }

  static async getAchievements(): Promise<any> {
    const response = await apiClient.get('/goals/achievements');
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
  }): Promise<any> {
    const response = await apiClient.post('/notes/highlights', highlight);
    return response.data;
  }
}

export class ExercisesAPI {
  static async getById(id: number): Promise<Exercise> {
    const response = await apiClient.get<Exercise>(`/exercises/${id}`);
    return response.data;
  }

  static async submitAttempt(attempt: {
    exercise_id: number;
    user_answer: string;
    confidence_level: number;
    time_taken: number;
  }): Promise<any> {
    const response = await apiClient.post('/exercises/attempts', attempt);
    return response.data;
  }

  static async getAnalytics(topicId?: string): Promise<any> {
    const params = topicId ? { topic_id: topicId } : {};
    const response = await apiClient.get('/exercises/analytics/overview', { params });
    return response.data;
  }
}

export class AnalyticsAPI {
  static async getDashboard(): Promise<any> {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data;
  }

  static async getPerformance(period: 'day' | 'week' | 'month' = 'week'): Promise<any> {
    const response = await apiClient.get(`/analytics/performance?period=${period}`);
    return response.data;
  }

  static async getRealTimeMetrics(): Promise<any> {
    const response = await apiClient.get('/analytics/real-time');
    return response.data;
  }

  static async getSummary(period: 'week' | 'month' | 'year' = 'month'): Promise<any> {
    const response = await apiClient.get(`/analytics/summary?period=${period}`);
    return response.data;
  }

  static async getTopicAnalytics(): Promise<any> {
    const response = await apiClient.get('/analytics/topics');
    return response.data;
  }

  static async getInsights(category?: string, limit?: number): Promise<any> {
    const params = { ...(category && { category }), ...(limit && { limit }) };
    const response = await apiClient.get('/analytics/insights', { params });
    return response.data;
  }
}

// Export all APIs
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
export const handleApiError = (error: any) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default API;


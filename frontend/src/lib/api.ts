// src/lib/api.ts
import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Response Types
export interface APIResponse<T> {
  data: T;
  message?: string;
  status: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Topic Types
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

// PDF Types
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

// Study Session Types
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

// Goal Types
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

// Note Types
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

// Exercise Types
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

// Mock data for development
const mockTopics: Topic[] = [
  {
    id: '1',
    name: 'Mathematics',
    description: 'Advanced calculus and linear algebra',
    color: '#3B82F6',
    icon: 'calculator',
    difficulty_level: 4,
    priority_level: 5,
    total_pdfs: 12,
    total_exercises: 45,
    study_progress: 65.5,
    estimated_completion_hours: 120,
    is_archived: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T15:30:00Z'
  },
  {
    id: '2',
    name: 'Physics',
    description: 'Quantum mechanics and thermodynamics',
    color: '#8B5CF6',
    icon: 'atom',
    difficulty_level: 5,
    priority_level: 4,
    total_pdfs: 8,
    total_exercises: 32,
    study_progress: 42.3,
    estimated_completion_hours: 95,
    is_archived: false,
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-18T14:20:00Z'
  },
  {
    id: '3',
    name: 'Computer Science',
    description: 'Algorithms and data structures',
    color: '#10B981',
    icon: 'cpu',
    difficulty_level: 3,
    priority_level: 5,
    total_pdfs: 15,
    total_exercises: 78,
    study_progress: 78.9,
    estimated_completion_hours: 80,
    is_archived: false,
    created_at: '2024-01-05T08:00:00Z',
    updated_at: '2024-01-22T16:45:00Z'
  }
];

const mockPdfs: PDF[] = [
  {
    id: '1',
    title: 'Advanced Calculus Fundamentals',
    description: 'Comprehensive guide to calculus concepts',
    file_name: 'calculus_fundamentals.pdf',
    file_path: '/uploads/pdfs/calculus_fundamentals.pdf',
    file_size: 2458000,
    total_pages: 324,
    current_page: 89,
    last_read_page: 89,
    reading_progress: 27.5,
    pdf_type: 'study',
    difficulty_level: 4,
    topic_id: '1',
    estimated_read_time_minutes: 485,
    actual_read_time_minutes: 234,
    is_completed: false,
    upload_status: 'completed',
    processing_status: 'completed',
    language: 'en',
    keywords: ['calculus', 'mathematics', 'derivatives', 'integrals'],
    file_metadata: {},
    ai_analysis: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T15:30:00Z'
  },
  {
    id: '2',
    title: 'Quantum Mechanics Introduction',
    description: 'Basic principles of quantum physics',
    file_name: 'quantum_mechanics_intro.pdf',
    file_path: '/uploads/pdfs/quantum_mechanics_intro.pdf',
    file_size: 1890000,
    total_pages: 256,
    current_page: 256,
    last_read_page: 256,
    reading_progress: 100,
    pdf_type: 'study',
    difficulty_level: 5,
    topic_id: '2',
    estimated_read_time_minutes: 384,
    actual_read_time_minutes: 425,
    is_completed: true,
    completion_date: '2024-01-18T14:20:00Z',
    upload_status: 'completed',
    processing_status: 'completed',
    language: 'en',
    keywords: ['quantum', 'physics', 'mechanics', 'wave function'],
    file_metadata: {},
    ai_analysis: {},
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-18T14:20:00Z'
  }
];

// API Service Classes with mock data fallback
export class TopicsAPI {
  static async getAll(): Promise<Topic[]> {
    try {
      const response = await apiClient.get<Topic[]>('/topics/');
      return response.data;
    } catch (error) {
      console.warn('API not available, using mock data');
      // Return mock data if API is not available
      return new Promise(resolve => {
        setTimeout(() => resolve(mockTopics), 500);
      });
    }
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
  }): Promise<PaginatedResponse<PDF>> {
    try {
      const response = await apiClient.get<PaginatedResponse<PDF>>('/pdfs/', { params });
      return response.data;
    } catch (error) {
      console.warn('API not available, using mock data');
      // Return mock data if API is not available
      return new Promise(resolve => {
        setTimeout(() => resolve({
          items: mockPdfs,
          total: mockPdfs.length,
          page: 1,
          page_size: 20,
          total_pages: 1
        }), 500);
      });
    }
  }

  static async getById(id: string): Promise<PDF> {
    const response = await apiClient.get<PDF>(`/pdfs/${id}`);
    return response.data;
  }

  static async upload(formData: FormData): Promise<{ pdf_id: string; message: string }> {
    const response = await apiClient.post('/pdfs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
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
}

export class StudySessionsAPI {
  static async startSession(sessionData: {
    pdf_id?: string;
    topic_id?: string;
    session_type?: string;
    planned_duration_minutes?: number;
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
  }): Promise<PaginatedResponse<StudySession>> {
    const response = await apiClient.get<PaginatedResponse<StudySession>>('/study-sessions/', { params });
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
}

export class AnalyticsAPI {
  static async getDashboard(): Promise<{
    overview: any;
    performance: any;
    insights: string[];
    quick_stats: any;
  }> {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data;
  }

  static async getPerformance(period: 'day' | 'week' | 'month' = 'week'): Promise<{
    period: string;
    time_data: any;
    performance_score: number;
    productivity_metrics: any;
    insights: string[];
  }> {
    const response = await apiClient.get(`/analytics/performance?period=${period}`);
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

export default API;
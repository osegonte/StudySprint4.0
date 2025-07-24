// src/services/api.ts - Updated with proper data handling
import axios from 'axios';

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

// Helper function to safely extract array data
const extractArrayData = (response: any, fallback: any[] = []): any[] => {
  if (Array.isArray(response)) return response;
  if (response?.topics && Array.isArray(response.topics)) return response.topics;
  if (response?.data && Array.isArray(response.data)) return response.data;
  if (response?.items && Array.isArray(response.items)) return response.items;
  return fallback;
};

// Helper function to safely extract object data
const extractObjectData = (response: any, fallback: any = {}): any => {
  if (typeof response === 'object' && response !== null) return response;
  return fallback;
};

// API Service Classes with proper data handling
export class TopicsAPI {
  static async getAll() {
    try {
      const response = await apiClient.get('/topics/');
      const data = response.data;
      
      // Handle different response formats
      const topics = extractArrayData(data, []);
      
      console.log('Topics API response:', data);
      console.log('Extracted topics:', topics);
      
      return topics;
    } catch (error) {
      console.warn('Topics API not available, returning empty array');
      return [];
    }
  }

  static async getById(id: string) {
    const response = await apiClient.get(`/topics/${id}`);
    return extractObjectData(response.data);
  }

  static async create(topic: any) {
    const response = await apiClient.post('/topics/', topic);
    return extractObjectData(response.data);
  }

  static async update(id: string, topic: any) {
    const response = await apiClient.put(`/topics/${id}`, topic);
    return extractObjectData(response.data);
  }

  static async delete(id: string) {
    await apiClient.delete(`/topics/${id}`);
  }
}

export class PDFsAPI {
  static async getAll(params?: any) {
    try {
      const response = await apiClient.get('/pdfs/', { params });
      const data = response.data;
      
      console.log('PDFs API response:', data);
      
      // Handle different response formats
      if (data?.pdfs && Array.isArray(data.pdfs)) {
        return {
          pdfs: data.pdfs,
          total: data.total || data.pdfs.length,
          page: data.page || 1,
          page_size: data.page_size || 20,
          total_pages: data.total_pages || 1
        };
      }
      
      const pdfs = extractArrayData(data, []);
      return {
        pdfs: pdfs,
        total: pdfs.length,
        page: 1,
        page_size: 20,
        total_pages: 1
      };
    } catch (error) {
      console.warn('PDFs API not available, returning empty data');
      return {
        pdfs: [],
        total: 0,
        page: 1,
        page_size: 20,
        total_pages: 1
      };
    }
  }

  static async getById(id: string) {
    const response = await apiClient.get(`/pdfs/${id}`);
    return extractObjectData(response.data);
  }

  static async upload(formData: FormData, onProgress?: (progress: number) => void) {
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
    return extractObjectData(response.data);
  }

  static async update(id: string, pdf: any) {
    const response = await apiClient.put(`/pdfs/${id}`, pdf);
    return extractObjectData(response.data);
  }

  static async delete(id: string) {
    await apiClient.delete(`/pdfs/${id}`);
  }

  static async getContent(id: string) {
    const response = await apiClient.get(`/pdfs/${id}/content`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export class StudySessionsAPI {
  static async startSession(sessionData: any) {
    const response = await apiClient.post('/study-sessions/start', sessionData);
    return extractObjectData(response.data);
  }

  static async getCurrentSession() {
    try {
      const response = await apiClient.get('/study-sessions/current');
      const data = response.data;
      
      console.log('Current session response:', data);
      
      return extractObjectData(data, null);
    } catch (error) {
      console.warn('Current session API not available');
      return null;
    }
  }

  static async updateSession(id: string, updates: any) {
    const response = await apiClient.put(`/study-sessions/${id}`, updates);
    return extractObjectData(response.data);
  }

  static async endSession(id: string, endData: any) {
    const response = await apiClient.post(`/study-sessions/${id}/end`, endData);
    return extractObjectData(response.data);
  }

  static async pauseSession(id: string) {
    const response = await apiClient.post(`/study-sessions/${id}/pause`);
    return extractObjectData(response.data);
  }

  static async resumeSession(id: string) {
    const response = await apiClient.post(`/study-sessions/${id}/resume`);
    return extractObjectData(response.data);
  }

  static async getAll(params?: any) {
    const response = await apiClient.get('/study-sessions/', { params });
    return extractArrayData(response.data);
  }
}

export class GoalsAPI {
  static async getAll(params?: any) {
    try {
      const response = await apiClient.get('/goals/', { params });
      const data = response.data;
      
      console.log('Goals API response:', data);
      
      // Handle different response formats
      if (data?.goals && Array.isArray(data.goals)) {
        return {
          goals: data.goals,
          total: data.total || data.goals.length,
          summary: data.summary || {
            total_goals: data.goals.length,
            active_goals: 0,
            completed_goals: 0,
            total_xp_earned: 0,
            completion_rate: 0
          }
        };
      }
      
      const goals = extractArrayData(data, []);
      return {
        goals: goals,
        total: goals.length,
        summary: {
          total_goals: goals.length,
          active_goals: 0,
          completed_goals: 0,
          total_xp_earned: 0,
          completion_rate: 0
        }
      };
    } catch (error) {
      console.warn('Goals API not available, returning empty data');
      return {
        goals: [],
        total: 0,
        summary: {
          total_goals: 0,
          active_goals: 0,
          completed_goals: 0,
          total_xp_earned: 0,
          completion_rate: 0
        }
      };
    }
  }

  static async getById(id: string) {
    const response = await apiClient.get(`/goals/${id}`);
    return extractObjectData(response.data);
  }

  static async create(goal: any) {
    const response = await apiClient.post('/goals/', goal);
    return extractObjectData(response.data);
  }

  static async updateProgress(id: string, newValue: number) {
    const response = await apiClient.put(`/goals/${id}/progress`, { new_value: newValue });
    return extractObjectData(response.data);
  }
}

export class NotesAPI {
  static async getAll() {
    try {
      const response = await apiClient.get('/notes/');
      const data = response.data;
      
      console.log('Notes API response:', data);
      
      return extractArrayData(data, []);
    } catch (error) {
      console.warn('Notes API not available, returning empty array');
      return [];
    }
  }

  static async create(note: any) {
    const response = await apiClient.post('/notes/', note);
    return extractObjectData(response.data);
  }
}

export class ExercisesAPI {
  static async getById(id: number) {
    const response = await apiClient.get(`/exercises/${id}`);
    return extractObjectData(response.data);
  }

  static async submitAttempt(attempt: any) {
    const response = await apiClient.post('/exercises/attempts', attempt);
    return extractObjectData(response.data);
  }

  static async getAnalyticsOverview(topicId?: string) {
    try {
      const params = topicId ? { topic_id: topicId } : {};
      const response = await apiClient.get('/exercises/analytics/overview', { params });
      const data = response.data;
      
      console.log('Exercises analytics response:', data);
      
      return extractObjectData(data, {
        total_exercises: 0,
        exercises_completed: 0,
        completion_rate: 0,
        average_score: 0,
        time_spent: 0,
        exercises_due: 0,
        improvement_trend: 'stable'
      });
    } catch (error) {
      console.warn('Exercises analytics not available, returning empty data');
      return {
        total_exercises: 0,
        exercises_completed: 0,
        completion_rate: 0,
        average_score: 0,
        time_spent: 0,
        exercises_due: 0,
        improvement_trend: 'stable'
      };
    }
  }
}

export class AnalyticsAPI {
  static async getDashboard() {
    try {
      const response = await apiClient.get('/analytics/dashboard');
      const data = response.data;
      
      console.log('Analytics dashboard response:', data);
      
      return extractObjectData(data, {
        overview: {
          goals: {
            total_goals: 0,
            active_goals: 0,
            completed_goals: 0,
            total_xp: 0
          },
          study: {
            total_study_time_minutes: 0,
            total_sessions: 0,
            avg_focus_score: 0,
            weekly_study_hours: [0, 0, 0, 0, 0, 0, 0]
          }
        },
        insights: [],
        quick_stats: {
          today_study_time: 0,
          current_streak: 0
        }
      });
    } catch (error) {
      console.warn('Analytics dashboard not available, returning empty data');
      return {
        overview: {
          goals: {
            total_goals: 0,
            active_goals: 0,
            completed_goals: 0,
            total_xp: 0
          },
          study: {
            total_study_time_minutes: 0,
            total_sessions: 0,
            avg_focus_score: 0,
            weekly_study_hours: [0, 0, 0, 0, 0, 0, 0]
          }
        },
        insights: [],
        quick_stats: {
          today_study_time: 0,
          current_streak: 0
        }
      };
    }
  }

  static async getPerformance(period: 'day' | 'week' | 'month' = 'week') {
    try {
      const response = await apiClient.get(`/analytics/performance?period=${period}`);
      const data = response.data;
      
      console.log('Analytics performance response:', data);
      
      return extractObjectData(data, {
        period,
        time_data: {
          labels: [],
          study_minutes: [],
          focus_scores: []
        },
        performance_score: 0,
        insights: []
      });
    } catch (error) {
      console.warn('Analytics performance not available, returning empty data');
      return {
        period,
        time_data: {
          labels: [],
          study_minutes: [],
          focus_scores: []
        },
        performance_score: 0,
        insights: []
      };
    }
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
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Types for better type safety
export interface Topic {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  difficulty_level: number;
  priority_level: number;
  study_progress: number;
  total_pdfs: number;
  total_exercises: number;
  estimated_completion_hours: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface PDF {
  id: string;
  title: string;
  description?: string;
  author?: string;
  file_size: number;
  total_pages: number;
  current_page: number;
  reading_progress: number;
  is_completed: boolean;
  pdf_type: string;
  difficulty_level: number;
  language?: string;
  actual_read_time_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  session_type: string;
  session_name?: string;
  planned_duration_minutes: number;
  duration_seconds: number;
  is_active: boolean;
  focus_score?: number;
  productivity_score?: number;
  pages_visited?: number;
  active_minutes?: number;
  total_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  goal_type: string;
  priority: string;
  target_value: number;
  current_value: number;
  progress_percentage: number;
  target_date: string;
  status: string;
  xp_reward: number;
  streak_count: number;
  created_at: string;
  updated_at: string;
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
  question: string;
  exercise_type: string;
  difficulty: number;
  topic_id?: string;
  created_at: string;
  updated_at: string;
}

export default API;
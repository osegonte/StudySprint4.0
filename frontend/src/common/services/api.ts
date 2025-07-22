// frontend/src/common/services/api.ts
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// TypeScript interfaces for backend schemas
export interface Topic {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  total_pdfs: number
  total_exercises: number
  study_progress: number
  estimated_completion_hours: number
  difficulty_level: number
  priority_level: number
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface PDF {
  id: string
  topic_id: string
  title: string
  description?: string
  file_name: string
  file_path: string
  file_size: number
  total_pages: number
  current_page: number
  last_read_page: number
  reading_progress: number
  pdf_type: string
  difficulty_level: number
  estimated_read_time_minutes: number
  actual_read_time_minutes: number
  is_completed: boolean
  completion_date?: string
  upload_status: string
  processing_status: string
  created_at: string
  updated_at: string
}

// API Service classes
export class TopicsService {
  static async getAll(): Promise<Topic[]> {
    const response = await apiClient.get('/topics/')
    return response.data
  }

  static async getById(id: string): Promise<Topic> {
    const response = await apiClient.get(`/topics/${id}`)
    return response.data
  }

  static async create(data: Partial<Topic>): Promise<Topic> {
    const response = await apiClient.post('/topics/', data)
    return response.data
  }

  static async update(id: string, data: Partial<Topic>): Promise<Topic> {
    const response = await apiClient.put(`/topics/${id}`, data)
    return response.data
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete(`/topics/${id}`)
  }
}

export class PDFService {
  static async getAll(): Promise<PDF[]> {
    const response = await apiClient.get('/pdfs/')
    return response.data
  }

  static async getById(id: string): Promise<PDF> {
    const response = await apiClient.get(`/pdfs/${id}`)
    return response.data
  }

  static async upload(file: File, topicId: string): Promise<PDF> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('topic_id', topicId)
    
    const response = await apiClient.post('/pdfs/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }
}

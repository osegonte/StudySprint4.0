// src/lib/api.ts
// This file maintains backward compatibility with existing imports
// while using the new services/api structure

export { 
  apiClient,
  API,
  handleApiError,
  TopicsAPI,
  PDFsAPI,
  StudySessionsAPI,
  GoalsAPI,
  NotesAPI,
  ExercisesAPI,
  AnalyticsAPI
} from '@/services/api';

// Re-export all the types for backward compatibility
export type {
  Topic,
  PDF,
  StudySession,
  Goal,
  Note,
  Exercise
} from '@/services/api';

export default API;
// src/hooks/useApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API, handleApiError } from '@/services/api';
import { toast } from 'sonner';

// Query Keys
export const QUERY_KEYS = {
  TOPICS: 'topics',
  TOPIC: (id: string) => ['topic', id] as const,
  PDFS: 'pdfs',
  PDF: (id: string) => ['pdf', id] as const,
  STUDY_SESSIONS: 'study-sessions',
  CURRENT_SESSION: 'current-session',
  GOALS: 'goals',
  NOTES: 'notes',
  EXERCISES: 'exercises',
  ANALYTICS: 'analytics',
} as const;

// Topics Hooks
export const useTopics = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.TOPICS],
    queryFn: API.topics.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTopic = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.TOPIC(id),
    queryFn: () => API.topics.getById(id),
    enabled: !!id,
  });
};

export const useCreateTopic = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: API.topics.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOPICS] });
      toast.success('Topic created successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useUpdateTopic = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => API.topics.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOPICS] });
      queryClient.setQueryData(QUERY_KEYS.TOPIC(data.id), data);
      toast.success('Topic updated successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useDeleteTopic = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: API.topics.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOPICS] });
      toast.success('Topic deleted successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

// PDFs Hooks
export const usePDFs = (params?: any) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PDFS, params],
    queryFn: () => API.pdfs.getAll(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const usePDF = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.PDF(id),
    queryFn: () => API.pdfs.getById(id),
    enabled: !!id,
  });
};

export const useUploadPDF = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ formData, onProgress }: { formData: FormData; onProgress?: (progress: number) => void }) => 
      API.pdfs.upload(formData, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PDFS] });
      toast.success('PDF uploaded successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

// Study Sessions Hooks
export const useCurrentSession = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.CURRENT_SESSION],
    queryFn: API.sessions.getCurrentSession,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};

export const useStartSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: API.sessions.startSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CURRENT_SESSION] });
      toast.success('Study session started');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useEndSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => API.sessions.endSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CURRENT_SESSION] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDY_SESSIONS] });
      toast.success('Study session completed');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const usePauseSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: API.sessions.pauseSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CURRENT_SESSION] });
      toast.success('Session paused');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useResumeSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: API.sessions.resumeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CURRENT_SESSION] });
      toast.success('Session resumed');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => API.sessions.updateSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CURRENT_SESSION] });
      toast.success('Session updated');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

// Goals Hooks
export const useGoals = (params?: any) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GOALS, params],
    queryFn: () => API.goals.getAll(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: API.goals.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GOALS] });
      toast.success('Goal created successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

// Notes Hooks
export const useNotes = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.NOTES],
    queryFn: API.notes.getAll,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: API.notes.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTES] });
      toast.success('Note created successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

// Exercises Hooks
export const useExercisesAnalytics = (topicId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ANALYTICS, 'exercises', topicId],
    queryFn: ({ queryKey }) => API.exercises.getAnalyticsOverview(queryKey[2]),
    staleTime: 2 * 60 * 1000,
  });
};

// Analytics Hooks
export const useAnalyticsDashboard = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ANALYTICS, 'dashboard'],
    queryFn: API.analytics.getDashboard,
    staleTime: 2 * 60 * 1000,
  });
};

export const useAnalyticsPerformance = (period: 'day' | 'week' | 'month' = 'week') => {
  return useQuery({
    queryKey: [QUERY_KEYS.ANALYTICS, 'performance', period],
    queryFn: () => API.analytics.getPerformance(period),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAnalyticsRealTime = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ANALYTICS, 'real-time'],
    queryFn: API.analytics.getRealTime,
    refetchInterval: 10000, // Refetch every 10 seconds for live updates
    staleTime: 5000,
  });
};

export const useAnalyticsInsights = (limit: number = 10) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ANALYTICS, 'insights', limit],
    queryFn: () => API.analytics.getInsights(limit),
    staleTime: 2 * 60 * 1000,
  });
};
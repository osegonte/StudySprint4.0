// frontend/src/modules/sessions/hooks/index.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  StudySession, 
  StudySessionCreate, 
  StudySessionUpdate, 
  StudySessionEnd,
  PomodoroSession,
  SessionAnalytics,
  TimerState 
} from '../types';
import { sessionService } from '../services';

export const useStudySession = () => {
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load current session on mount
  useEffect(() => {
    loadCurrentSession();
  }, []);

  // Set up WebSocket connection when session is active
  useEffect(() => {
    if (currentSession?.is_active) {
      sessionService.connectToTimer(currentSession.id, (state) => {
        setTimerState(state);
      });

      return () => {
        sessionService.disconnectFromTimer();
      };
    }
  }, [currentSession?.id, currentSession?.is_active]);

  // Activity registration with throttling
  const registerActivity = useCallback(() => {
    if (!currentSession?.is_active) return;

    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }

    activityTimeoutRef.current = setTimeout(() => {
      sessionService.registerActivity(currentSession.id);
    }, 1000); // Throttle to once per second
  }, [currentSession]);

  const loadCurrentSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const session = await sessionService.getCurrentSession();
      setCurrentSession(session);
    } catch (err: any) {
      setError(err.message || 'Failed to load current session');
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (data: StudySessionCreate): Promise<StudySession> => {
    try {
      setLoading(true);
      setError(null);
      const session = await sessionService.startSession(data);
      setCurrentSession(session);
      return session;
    } catch (err: any) {
      setError(err.message || 'Failed to start session');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSession = async (sessionId: string, data: StudySessionUpdate): Promise<StudySession> => {
    try {
      const session = await sessionService.updateSession(sessionId, data);
      setCurrentSession(session);
      return session;
    } catch (err: any) {
      setError(err.message || 'Failed to update session');
      throw err;
    }
  };

  const pauseSession = async (sessionId: string): Promise<StudySession> => {
    try {
      const session = await sessionService.pauseSession(sessionId);
      setCurrentSession(session);
      return session;
    } catch (err: any) {
      setError(err.message || 'Failed to pause session');
      throw err;
    }
  };

  const resumeSession = async (sessionId: string): Promise<StudySession> => {
    try {
      const session = await sessionService.resumeSession(sessionId);
      setCurrentSession(session);
      return session;
    } catch (err: any) {
      setError(err.message || 'Failed to resume session');
      throw err;
    }
  };

  const endSession = async (sessionId: string, data: StudySessionEnd): Promise<StudySession> => {
    try {
      setLoading(true);
      const session = await sessionService.endSession(sessionId, data);
      setCurrentSession(null);
      setTimerState(null);
      sessionService.disconnectFromTimer();
      return session;
    } catch (err: any) {
      setError(err.message || 'Failed to end session');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    currentSession,
    timerState,
    loading,
    error,
    startSession,
    updateSession,
    pauseSession,
    resumeSession,
    endSession,
    registerActivity,
    refetch: loadCurrentSession
  };
};

export const usePomodoroTimer = (sessionId?: string) => {
  const [pomodoroState, setPomodoroState] = useState<{
    id: string;
    cycle_type: string;
    cycle_number: number;
    time_remaining: number;
    is_active: boolean;
  } | null>(null);
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startPomodoro = async (sessionId: string, cycleType: string, duration: number) => {
    try {
      const pomodoro = await sessionService.startPomodoro(sessionId, cycleType, duration);
      
      setPomodoroState({
        id: pomodoro.id,
        cycle_type: cycleType,
        cycle_number: pomodoro.cycle_number,
        time_remaining: duration * 60,
        is_active: true
      });
      setIsPomodoroActive(true);

      // Start countdown timer
      intervalRef.current = setInterval(() => {
        setPomodoroState(prev => {
          if (!prev || prev.time_remaining <= 0) {
            setIsPomodoroActive(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            return null;
          }
          return {
            ...prev,
            time_remaining: prev.time_remaining - 1
          };
        });
      }, 1000);

    } catch (error) {
      console.error('Failed to start pomodoro:', error);
    }
  };

  const completePomodoro = async (pomodoroId: string, data: any) => {
    try {
      await sessionService.completePomodoro(pomodoroId, data);
      setPomodoroState(null);
      setIsPomodoroActive(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } catch (error) {
      console.error('Failed to complete pomodoro:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    pomodoroState,
    isPomodoroActive,
    startPomodoro,
    completePomodoro
  };
};

export const useSessionAnalytics = (topicId?: string, timeRange: 'week' | 'month' | 'quarter' = 'week') => {
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
      }

      const data = await sessionService.getAnalytics(topicId, startDate, endDate);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [topicId, timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
};

export const useSessionHistory = (filters?: any) => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    page_size: 20,
    total_pages: 0
  });

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await sessionService.getSessions(filters);
      setSessions(response.sessions);
      setPagination({
        total: response.total,
        page: response.page,
        page_size: response.page_size,
        total_pages: response.total_pages
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    pagination,
    refetch: fetchSessions
  };
};
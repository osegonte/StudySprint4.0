// frontend/src/modules/sessions/services/index.ts
import axios from 'axios';
import { 
  StudySession, 
  StudySessionCreate, 
  StudySessionUpdate, 
  StudySessionEnd,
  PomodoroSession,
  SessionAnalytics,
  TimerState 
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class SessionService {
  private baseURL = `${API_URL}/api/v1/sessions`;
  private ws: WebSocket | null = null;

  // Study Session Methods
  async startSession(data: StudySessionCreate): Promise<StudySession> {
    const response = await axios.post(`${this.baseURL}/start`, data);
    return response.data;
  }

  async getCurrentSession(): Promise<StudySession | null> {
    try {
      const response = await axios.get(`${this.baseURL}/current`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getSession(id: string): Promise<StudySession> {
    const response = await axios.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  async updateSession(id: string, data: StudySessionUpdate): Promise<StudySession> {
    const response = await axios.put(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  async pauseSession(id: string): Promise<StudySession> {
    const response = await axios.post(`${this.baseURL}/${id}/pause`);
    return response.data;
  }

  async resumeSession(id: string): Promise<StudySession> {
    const response = await axios.post(`${this.baseURL}/${id}/resume`);
    return response.data;
  }

  async endSession(id: string, data: StudySessionEnd): Promise<StudySession> {
    const response = await axios.post(`${this.baseURL}/${id}/end`, data);
    return response.data;
  }

  async getSessions(params?: any): Promise<{
    sessions: StudySession[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  }> {
    const response = await axios.get(this.baseURL, { params });
    return response.data;
  }

  // Pomodoro Methods
  async startPomodoro(sessionId: string, cycleType: string, duration: number): Promise<PomodoroSession> {
    const response = await axios.post(`${this.baseURL}/pomodoro/start`, {
      study_session_id: sessionId,
      cycle_number: 1, // Would need to track this properly
      cycle_type: cycleType,
      planned_duration_minutes: duration
    });
    return response.data;
  }

  async completePomodoro(pomodoroId: string, data: any): Promise<PomodoroSession> {
    const response = await axios.post(`${this.baseURL}/pomodoro/${pomodoroId}/complete`, data);
    return response.data;
  }

  // Analytics Methods
  async getAnalytics(topicId?: string, startDate?: Date, endDate?: Date): Promise<SessionAnalytics> {
    const params: any = {};
    if (topicId) params.topic_id = topicId;
    if (startDate) params.start_date = startDate.toISOString();
    if (endDate) params.end_date = endDate.toISOString();

    const response = await axios.get(`${this.baseURL}/analytics`, { params });
    return response.data;
  }

  // Real-time Timer WebSocket
  connectToTimer(sessionId: string, onTimerUpdate: (state: TimerState) => void): void {
    if (this.ws) {
      this.ws.close();
    }

    const wsUrl = `ws://localhost:8000/api/v1/sessions/ws/timer/${sessionId}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onmessage = (event) => {
      try {
        const timerState = JSON.parse(event.data);
        onTimerUpdate(timerState);
      } catch (error) {
        console.error('Error parsing timer state:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('Timer WebSocket disconnected');
    };
  }

  disconnectFromTimer(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Activity registration (for focus tracking)
  async registerActivity(sessionId: string, activityType: string = 'interaction'): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/${sessionId}/activity`, {
        activity_type: activityType,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Fail silently for activity registration to avoid interrupting user
      console.warn('Failed to register activity:', error);
    }
  }
}

export const sessionService = new SessionService();
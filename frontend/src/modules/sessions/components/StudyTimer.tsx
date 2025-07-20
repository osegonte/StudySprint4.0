// frontend/src/modules/sessions/components/StudyTimer.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useStudySession, usePomodoroTimer } from '../hooks';
import { StudySessionCreate, TimerState } from '../types';

interface StudyTimerProps {
  onSessionStart?: (sessionId: string) => void;
  onSessionEnd?: (sessionId: string) => void;
}

export const StudyTimer: React.FC<StudyTimerProps> = ({ onSessionStart, onSessionEnd }) => {
  const { 
    currentSession, 
    startSession, 
    endSession, 
    pauseSession, 
    resumeSession,
    updateSession,
    timerState,
    loading,
    error 
  } = useStudySession();
  
  const {
    pomodoroState,
    startPomodoro,
    completePomodoro,
    isPomodoroActive
  } = usePomodoroTimer(currentSession?.id);

  const [sessionForm, setSessionForm] = useState<StudySessionCreate>({
    session_type: 'study',
    planned_duration_minutes: 60,
    starting_page: 1,
    goals_set: [],
    environment_type: 'home'
  });

  const [showSessionForm, setShowSessionForm] = useState(false);

  // Format time display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const getProgressPercentage = (): number => {
    if (!currentSession || !timerState) return 0;
    const planned = currentSession.planned_duration_minutes * 60;
    return Math.min(100, (timerState.elapsed_seconds / planned) * 100);
  };

  // Handle session start
  const handleStartSession = async () => {
    try {
      const session = await startSession(sessionForm);
      onSessionStart?.(session.id);
      setShowSessionForm(false);
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  };

  // Handle session end
  const handleEndSession = async () => {
    if (!currentSession) return;
    
    try {
      await endSession(currentSession.id, {
        ending_page: currentSession.ending_page,
        notes: 'Session completed via timer'
      });
      onSessionEnd?.(currentSession.id);
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  };

  // Handle activity registration
  const registerActivity = useCallback(() => {
    if (currentSession && timerState?.is_active) {
      // In a real implementation, this would call the activity registration API
      console.log('Activity registered');
    }
  }, [currentSession, timerState]);

  // Register mouse and keyboard activity
  useEffect(() => {
    const handleActivity = () => registerActivity();
    
    if (currentSession && timerState?.is_active) {
      document.addEventListener('mousemove', handleActivity);
      document.addEventListener('keypress', handleActivity);
      document.addEventListener('click', handleActivity);
      
      return () => {
        document.removeEventListener('mousemove', handleActivity);
        document.removeEventListener('keypress', handleActivity);
        document.removeEventListener('click', handleActivity);
      };
    }
  }, [currentSession, timerState, registerActivity]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Study Timer</h3>
        {currentSession && (
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${timerState?.is_active ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-sm text-gray-600">
              {timerState?.is_active ? 'Active' : 'Paused'}
            </span>
          </div>
        )}
      </div>

      {!currentSession ? (
        // No active session - show start options
        <div className="text-center">
          {!showSessionForm ? (
            <div>
              <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Ready to Study?</h4>
              <p className="text-gray-600 mb-6">Start a focused study session with advanced tracking</p>
              <button
                onClick={() => setShowSessionForm(true)}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Study Session
              </button>
            </div>
          ) : (
            // Session creation form
            <div className="max-w-md mx-auto">
              <h4 className="text-lg font-semibold mb-4">Setup Study Session</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Type
                  </label>
                  <select
                    value={sessionForm.session_type}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, session_type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="study">Study Session</option>
                    <option value="review">Review Session</option>
                    <option value="exercise">Exercise Session</option>
                    <option value="research">Research Session</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Planned Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={sessionForm.planned_duration_minutes}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, planned_duration_minutes: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={5}
                    max={480}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Environment
                  </label>
                  <select
                    value={sessionForm.environment_type || 'home'}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, environment_type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="home">Home</option>
                    <option value="library">Library</option>
                    <option value="cafe">Cafe</option>
                    <option value="office">Office</option>
                    <option value="outdoor">Outdoor</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowSessionForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartSession}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Start Session
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Active session - show timer interface
        <div>
          {/* Timer Display */}
          <div className="text-center mb-8">
            <div className="relative w-48 h-48 mx-auto mb-4">
              {/* Progress Ring */}
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-blue-600"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              
              {/* Timer Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-gray-900">
                  {formatTime(timerState?.elapsed_seconds || 0)}
                </div>
                <div className="text-sm text-gray-500">
                  of {currentSession.planned_duration_minutes}m planned
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {Math.round(getProgressPercentage())}% complete
                </div>
              </div>
            </div>

            {/* Session Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {Math.floor((timerState?.active_seconds || 0) / 60)}m
                  </div>
                  <div className="text-xs text-gray-500">Active</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-orange-600">
                    {Math.floor((timerState?.idle_seconds || 0) / 60)}m
                  </div>
                  <div className="text-xs text-gray-500">Idle</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-blue-600">
                    {Math.round(timerState?.focus_score || 0)}%
                  </div>
                  <div className="text-xs text-gray-500">Focus</div>
                </div>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center space-x-3 mb-6">
            {timerState?.is_active ? (
              <button
                onClick={() => pauseSession(currentSession.id)}
                className="px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
              >
                ⏸️ Pause
              </button>
            ) : (
              <button
                onClick={() => resumeSession(currentSession.id)}
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                ▶️ Resume
              </button>
            )}
            
            <button
              onClick={handleEndSession}
              className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              ⏹️ End Session
            </button>
          </div>

          {/* Pomodoro Integration */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-4">Pomodoro Timer</h4>
            {!isPomodoroActive ? (
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => startPomodoro(currentSession.id, 'work', 25)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                >
                  Start 25m Work
                </button>
                <button
                  onClick={() => startPomodoro(currentSession.id, 'short_break', 5)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  5m Break
                </button>
                <button
                  onClick={() => startPomodoro(currentSession.id, 'long_break', 15)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                >
                  15m Break
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {formatTime(pomodoroState?.time_remaining || 0)}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  {pomodoroState?.cycle_type} - Cycle {pomodoroState?.cycle_number}
                </div>
                <button
                  onClick={() => completePomodoro(pomodoroState?.id!, { effectiveness_rating: 4 })}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Complete Cycle
                </button>
              </div>
            )}
          </div>

          {/* Activity Status */}
          {timerState?.is_idle && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-orange-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-orange-700">
                  No activity detected for {Math.floor((timerState.time_since_activity || 0) / 60)} minutes
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-700 text-sm">{error}</div>
        </div>
      )}
    </div>
  );
};

// src/pages/StudySession.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { 
  Play, 
  Pause, 
  Square, 
  Coffee, 
  BookOpen, 
  Target,
  Clock,
  Brain,
  TrendingUp,
  Settings,
  RotateCcw
} from 'lucide-react';
import { useCurrentSession, useStartSession, useEndSession, usePauseSession, useResumeSession } from '@/hooks/useApi';
import { useTimer } from '@/hooks/useTimer';

const StudySession = () => {
  const [sessionConfig, setSessionConfig] = useState({
    type: 'pomodoro' as 'pomodoro' | 'custom' | 'unlimited',
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    targetDuration: 120
  });

  const { data: currentSession, isLoading: sessionLoading, refetch } = useCurrentSession();
  const startSessionMutation = useStartSession();
  const endSessionMutation = useEndSession();
  const pauseSessionMutation = usePauseSession();
  const resumeSessionMutation = useResumeSession();

  const { time, isRunning, start, pause, stop, reset, formatTime } = useTimer();

  useEffect(() => {
    if (currentSession?.is_active && !isRunning) {
      // Sync timer with active session
      const sessionDuration = Math.floor(currentSession.duration_seconds);
      reset();
      // Note: You might want to set the initial time based on session duration
      start();
    }
  }, [currentSession, isRunning, start, reset]);

  const handleStartSession = async (type: 'pomodoro' | 'custom' | 'unlimited') => {
    try {
      await startSessionMutation.mutateAsync({
        session_type: type,
        planned_duration_minutes: type === 'pomodoro' ? sessionConfig.workMinutes : sessionConfig.targetDuration,
        session_name: `${type.charAt(0).toUpperCase() + type.slice(1)} Session`
      });
      start();
      refetch();
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const handlePauseResume = async () => {
    if (!currentSession) return;

    try {
      if (isRunning) {
        await pauseSessionMutation.mutateAsync(currentSession.id);
        pause();
      } else {
        await resumeSessionMutation.mutateAsync(currentSession.id);
        start();
      }
      refetch();
    } catch (error) {
      console.error('Failed to pause/resume session:', error);
    }
  };

  const handleEndSession = async () => {
    if (!currentSession) return;

    try {
      await endSessionMutation.mutateAsync({
        id: currentSession.id,
        data: {
          notes: 'Session completed'
        }
      });
      stop();
      refetch();
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  if (sessionLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading session..." />
      </div>
    );
  }

  // No active session - show session selection
  if (!currentSession?.is_active) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Start Study Session</h1>
          <p className="text-muted-foreground">
            Choose your study method and begin focusing.
          </p>
        </div>

        {/* Session Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card 
            className="study-card cursor-pointer hover:shadow-lg transition-all" 
            onClick={() => handleStartSession('pomodoro')}
          >
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Pomodoro Timer</h3>
                <p className="text-sm text-muted-foreground">
                  {sessionConfig.workMinutes}min work + {sessionConfig.shortBreakMinutes}min break cycles
                </p>
              </div>
              <Button 
                className="w-full"
                disabled={startSessionMutation.isPending}
              >
                {startSessionMutation.isPending ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Start Pomodoro
              </Button>
            </div>
          </Card>

          <Card 
            className="study-card cursor-pointer hover:shadow-lg transition-all" 
            onClick={() => handleStartSession('custom')}
          >
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-focus/10 rounded-full flex items-center justify-center mx-auto">
                <Target className="h-8 w-8 text-focus" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Custom Timer</h3>
                <p className="text-sm text-muted-foreground">
                  {Math.round(sessionConfig.targetDuration / 60)}h custom session
                </p>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                disabled={startSessionMutation.isPending}
              >
                <Settings className="h-4 w-4 mr-2" />
                Customize & Start
              </Button>
            </div>
          </Card>

          <Card 
            className="study-card cursor-pointer hover:shadow-lg transition-all" 
            onClick={() => handleStartSession('unlimited')}
          >
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="h-8 w-8 text-success" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Free Study</h3>
                <p className="text-sm text-muted-foreground">No timer, just track your progress</p>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                disabled={startSessionMutation.isPending}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Free Study
              </Button>
            </div>
          </Card>
        </div>

        {/* Configuration Options */}
        <Card className="study-card max-w-md mx-auto">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Session Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Work Duration</label>
                <input
                  type="number"
                  value={sessionConfig.workMinutes}
                  onChange={(e) => setSessionConfig(prev => ({ ...prev, workMinutes: parseInt(e.target.value) || 25 }))}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                  min="5"
                  max="60"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Break Duration</label>
                <input
                  type="number"
                  value={sessionConfig.shortBreakMinutes}
                  onChange={(e) => setSessionConfig(prev => ({ ...prev, shortBreakMinutes: parseInt(e.target.value) || 5 }))}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                  min="1"
                  max="30"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Active session - show timer interface
  const getProgressPercentage = () => {
    if (!currentSession) return 0;
    const elapsed = time;
    const planned = currentSession.planned_duration_minutes * 60;
    return Math.min((elapsed / planned) * 100, 100);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="bg-success/10 text-success">
            {currentSession.session_type.charAt(0).toUpperCase() + currentSession.session_type.slice(1)} Session
          </Badge>
          {currentSession.session_type === 'pomodoro' && (
            <Badge variant="outline">
              Cycle 1
            </Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {currentSession.session_name || 'Study Session'}
        </h1>
        <p className="text-muted-foreground">
          Stay focused and track your progress
        </p>
      </div>

      {/* Main Timer */}
      <div className="max-w-2xl mx-auto">
        <Card className="study-card">
          <div className="text-center space-y-6">
            {/* Timer Display */}
            <div className="space-y-4">
              <div className="text-6xl font-mono font-bold text-focus">
                {formatTime()}
              </div>
              <Progress value={getProgressPercentage()} className="w-full h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{Math.floor(time / 60)} / {currentSession.planned_duration_minutes} min</span>
                <span>{Math.round(getProgressPercentage())}% complete</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button 
                onClick={handlePauseResume} 
                className={isRunning ? "bg-warning hover:bg-warning/90" : "gradient-primary"} 
                size="lg"
                disabled={pauseSessionMutation.isPending || resumeSessionMutation.isPending}
              >
                {pauseSessionMutation.isPending || resumeSessionMutation.isPending ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : isRunning ? (
                  <Pause className="h-5 w-5 mr-2" />
                ) : (
                  <Play className="h-5 w-5 mr-2" />
                )}
                {isRunning ? 'Pause' : 'Resume'}
              </Button>
              
              <Button variant="outline" size="lg">
                <Coffee className="h-5 w-5 mr-2" />
                Break
              </Button>
              
              <Button 
                onClick={handleEndSession} 
                variant="destructive" 
                size="lg"
                disabled={endSessionMutation.isPending}
              >
                {endSessionMutation.isPending ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Square className="h-5 w-5 mr-2" />
                )}
                End Session
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Focus Score</p>
            <p className="text-2xl font-bold text-foreground">{currentSession.focus_score || 0}%</p>
          </div>
        </Card>

        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-focus/10 rounded-lg flex items-center justify-center mx-auto">
              <Target className="h-6 w-6 text-focus" />
            </div>
            <p className="text-sm text-muted-foreground">Pages Read</p>
            <p className="text-2xl font-bold text-foreground">{currentSession.pages_visited || 0}</p>
          </div>
        </Card>

        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">Productivity</p>
            <p className="text-2xl font-bold text-foreground">{currentSession.productivity_score || 0}%</p>
          </div>
        </Card>

        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <p className="text-sm text-muted-foreground">Active Time</p>
            <p className="text-2xl font-bold text-foreground">
              {Math.round(currentSession.active_minutes || 0)}m
            </p>
          </div>
        </Card>
      </div>

      {/* Session Info */}
      {currentSession.session_type === 'pomodoro' && (
        <div className="max-w-2xl mx-auto">
          <Card className="study-card">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Pomodoro Progress</h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-3 rounded-full bg-primary" />
                <div className="flex-1 h-3 rounded-full bg-muted" />
                <div className="flex-1 h-3 rounded-full bg-muted" />
                <div className="flex-1 h-3 rounded-full bg-muted" />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Cycle 1 of 4</span>
                <span>3 cycles until long break</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudySession;
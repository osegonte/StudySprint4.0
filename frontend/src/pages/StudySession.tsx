// src/pages/StudySession.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

interface StudySessionState {
  isActive: boolean;
  isPaused: boolean;
  sessionTime: number; // in seconds
  breakTime: number;
  isBreak: boolean;
  sessionType: 'pomodoro' | 'custom' | 'unlimited';
  focusScore: number;
  currentTopic: string;
  targetDuration: number; // in minutes
  pomodoroConfig: {
    workMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    cyclesUntilLongBreak: number;
    currentCycle: number;
  };
}

const StudySession = () => {
  const [session, setSession] = useState<StudySessionState>({
    isActive: false,
    isPaused: false,
    sessionTime: 0,
    breakTime: 0,
    isBreak: false,
    sessionType: 'pomodoro',
    focusScore: 85,
    currentTopic: 'Advanced Calculus',
    targetDuration: 120, // 2 hours
    pomodoroConfig: {
      workMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      cyclesUntilLongBreak: 4,
      currentCycle: 1
    }
  });

  const [showSettings, setShowSettings] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (session.isActive && !session.isPaused) {
      interval = setInterval(() => {
        setSession(prev => ({
          ...prev,
          sessionTime: prev.isBreak ? prev.sessionTime : prev.sessionTime + 1,
          breakTime: prev.isBreak ? prev.breakTime + 1 : prev.breakTime
        }));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [session.isActive, session.isPaused]);

  // Pomodoro timer logic
  useEffect(() => {
    if (session.sessionType === 'pomodoro' && session.isActive && !session.isPaused) {
      const { workMinutes, shortBreakMinutes, longBreakMinutes, cyclesUntilLongBreak, currentCycle } = session.pomodoroConfig;
      
      if (!session.isBreak) {
        // Work session
        if (session.sessionTime >= workMinutes * 60) {
          // Time for break
          const isLongBreak = currentCycle % cyclesUntilLongBreak === 0;
          setSession(prev => ({
            ...prev,
            isBreak: true,
            breakTime: 0,
            sessionTime: 0
          }));
          // You could add notification/sound here
        }
      } else {
        // Break session
        const breakDuration = (session.pomodoroConfig.currentCycle % cyclesUntilLongBreak === 0) 
          ? longBreakMinutes : shortBreakMinutes;
        
        if (session.breakTime >= breakDuration * 60) {
          // Break over, start new work session
          setSession(prev => ({
            ...prev,
            isBreak: false,
            sessionTime: 0,
            breakTime: 0,
            pomodoroConfig: {
              ...prev.pomodoroConfig,
              currentCycle: prev.pomodoroConfig.currentCycle + 1
            }
          }));
        }
      }
    }
  }, [session.sessionTime, session.breakTime, session.sessionType, session.isActive, session.isPaused, session.isBreak]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (session.sessionType === 'pomodoro') {
      if (session.isBreak) {
        const { shortBreakMinutes, longBreakMinutes, cyclesUntilLongBreak, currentCycle } = session.pomodoroConfig;
        const breakDuration = (currentCycle % cyclesUntilLongBreak === 0) ? longBreakMinutes : shortBreakMinutes;
        return Math.min((session.breakTime / (breakDuration * 60)) * 100, 100);
      } else {
        return Math.min((session.sessionTime / (session.pomodoroConfig.workMinutes * 60)) * 100, 100);
      }
    } else {
      const sessionMinutes = session.sessionTime / 60;
      return Math.min((sessionMinutes / session.targetDuration) * 100, 100);
    }
  };

  const handleStart = () => {
    setSession(prev => ({ ...prev, isActive: true, isPaused: false }));
  };

  const handlePause = () => {
    setSession(prev => ({ ...prev, isPaused: true }));
  };

  const handleResume = () => {
    setSession(prev => ({ ...prev, isPaused: false }));
  };

  const handleStop = () => {
    setSession(prev => ({
      ...prev,
      isActive: false,
      isPaused: false,
      sessionTime: 0,
      breakTime: 0,
      isBreak: false,
      pomodoroConfig: {
        ...prev.pomodoroConfig,
        currentCycle: 1
      }
    }));
  };

  const handleSkipBreak = () => {
    setSession(prev => ({
      ...prev,
      isBreak: false,
      breakTime: 0,
      sessionTime: 0
    }));
  };

  const startSession = (type: 'pomodoro' | 'custom' | 'unlimited') => {
    setSession(prev => ({
      ...prev,
      sessionType: type,
      isActive: true,
      isPaused: false,
      sessionTime: 0,
      breakTime: 0,
      isBreak: false
    }));
  };

  if (!session.isActive) {
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
          <Card className="study-card cursor-pointer hover:shadow-lg" onClick={() => startSession('pomodoro')}>
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Pomodoro Timer</h3>
                <p className="text-sm text-muted-foreground">25min work + 5min break cycles</p>
              </div>
              <Button className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Start Pomodoro
              </Button>
            </div>
          </Card>

          <Card className="study-card cursor-pointer hover:shadow-lg" onClick={() => startSession('custom')}>
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-focus/10 rounded-full flex items-center justify-center mx-auto">
                <Target className="h-8 w-8 text-focus" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Custom Timer</h3>
                <p className="text-sm text-muted-foreground">Set your own duration and breaks</p>
              </div>
              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Customize
              </Button>
            </div>
          </Card>

          <Card className="study-card cursor-pointer hover:shadow-lg" onClick={() => startSession('unlimited')}>
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="h-8 w-8 text-success" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Free Study</h3>
                <p className="text-sm text-muted-foreground">No timer, just track your progress</p>
              </div>
              <Button variant="outline" className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Start Free Study
              </Button>
            </div>
          </Card>
        </div>

        {/* Current Topic Selection */}
        <div className="max-w-md mx-auto">
          <Card className="study-card">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Current Topic</h3>
              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{session.currentTopic}</p>
                  <p className="text-sm text-muted-foreground">Last studied: 2 hours ago</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Change Topic
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className={`${session.isBreak ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
            {session.isBreak ? 'Break Time' : 'Study Session'}
          </Badge>
          {session.sessionType === 'pomodoro' && (
            <Badge variant="outline">
              Cycle {session.pomodoroConfig.currentCycle}
            </Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {session.isBreak ? 'Take a Break' : session.currentTopic}
        </h1>
        <p className="text-muted-foreground">
          {session.sessionType === 'pomodoro' && session.isBreak 
            ? (session.pomodoroConfig.currentCycle % session.pomodoroConfig.cyclesUntilLongBreak === 0 
               ? `Long break: ${session.pomodoroConfig.longBreakMinutes} minutes`
               : `Short break: ${session.pomodoroConfig.shortBreakMinutes} minutes`)
            : session.sessionType === 'pomodoro' 
            ? `Work session: ${session.pomodoroConfig.workMinutes} minutes`
            : 'Focus on your studies'
          }
        </p>
      </div>

      {/* Main Timer */}
      <div className="max-w-2xl mx-auto">
        <Card className="study-card">
          <div className="text-center space-y-6">
            {/* Timer Display */}
            <div className="space-y-4">
              <div className={`text-6xl font-mono font-bold ${
                session.isBreak ? 'text-warning' : 'text-focus'
              }`}>
                {formatTime(session.isBreak ? session.breakTime : session.sessionTime)}
              </div>
              <Progress value={getProgressPercentage()} className={`w-full h-3 ${
                session.isBreak ? '[&>div]:bg-warning' : '[&>div]:bg-focus'
              }`} />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {session.sessionType === 'pomodoro' 
                    ? (session.isBreak 
                       ? `Break ${Math.floor(session.breakTime / 60)}/${
                           session.pomodoroConfig.currentCycle % session.pomodoroConfig.cyclesUntilLongBreak === 0 
                           ? session.pomodoroConfig.longBreakMinutes 
                           : session.pomodoroConfig.shortBreakMinutes
                         } min`
                       : `Work ${Math.floor(session.sessionTime / 60)}/${session.pomodoroConfig.workMinutes} min`)
                    : `${Math.round(session.sessionTime / 60)} / ${session.targetDuration} minutes`
                  }
                </span>
                <span>{Math.round(getProgressPercentage())}% complete</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              {session.isPaused ? (
                <Button onClick={handleResume} className="gradient-primary text-white" size="lg">
                  <Play className="h-5 w-5 mr-2" />
                  Resume
                </Button>
              ) : (
                <Button onClick={handlePause} variant="outline" size="lg">
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </Button>
              )}
              
              {session.isBreak ? (
                <Button onClick={handleSkipBreak} variant="outline" size="lg">
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Skip Break
                </Button>
              ) : (
                <Button variant="outline" size="lg">
                  <Coffee className="h-5 w-5 mr-2" />
                  Take Break
                </Button>
              )}
              
              <Button onClick={handleStop} variant="destructive" size="lg">
                <Square className="h-5 w-5 mr-2" />
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
            <p className="text-2xl font-bold text-foreground">{session.focusScore}%</p>
          </div>
        </Card>

        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-focus/10 rounded-lg flex items-center justify-center mx-auto">
              <Target className="h-6 w-6 text-focus" />
            </div>
            <p className="text-sm text-muted-foreground">Pages Read</p>
            <p className="text-2xl font-bold text-foreground">12</p>
          </div>
        </Card>

        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">Productivity</p>
            <p className="text-2xl font-bold text-foreground">High</p>
          </div>
        </Card>

        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <p className="text-sm text-muted-foreground">Total Time</p>
            <p className="text-2xl font-bold text-foreground">
              {formatTime(session.sessionTime + session.breakTime)}
            </p>
          </div>
        </Card>
      </div>

      {/* Quick Tips */}
      {session.isBreak && (
        <div className="max-w-2xl mx-auto">
          <Card className="study-card bg-warning/5 border-warning/20">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Break Time Tips</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Step away from your study area</li>
                <li>• Do some light stretching or movement</li>
                <li>• Hydrate and have a healthy snack</li>
                <li>• Avoid screens if possible</li>
                <li>• Take deep breaths and relax</li>
              </ul>
            </div>
          </Card>
        </div>
      )}

      {/* Pomodoro Progress */}
      {session.sessionType === 'pomodoro' && (
        <div className="max-w-2xl mx-auto">
          <Card className="study-card">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Pomodoro Progress</h3>
              <div className="flex items-center gap-2">
                {Array.from({ length: session.pomodoroConfig.cyclesUntilLongBreak }, (_, i) => {
                  const cycleNumber = i + 1;
                  const isCompleted = cycleNumber < session.pomodoroConfig.currentCycle;
                  const isCurrent = cycleNumber === session.pomodoroConfig.currentCycle;
                  
                  return (
                    <div
                      key={i}
                      className={`flex-1 h-3 rounded-full ${
                        isCompleted 
                          ? 'bg-success' 
                          : isCurrent 
                          ? 'bg-primary' 
                          : 'bg-muted'
                      }`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Cycle {session.pomodoroConfig.currentCycle}</span>
                <span>
                  {session.pomodoroConfig.cyclesUntilLongBreak - (session.pomodoroConfig.currentCycle - 1)} until long break
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudySession;
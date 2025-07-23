// src/pages/Dashboard.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Flame, 
  Brain, 
  Target, 
  Play,
  BookOpen,
  TrendingUp,
  CheckCircle,
  Plus,
  Calendar,
  Award,
  Zap,
  Coffee,
  ChevronRight,
  Star,
  AlertCircle,
  Users,
  Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  // Enhanced mock data with more detail
  const stats = {
    todayStudyTime: 85,
    weeklyStudyTime: 12.5,
    currentStreak: 15,
    bestStreak: 28,
    focusScore: 87,
    activeGoals: 6,
    completedGoals: 18,
    totalXP: 2450,
    level: 12,
    nextLevelXP: 2750
  };

  const quickActions = [
    {
      id: 'continue-session',
      title: 'Continue Last Session',
      description: 'Advanced Calculus - Chapter 12',
      icon: Play,
      color: 'bg-primary',
      action: () => navigate('/study'),
      progress: 68,
      timeLeft: '25 min remaining'
    },
    {
      id: 'start-pomodoro',
      title: 'Start Pomodoro',
      description: '25 min focused session',
      icon: Clock,
      color: 'bg-focus',
      action: () => navigate('/study'),
      highlight: true
    },
    {
      id: 'review-notes',
      title: 'Review Notes',
      description: '3 new highlights to review',
      icon: BookOpen,
      color: 'bg-success',
      action: () => navigate('/notes'),
      count: 3
    },
    {
      id: 'practice-exercises',
      title: 'Practice Exercises',
      description: '5 exercises due today',
      icon: Brain,
      color: 'bg-warning',
      action: () => navigate('/exercises'),
      count: 5,
      urgent: true
    }
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'completion',
      title: 'Completed Chapter 12: Integration Techniques',
      description: 'Mathematics - Advanced Calculus',
      timestamp: '2 hours ago',
      badge: 'Mathematics',
      badgeColor: 'bg-primary',
      xp: 150,
      icon: CheckCircle,
      iconColor: 'text-success'
    },
    {
      id: '2',
      type: 'achievement',
      title: 'Achievement Unlocked: Study Streak Master',
      description: 'Studied for 15 consecutive days',
      timestamp: '3 hours ago',
      badge: 'Achievement',
      badgeColor: 'bg-warning',
      xp: 200,
      icon: Trophy,
      iconColor: 'text-warning'
    },
    {
      id: '3',
      type: 'addition',
      title: 'Added 5 new highlights',
      description: 'Quantum Mechanics Fundamentals',
      timestamp: '4 hours ago',
      badge: 'Physics',
      badgeColor: 'bg-focus',
      xp: 25,
      icon: Plus,
      iconColor: 'text-focus'
    },
    {
      id: '4',
      type: 'goal',
      title: 'Goal milestone reached',
      description: 'Study 20 hours this week - 18/20 completed',
      timestamp: '6 hours ago',
      badge: 'Goal',
      badgeColor: 'bg-accent',
      icon: Target,
      iconColor: 'text-accent'
    },
    {
      id: '5',
      type: 'session',
      title: '2.5 hour study session completed',
      description: 'Focus score: 92% • Productivity: High',
      timestamp: 'Yesterday',
      badge: 'Session',
      badgeColor: 'bg-success',
      xp: 125,
      icon: Clock,
      iconColor: 'text-success'
    }
  ];

  const upcomingTasks = [
    {
      id: '1',
      title: 'Linear Algebra Assignment Due',
      description: 'Chapter 8 exercises',
      dueDate: 'Tomorrow',
      priority: 'high',
      type: 'assignment'
    },
    {
      id: '2',
      title: 'Physics Lab Report',
      description: 'Quantum mechanics experiment',
      dueDate: 'In 3 days',
      priority: 'medium',
      type: 'lab'
    },
    {
      id: '3',
      title: 'Study Group Meeting',
      description: 'Calculus review session',
      dueDate: 'Friday 2:00 PM',
      priority: 'low',
      type: 'meeting'
    }
  ];

  const weeklyProgress = {
    studyGoal: 25,
    currentHours: 18.5,
    dailyGoals: [
      { day: 'Mon', target: 4, actual: 3.5, completed: true },
      { day: 'Tue', target: 3, actual: 3.2, completed: true },
      { day: 'Wed', target: 4, actual: 2.8, completed: false },
      { day: 'Thu', target: 3, actual: 4.1, completed: true },
      { day: 'Fri', target: 4, actual: 2.5, completed: false },
      { day: 'Sat', target: 4, actual: 2.4, completed: false },
      { day: 'Sun', target: 3, actual: 0, completed: false }
    ]
  };

  const progressPercentage = (weeklyProgress.currentHours / weeklyProgress.studyGoal) * 100;
  const levelProgress = ((stats.totalXP - (stats.level - 1) * 250) / 250) * 100;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-destructive bg-destructive/5';
      case 'medium': return 'border-l-warning bg-warning/5';
      case 'low': return 'border-l-success bg-success/5';
      default: return 'border-l-muted';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment': return BookOpen;
      case 'lab': return Brain;
      case 'meeting': return Users;
      default: return Calendar;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Enhanced Header with Level Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">Good afternoon! 👋</h1>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-warning" />
                <span className="font-semibold text-foreground">Level {stats.level}</span>
              </div>
            </div>
            <p className="text-muted-foreground">
              You're making great progress! Keep up the momentum.
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-warning" />
              <span className="text-sm text-muted-foreground">
                {stats.totalXP} / {stats.nextLevelXP} XP
              </span>
            </div>
            <Progress value={levelProgress} className="w-32 h-2" />
          </div>
        </div>

        {/* Daily Streak Banner */}
        <Card className="study-card bg-gradient-to-r from-warning/10 to-success/10 border-warning/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center">
                <Flame className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  🔥 {stats.currentStreak} Day Streak!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Personal best: {stats.bestStreak} days • You're on fire!
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Share Achievement
            </Button>
          </div>
        </Card>
      </div>

      {/* Enhanced Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="study-card text-center hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-focus/10 rounded-lg flex items-center justify-center mx-auto">
              <Clock className="h-6 w-6 text-focus" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.todayStudyTime}min</p>
              <p className="text-xs text-muted-foreground">Today</p>
            </div>
          </div>
        </Card>

        <Card className="study-card text-center hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.weeklyStudyTime}h</p>
              <p className="text-xs text-muted-foreground">This Week</p>
            </div>
          </div>
        </Card>

        <Card className="study-card text-center hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto">
              <Brain className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.focusScore}%</p>
              <p className="text-xs text-muted-foreground">Focus Score</p>
            </div>
          </div>
        </Card>

        <Card className="study-card text-center hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
              <Target className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.activeGoals}</p>
              <p className="text-xs text-muted-foreground">Active Goals</p>
            </div>
          </div>
        </Card>

        <Card className="study-card text-center hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto">
              <Trophy className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.completedGoals}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>

        <Card className="study-card text-center hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mx-auto">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalXP}</p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="study-card">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
              
              <div className="space-y-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <div
                      key={action.id}
                      onClick={action.action}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        action.highlight ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground">{action.title}</h4>
                            {action.urgent && (
                              <AlertCircle className="h-4 w-4 text-destructive" />
                            )}
                            {action.count && (
                              <Badge variant="outline" className="text-xs">
                                {action.count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                          {action.progress && (
                            <div className="mt-2">
                              <Progress value={action.progress} className="h-1" />
                              <p className="text-xs text-muted-foreground mt-1">{action.timeLeft}</p>
                            </div>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Upcoming Tasks */}
          <Card className="study-card">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Upcoming</h3>
                <Button variant="outline" size="sm">View All</Button>
              </div>
              
              <div className="space-y-3">
                {upcomingTasks.map((task) => {
                  const Icon = getTypeIcon(task.type);
                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-lg border-l-4 ${getPriorityColor(task.priority)}`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-foreground">{task.title}</h4>
                          <p className="text-xs text-muted-foreground">{task.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">Due: {task.dueDate}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Activity Feed & Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Progress */}
          <Card className="study-card">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Weekly Progress</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span>+12% from last week</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {weeklyProgress.currentHours}h / {weeklyProgress.studyGoal}h
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {Math.round(progressPercentage)}% complete
                  </span>
                </div>
                <Progress value={progressPercentage} className="w-full h-3" />
                
                <div className="grid grid-cols-7 gap-2">
                  {weeklyProgress.dailyGoals.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">{day.day}</div>
                      <div className={`w-full h-8 rounded flex items-center justify-center text-xs font-medium ${
                        day.completed 
                          ? 'bg-success text-success-foreground' 
                          : day.actual > 0 
                          ? 'bg-warning text-warning-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {day.actual}h
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Enhanced Recent Activity */}
          <Card className="study-card">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
                <Button variant="outline" size="sm">View All</Button>
              </div>
              
              <div className="space-y-3">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-secondary ${activity.iconColor}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{activity.title}</p>
                          {activity.xp && (
                            <Badge variant="outline" className="text-xs">
                              +{activity.xp} XP
                            </Badge>
                          )}
                        </div>
                        {activity.description && (
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                          {activity.badge && (
                            <Badge variant="outline" className={`text-xs ${activity.badgeColor} text-white`}>
                              {activity.badge}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
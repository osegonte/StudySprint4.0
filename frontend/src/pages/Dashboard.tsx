// src/pages/Dashboard.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { 
  Clock, 
  Brain, 
  Target, 
  Play,
  BookOpen,
  TrendingUp,
  Plus,
  Star,
  GraduationCap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAnalyticsDashboard, useCurrentSession } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useAnalyticsDashboard();
  const { data: currentSession, isLoading: sessionLoading } = useCurrentSession();

  if (analyticsLoading || sessionLoading || authLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="p-6">
        <EmptyState
          title="Unable to load dashboard"
          description="We're having trouble connecting to your data. Please try refreshing the page."
          icon={<TrendingUp className="h-12 w-12" />}
          action={{
            label: "Refresh",
            onClick: () => window.location.reload()
          }}
        />
      </div>
    );
  }

  const quickActions = [
    {
      id: 'start-session',
      title: currentSession ? 'Continue Session' : 'Start Study Session',
      description: currentSession ? `${currentSession.session_name || 'Active session'} - ${Math.floor(currentSession.total_minutes)}min` : 'Begin a focused study session',
      icon: currentSession ? Play : Clock,
      color: 'bg-primary',
      action: () => navigate('/study'),
      highlight: !!currentSession
    },
    {
      id: 'browse-topics',
      title: 'Browse Topics',
      description: 'Explore your study subjects',
      icon: BookOpen,
      color: 'bg-focus',
      action: () => navigate('/topics')
    },
    {
      id: 'pdf-library',
      title: 'PDF Library',
      description: 'Access your study materials',
      icon: GraduationCap,
      color: 'bg-success',
      action: () => navigate('/pdfs')
    },
    {
      id: 'set-goals',
      title: 'Set Goals',  
      description: 'Track your progress',
      icon: Target,
      color: 'bg-warning',
      action: () => navigate('/goals')
    }
  ];

  // Extract data with fallbacks
  const stats = {
    todayStudyTime: analytics?.quick_stats?.today_study_time || 0,
    weeklyStudyTime: Math.round((analytics?.overview?.study?.weekly_study_hours?.reduce((a: number, b: number) => a + b, 0) || 0) / 60),
    focusScore: analytics?.overview?.study?.avg_focus_score || 0,
    activeGoals: analytics?.overview?.goals?.active_goals || 0,
    completedGoals: analytics?.overview?.goals?.completed_goals || 0,
    totalXP: analytics?.overview?.goals?.total_xp || 0,
    currentStreak: analytics?.quick_stats?.current_streak || 0
  };

  // Check if user has any meaningful data
  const hasData = stats.todayStudyTime > 0 || stats.weeklyStudyTime > 0 || stats.activeGoals > 0 || analytics?.insights?.length > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">
                Welcome to StudySprint! 👋
              </h1>
              {user?.level && (
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-warning" />
                  <span className="font-semibold text-foreground">Level {user.level}</span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground">
              {hasData 
                ? (analytics?.insights?.[0] || "Ready to continue your learning journey?")
                : "Get started by creating your first topic or uploading a PDF to begin studying."
              }
            </p>
          </div>
          {user?.xp && user?.level && (
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-muted-foreground">
                  {user.xp} / {(user.level * 250)} XP
                </span>
              </div>
              <Progress value={(user.xp % 250) / 250 * 100} className="w-32 h-2" />
            </div>
          )}
        </div>

        {/* Current Session Banner */}
        {currentSession && (
          <Card className="study-card bg-gradient-to-r from-primary/10 to-focus/10 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Play className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Session in Progress
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentSession.session_name || 'Study Session'} • {Math.floor(currentSession.total_minutes)} minutes
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate('/study')}>
                Continue Session
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Quick Stats - Only show if there's meaningful data */}
      {hasData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.weeklyStudyTime}h</p>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
            </div>
          </Card>

          {stats.focusScore > 0 && (
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
          )}

          {stats.activeGoals > 0 && (
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
          )}

          {/* Show additional stats only if data exists */}
          {stats.completedGoals > 0 && (
            <Card className="study-card text-center hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto">
                  <Star className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.completedGoals}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </Card>
          )}

          {stats.totalXP > 0 && (
            <Card className="study-card text-center hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mx-auto">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalXP}</p>
                  <p className="text-xs text-muted-foreground">Total XP</p>
                </div>
              </div>
            </Card>
          )}

          {stats.currentStreak > 0 && (
            <Card className="study-card text-center hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-xl">🔥</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.currentStreak}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.id}
                onClick={action.action}
                className={`study-card cursor-pointer transition-all hover:shadow-lg ${
                  action.highlight ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity - Only show if data exists */}
      {hasData && analytics?.insights?.length > 0 && (
        <Card className="study-card">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Insights</h3>
            <div className="space-y-3">
              {analytics.insights.slice(0, 3).map((insight: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <p className="text-sm text-foreground">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Getting Started Section for new users */}
      {!hasData && (
        <Card className="study-card">
          <EmptyState
            title="Welcome to StudySprint 4.0!"
            description="Start your learning journey by creating your first topic or uploading a PDF. Track your progress, set goals, and build effective study habits."
            icon={<GraduationCap className="h-12 w-12" />}
            action={{
              label: "Create Your First Topic",
              onClick: () => navigate('/topics')
            }}
          />
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
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
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  // Mock data - replace with real API calls
  const stats = {
    todayStudyTime: 85,
    currentStreak: 15,
    focusScore: 87,
    activeGoals: 6
  };

  const recentActivity = [
    {
      id: '1',
      type: 'completion',
      title: 'Completed Chapter 12: Integration Techniques',
      description: 'Mathematics - Advanced Calculus',
      timestamp: '2 hours ago',
      badge: 'Mathematics'
    },
    {
      id: '2',
      type: 'addition',
      title: 'Added 5 new highlights',
      description: 'Quantum Mechanics Fundamentals',
      timestamp: '4 hours ago',
      badge: 'Physics'
    },
    {
      id: '3',
      type: 'goal',
      title: 'Goal milestone reached',
      description: 'Study 20 hours this week - 18/20 completed',
      timestamp: '6 hours ago'
    },
    {
      id: '4',
      type: 'session',
      title: '2.5 hour study session completed',
      description: 'Focus score: 92% • Productivity: High',
      timestamp: 'Yesterday'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completion':
        return CheckCircle;
      case 'addition':
        return Plus;
      case 'goal':
        return Target;
      case 'session':
        return Clock;
      default:
        return BookOpen;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'completion':
        return 'text-success';
      case 'addition':
        return 'text-primary';
      case 'goal':
        return 'text-warning';
      case 'session':
        return 'text-focus';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your study progress overview.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-focus/10">
              <Clock className="h-6 w-6 text-focus" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today's Study Time</p>
              <p className="text-2xl font-bold text-foreground">{stats.todayStudyTime}min</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-warning/10">
              <Flame className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-bold text-foreground">{stats.currentStreak} days</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Focus Score</p>
              <p className="text-2xl font-bold text-foreground">{stats.focusScore}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-success/10">
              <Target className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Goals</p>
              <p className="text-2xl font-bold text-foreground">{stats.activeGoals}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Session Quick Start */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Study Session</h3>
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={() => navigate('/study')} 
                className="w-full bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
              >
                <Play className="h-4 w-4 mr-2" />
                Start New Session
              </Button>
              <Button variant="outline" className="w-full">
                <BookOpen className="h-4 w-4 mr-2" />
                Resume Last: Advanced Calculus
              </Button>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
            
            <div className="space-y-3">
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const iconColor = getActivityColor(activity.type);
                
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-secondary ${iconColor}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      {activity.description && (
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                        {activity.badge && (
                          <Badge variant="outline" className="text-xs">
                            {activity.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-border">
              <button className="text-sm text-primary hover:text-primary/80 transition-colors">
                View all activity →
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Charts */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Progress Overview</h3>
          
          {/* Simple Progress Chart */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weekly Study Hours</p>
                <p className="text-2xl font-bold text-foreground">22.5h</p>
              </div>
              <div className="flex items-center gap-1 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                <span>+12%</span>
              </div>
            </div>
            
            <Progress value={75} className="w-full h-2" />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Goal: 30h/week</span>
              <span>75% complete</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
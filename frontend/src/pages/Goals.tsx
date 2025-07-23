// src/pages/Goals.tsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { 
  Plus, 
  Target, 
  Calendar, 
  Clock,
  CheckCircle,
  TrendingUp,
  Trophy,
  Star,
  Award,
  MoreVertical
} from 'lucide-react';
import { useGoals, useCreateGoal } from '@/hooks/useApi';

const Goals = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: goalsData, isLoading, error, refetch } = useGoals({
    status_filter: filter === 'all' ? undefined : filter
  });
  const createGoalMutation = useCreateGoal();

  const goals = goalsData?.goals || [];
  const summary = goalsData?.summary || {
    total_goals: 0,
    active_goals: 0,
    completed_goals: 0,
    total_xp_earned: 0,
    completion_rate: 0
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'overdue':
        return 'bg-destructive text-destructive-foreground';
      case 'active':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return 'border-l-destructive';
      case 'medium':
        return 'border-l-warning';
      case 'low':
        return 'border-l-success';
      default:
        return 'border-l-muted';
    }
  };

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading your goals..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <EmptyState
          title="Unable to load goals"
          description="We're having trouble connecting to your data. Please try refreshing the page."
          icon={<Target className="h-12 w-12" />}
          action={{
            label: "Retry",
            onClick: () => refetch()
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Goals & Progress</h1>
          <p className="text-muted-foreground">
            Track your achievements and stay motivated
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)} 
          className="gradient-primary text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Stats Overview - Only show if goals exist */}
      {goals.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="study-card text-center">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  disabled={createGoalMutation.isPending}
                >
                  {createGoalMutation.isPending ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : null}
                  Create Goal
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Goals;w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{summary.total_goals}</p>
              <p className="text-xs text-muted-foreground">Total Goals</p>
            </div>
          </Card>
          <Card className="study-card text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center mx-auto">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <p className="text-2xl font-bold text-foreground">{summary.active_goals}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </Card>
          <Card className="study-card text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mx-auto">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <p className="text-2xl font-bold text-foreground">{summary.completed_goals}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </Card>
          <Card className="study-card text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mx-auto">
                <Award className="h-5 w-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground">{summary.total_xp_earned}</p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
          </Card>
          <Card className="study-card text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">{Math.round(summary.completion_rate)}%</p>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </div>
          </Card>
        </div>
      )}

      {/* Filter Tabs - Only show if goals exist */}
      {goals.length > 0 && (
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All Goals
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
          >
            Active ({summary.active_goals})
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilter('completed')}
          >
            Completed ({summary.completed_goals})
          </Button>
        </div>
      )}

      {/* Goals List */}
      {goals.length > 0 ? (
        <div className="space-y-4">
          {goals.map((goal) => (
            <Card key={goal.id} className={`study-card border-l-4 ${getPriorityColor(goal.priority)}`}>
              <div className="space-y-4">
                {/* Goal Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(goal.status)}>
                      {goal.status}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {goal.current_value} / {goal.target_value}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Award className="h-3 w-3" />
                        <span>{goal.xp_reward} XP</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{Math.round(goal.progress_percentage)}%</span>
                  </div>
                  <Progress value={goal.progress_percentage} className="w-full h-3" />
                </div>

                {/* Goal Details */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDeadline(goal.target_date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{goal.streak_count} day streak</span>
                    </div>
                  </div>
                  {goal.status === 'active' && (
                    <Button variant="outline" size="sm">
                      Update Progress
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        // Empty State
        <EmptyState
          title="No goals yet"
          description="Create your first goal to start tracking your progress and achievements."
          icon={<Target className="h-12 w-12" />}
          action={{
            label: "Create Your First Goal",
            onClick: () => setShowCreateForm(true)
          }}
        />
      )}

      {/* Create Goal Form Modal - Simple version */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Create New Goal</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Goal Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Complete Calculus Course"
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">Goal Type</label>
                  <select className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background">
                    <option value="study_time">Study Time</option>
                    <option value="completion">Course Completion</option>
                    <option value="skill_based">Skill Development</option>
                    <option value="habit">Daily Habit</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Target</label>
                    <input
                      type="number"
                      placeholder="100"
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Deadline</label>
                    <input
                      type="date"
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                    />
                  </div>
                </div>
              </div>
              
              <div className="
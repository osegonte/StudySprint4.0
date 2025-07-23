// src/pages/Exercises.tsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { 
  Brain, 
  Clock, 
  Target, 
  Zap, 
  BookOpen,
  CheckCircle,
  TrendingUp,
  Award,
  Play,
  Plus
} from 'lucide-react';
import { useExercisesAnalytics } from '@/hooks/useApi';

const Exercises = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  
  const { data: analytics, isLoading, error } = useExercisesAnalytics();

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading exercises..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <EmptyState
          title="Unable to load exercises"
          description="We're having trouble connecting to your data. Please try refreshing the page."
          icon={<Brain className="h-12 w-12" />}
          action={{
            label: "Retry",
            onClick: () => window.location.reload()
          }}
        />
      </div>
    );
  }

  // Show empty state if no exercises exist
  if (!analytics || analytics.total_exercises === 0) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Exercise Center</h1>
          <p className="text-muted-foreground">
            Practice problems with spaced repetition and performance tracking
          </p>
        </div>

        <EmptyState
          title="No exercises yet"
          description="Start by creating topics and adding study materials. Exercises will be generated automatically from your content."
          icon={<Brain className="h-12 w-12" />}
          action={{
            label: "Explore Topics",
            onClick: () => window.location.href = '/topics'
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Exercise Center</h1>
        <p className="text-muted-foreground">
          Practice problems with spaced repetition and performance tracking
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center mx-auto">
              <Target className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-xl font-bold text-foreground">{analytics.exercises_due || 0}</p>
            <p className="text-xs text-muted-foreground">Due Today</p>
          </div>
        </Card>
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center mx-auto">
              <TrendingUp className="h-5 w-5 text-warning" />
            </div>
            <p className="text-xl font-bold text-foreground">{analytics.total_exercises}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </Card>
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mx-auto">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <p className="text-xl font-bold text-foreground">{Math.round(analytics.completion_rate || 0)}%</p>
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </div>
        </Card>
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Award className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xl font-bold text-foreground">{Math.round(analytics.average_score || 0)}%</p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="study-card cursor-pointer hover:shadow-lg transition-all">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Quick Practice</h3>
                <p className="text-sm text-muted-foreground">5-minute focused session</p>
              </div>
            </div>
            <Button className="w-full" disabled={analytics.exercises_due === 0}>
              <Play className="h-4 w-4 mr-2" />
              {analytics.exercises_due > 0 ? 'Start Practice' : 'No Exercises Due'}
            </Button>
          </div>
        </Card>

        <Card className="study-card cursor-pointer hover:shadow-lg transition-all">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-focus/10 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-focus" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Topic Review</h3>
                <p className="text-sm text-muted-foreground">Focused topic practice</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Choose Topic
            </Button>
          </div>
        </Card>

        <Card className="study-card cursor-pointer hover:shadow-lg transition-all">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Challenge Mode</h3>
                <p className="text-sm text-muted-foreground">Harder problems</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Start Challenge
            </Button>
          </div>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card className="study-card">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Performance Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Progress Chart Area */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Weekly Progress</h4>
              <div className="h-32 bg-muted/20 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground text-sm">
                  Progress chart will appear when you complete exercises
                </p>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Study Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Spent</span>
                  <span className="font-medium text-foreground">
                    {Math.round((analytics.time_spent || 0) / 60)} hours
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exercises Completed</span>
                  <span className="font-medium text-foreground">{analytics.exercises_completed || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Improvement Trend</span>
                  <Badge variant="outline" className="text-success">
                    {analytics.improvement_trend || 'Stable'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Study Recommendations */}
      <Card className="study-card">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Recommendations</h3>
          
          {analytics.exercises_due > 0 ? (
            <div className="space-y-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-foreground">
                  🎯 You have {analytics.exercises_due} exercises due today. Complete them to maintain your learning momentum.
                </p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <p className="text-sm text-foreground">
                  📈 Your success rate is {Math.round(analytics.completion_rate || 0)}%. Keep practicing to improve!
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Great job! No exercises are due today. Check back tomorrow or explore other study materials.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Exercises;
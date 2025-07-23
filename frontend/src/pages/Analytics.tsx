// src/pages/Analytics.tsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Brain,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  BookOpen,
  Star
} from 'lucide-react';
import { useAnalyticsDashboard, useAnalyticsPerformance } from '@/hooks/useApi';

// Create a simple tabs implementation since we don't have it yet
const TabsList: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`flex bg-muted rounded-lg p-1 ${className}`}>{children}</div>
);

const TabsTrigger: React.FC<{ value: string; children: React.ReactNode; isActive?: boolean; onClick?: () => void }> = ({ 
  children, 
  isActive, 
  onClick 
}) => (
  <button
    onClick={onClick}
    className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
      isActive 
        ? 'bg-background text-foreground shadow-sm' 
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    {children}
  </button>
);

const TabsContent: React.FC<{ value: string; activeTab: string; children: React.ReactNode; className?: string }> = ({ 
  value, 
  activeTab, 
  children, 
  className 
}) => {
  if (value !== activeTab) return null;
  return <div className={className}>{children}</div>;
};

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: analytics, isLoading, error } = useAnalyticsDashboard();
  const { data: performance } = useAnalyticsPerformance(timeRange as 'day' | 'week' | 'month');

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <EmptyState
          title="Unable to load analytics"
          description="We're having trouble connecting to your data. Please try refreshing the page."
          icon={<BarChart3 className="h-12 w-12" />}
          action={{
            label: "Refresh",
            onClick: () => window.location.reload()
          }}
        />
      </div>
    );
  }

  // Extract analytics data with safe fallbacks
  const overviewStats = analytics?.overview ? {
    totalStudyTime: Math.round((analytics.overview.study?.total_study_time_minutes || 0) / 60 * 10) / 10,
    avgSessionLength: analytics.overview.study?.total_sessions > 0 
      ? Math.round((analytics.overview.study.total_study_time_minutes || 0) / analytics.overview.study.total_sessions)
      : 0,
    focusScore: Math.round(analytics.overview.study?.avg_focus_score || 0),
    goalsCompleted: analytics.overview.goals?.completed_goals || 0,
    totalSessions: analytics.overview.study?.total_sessions || 0,
    streak: analytics.quick_stats?.current_streak || 0
  } : {
    totalStudyTime: 0,
    avgSessionLength: 0,
    focusScore: 0,
    goalsCompleted: 0,
    totalSessions: 0,
    streak: 0
  };

  // Check if user has any meaningful data
  const hasData = overviewStats.totalStudyTime > 0 || overviewStats.totalSessions > 0 || overviewStats.goalsCompleted > 0;

  // Simple chart component for when we have data
  const SimpleBarChart: React.FC<{ data: any[], dataKey: string, color: string, label: string }> = ({ 
    data, 
    dataKey, 
    color,
    label 
  }) => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          <p className="text-sm">No data available for {label}</p>
        </div>
      );
    }

    const max = Math.max(...data.map(d => d[dataKey] || 0));
    
    return (
      <div className="flex items-end gap-2 h-32">
        {data.map((item, index) => {
          const height = max > 0 ? (item[dataKey] / max) * 100 : 0;
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div
                className={`w-full ${color} rounded-sm transition-all duration-300 hover:opacity-80`}
                style={{ height: `${height}%` }}
                title={`${item.day || item.label}: ${item[dataKey] || 0}`}
              />
              <span className="text-xs text-muted-foreground">
                {item.day || item.label || `Day ${index + 1}`}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            {hasData 
              ? "Insights into your study patterns and performance"
              : "Start studying to see your analytics and insights here"
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={!hasData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" disabled={!hasData}>
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
        </div>
      </div>

      {/* Show analytics if we have data, otherwise show getting started */}
      {hasData ? (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="study-card text-center">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-focus/10 rounded-lg flex items-center justify-center mx-auto">
                  <Clock className="h-5 w-5 text-focus" />
                </div>
                <p className="text-xl font-bold text-foreground">{overviewStats.totalStudyTime}h</p>
                <p className="text-xs text-muted-foreground">Total Study Time</p>
              </div>
            </Card>
            
            <Card className="study-card text-center">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xl font-bold text-foreground">{overviewStats.avgSessionLength}min</p>
                <p className="text-xs text-muted-foreground">Avg Session</p>
              </div>
            </Card>

            {overviewStats.focusScore > 0 && (
              <Card className="study-card text-center">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mx-auto">
                    <Brain className="h-5 w-5 text-success" />
                  </div>
                  <p className="text-xl font-bold text-foreground">{overviewStats.focusScore}%</p>
                  <p className="text-xs text-muted-foreground">Focus Score</p>
                </div>
              </Card>
            )}

            {overviewStats.goalsCompleted > 0 && (
              <Card className="study-card text-center">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center mx-auto">
                    <Target className="h-5 w-5 text-warning" />
                  </div>
                  <p className="text-xl font-bold text-foreground">{overviewStats.goalsCompleted}</p>
                  <p className="text-xs text-muted-foreground">Goals Done</p>
                </div>
              </Card>
            )}

            <Card className="study-card text-center">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                  <PieChart className="h-5 w-5 text-accent" />
                </div>
                <p className="text-xl font-bold text-foreground">{overviewStats.totalSessions}</p>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
            </Card>

            {overviewStats.streak > 0 && (
              <Card className="study-card text-center">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-xl">🔥</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{overviewStats.streak}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </Card>
            )}
          </div>

          {/* Main Analytics */}
          <div className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger 
                value="overview" 
                isActive={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="topics" 
                isActive={activeTab === 'topics'}
                onClick={() => setActiveTab('topics')}
              >
                Topics
              </TabsTrigger>
              <TabsTrigger 
                value="patterns" 
                isActive={activeTab === 'patterns'}
                onClick={() => setActiveTab('patterns')}
              >
                Patterns
              </TabsTrigger>
              <TabsTrigger 
                value="progress" 
                isActive={activeTab === 'progress'}
                onClick={() => setActiveTab('progress')}
              >
                Progress
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" activeTab={activeTab} className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Study Time Chart */}
                <Card className="study-card">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Recent Study Activity</h3>
                    <SimpleBarChart 
                      data={performance?.time_data?.study_minutes ? 
                        performance.time_data.labels.map((label: string, index: number) => ({
                          day: label,
                          hours: performance.time_data.study_minutes[index] / 60
                        })) : []
                      }
                      dataKey="hours" 
                      color="bg-focus" 
                      label="study time"
                    />
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        {performance?.time_data?.study_minutes ? 
                          `Total: ${Math.round(performance.time_data.study_minutes.reduce((a: number, b: number) => a + b, 0) / 60 * 10) / 10} hours this ${timeRange}` :
                          "No study data available"
                        }
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Focus Score Chart */}
                <Card className="study-card">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Focus Trends</h3>
                    <SimpleBarChart 
                      data={performance?.time_data?.focus_scores ? 
                        performance.time_data.labels.map((label: string, index: number) => ({
                          day: label,
                          focus: performance.time_data.focus_scores[index]
                        })) : []
                      }
                      dataKey="focus" 
                      color="bg-primary" 
                      label="focus score"
                    />
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        {performance?.time_data?.focus_scores ? 
                          `Average: ${Math.round(performance.time_data.focus_scores.reduce((a: number, b: number) => a + b, 0) / performance.time_data.focus_scores.length)}% this ${timeRange}` :
                          "No focus data available"
                        }
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="topics" activeTab={activeTab} className="space-y-6 mt-6">
              <Card className="study-card">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Topic Performance</h3>
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Create topics and start studying to see topic-specific analytics here.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="patterns" activeTab={activeTab} className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="study-card">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Study Patterns</h3>
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Complete more study sessions to identify your patterns and optimal study times.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="study-card">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Recommendations</h3>
                    <div className="space-y-3">
                      {analytics?.insights && analytics.insights.length > 0 ? (
                        analytics.insights.slice(0, 3).map((insight: string, index: number) => (
                          <div key={index} className="p-3 bg-primary/10 rounded-lg">
                            <p className="text-sm text-foreground">{insight}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <Star className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Keep studying to unlock personalized recommendations!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="progress" activeTab={activeTab} className="space-y-6 mt-6">
              <Card className="study-card">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Long-term Progress</h3>
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Continue studying to build your progress history and track long-term trends.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </div>
        </>
      ) : (
        // Empty State for new users
        <div className="space-y-6">
          <EmptyState
            title="No analytics data yet"
            description="Start your first study session to begin tracking your progress and performance."
            icon={<BarChart3 className="h-12 w-12" />}
            action={{
              label: "Start Studying",
              onClick: () => window.location.href = '/study'
            }}
          />
          
          {/* Preview of what analytics will look like */}
          <Card className="study-card">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">What you'll see here</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-50">
                <div className="text-center p-4 border border-dashed border-border rounded-lg">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">Study Time Tracking</p>
                  <p className="text-xs text-muted-foreground">Daily and weekly patterns</p>
                </div>
                <div className="text-center p-4 border border-dashed border-border rounded-lg">
                  <Brain className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">Focus Analysis</p>
                  <p className="text-xs text-muted-foreground">Concentration trends</p>
                </div>
                <div className="text-center p-4 border border-dashed border-border rounded-lg">
                  <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">Goal Progress</p>
                  <p className="text-xs text-muted-foreground">Achievement tracking</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Analytics;
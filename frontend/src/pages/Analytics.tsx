// src/pages/Analytics.tsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Brain,
  Calendar,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react';

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

  // Mock analytics data
  const overviewStats = {
    totalStudyTime: 47.5,
    avgSessionLength: 85,
    focusScore: 87,
    goalsCompleted: 12,
    totalSessions: 34,
    streak: 15
  };

  const topicsData = [
    { topic: 'Advanced Calculus', hours: 18.5, sessions: 12, avgFocus: 92 },
    { topic: 'Quantum Physics', hours: 15.2, sessions: 10, avgFocus: 85 },
    { topic: 'Organic Chemistry', hours: 9.8, sessions: 8, avgFocus: 78 },
    { topic: 'Linear Algebra', hours: 4.0, sessions: 4, avgFocus: 95 }
  ];

  const studyPatterns = {
    bestTime: '2:00 PM - 4:00 PM',
    mostProductive: 'Afternoon',
    avgSessionRating: 4.2,
    topEnvironment: 'Library'
  };

  const weeklyData = [
    { day: 'Mon', hours: 2.5, focus: 85 },
    { day: 'Tue', hours: 3.2, focus: 88 },
    { day: 'Wed', hours: 1.8, focus: 82 },
    { day: 'Thu', hours: 2.8, focus: 91 },
    { day: 'Fri', hours: 3.5, focus: 87 },
    { day: 'Sat', hours: 4.2, focus: 94 },
    { day: 'Sun', hours: 2.1, focus: 79 }
  ];

  const SimpleBarChart: React.FC<{ data: any[], dataKey: string, color: string }> = ({ 
    data, 
    dataKey, 
    color 
  }) => {
    const max = Math.max(...data.map(d => d[dataKey]));
    
    return (
      <div className="flex items-end gap-2 h-32">
        {data.map((item, index) => {
          const height = (item[dataKey] / max) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div
                className={`w-full ${color} rounded-sm transition-all duration-300 hover:opacity-80`}
                style={{ height: `${height}%` }}
                title={`${item.day}: ${item[dataKey]}`}
              />
              <span className="text-xs text-muted-foreground">{item.day}</span>
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
            Insights into your study patterns and performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
        </div>
      </div>

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
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mx-auto">
              <Brain className="h-5 w-5 text-success" />
            </div>
            <p className="text-xl font-bold text-foreground">{overviewStats.focusScore}%</p>
            <p className="text-xs text-muted-foreground">Focus Score</p>
          </div>
        </Card>
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center mx-auto">
              <Target className="h-5 w-5 text-warning" />
            </div>
            <p className="text-xl font-bold text-foreground">{overviewStats.goalsCompleted}</p>
            <p className="text-xs text-muted-foreground">Goals Done</p>
          </div>
        </Card>
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
              <PieChart className="h-5 w-5 text-accent" />
            </div>
            <p className="text-xl font-bold text-foreground">{overviewStats.totalSessions}</p>
            <p className="text-xs text-muted-foreground">Sessions</p>
          </div>
        </Card>
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center mx-auto">
              <TrendingUp className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-xl font-bold text-foreground">{overviewStats.streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
        </Card>
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
                <h3 className="text-lg font-semibold text-foreground">Weekly Study Hours</h3>
                <SimpleBarChart 
                  data={weeklyData} 
                  dataKey="hours" 
                  color="bg-focus" 
                />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Total: {weeklyData.reduce((acc, day) => acc + day.hours, 0).toFixed(1)} hours this week
                  </p>
                </div>
              </div>
            </Card>

            {/* Focus Score Chart */}
            <Card className="study-card">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Weekly Focus Score</h3>
                <SimpleBarChart 
                  data={weeklyData} 
                  dataKey="focus" 
                  color="bg-primary" 
                />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Average: {Math.round(weeklyData.reduce((acc, day) => acc + day.focus, 0) / weeklyData.length)}% this week
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
              <div className="space-y-4">
                {topicsData.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium text-foreground">{topic.topic}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{topic.hours}h studied</span>
                        <span>{topic.sessions} sessions</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-2">
                        {topic.avgFocus}% Focus
                      </Badge>
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${topic.avgFocus}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" activeTab={activeTab} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="study-card">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Study Patterns</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Best Study Time</span>
                    <span className="font-medium text-foreground">{studyPatterns.bestTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Most Productive</span>
                    <span className="font-medium text-foreground">{studyPatterns.mostProductive}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Session Rating</span>
                    <span className="font-medium text-foreground">{studyPatterns.avgSessionRating}/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Top Environment</span>
                    <span className="font-medium text-foreground">{studyPatterns.topEnvironment}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="study-card">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Recommendations</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-success/10 rounded-lg">
                    <p className="text-sm text-success-foreground">
                      🎯 Your focus is highest during afternoon sessions. Consider scheduling complex topics then.
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm text-primary-foreground">
                      📚 You're making great progress on Advanced Calculus. Keep up the momentum!
                    </p>
                  </div>
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <p className="text-sm text-warning-foreground">
                      ⏰ Try shorter breaks between sessions to maintain your high focus score.
                    </p>
                  </div>
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
                  Extended progress tracking coming soon. Continue studying to build your analytics history!
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </div>
    </div>
  );
};

export default Analytics;
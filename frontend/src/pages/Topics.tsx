// src/pages/Topics.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Plus, Search, BookOpen, Clock, Target, TrendingUp } from 'lucide-react';
import { API, Topic } from '@/lib/api';
import { toast } from 'sonner';

const Topics = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: topics = [], isLoading, error } = useQuery({
    queryKey: ['topics'],
    queryFn: API.topics.getAll,
  });

  const filteredTopics = topics.filter(topic =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (topic.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return 'bg-destructive text-destructive-foreground';
    if (priority >= 3) return 'bg-warning text-warning-foreground';
    return 'bg-success text-success-foreground';
  };

  const formatStudyTime = (hours: number) => {
    return `${hours}h studied`;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    toast.error('Failed to load topics');
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Topics</h1>
          <p className="text-muted-foreground">
            Organize your study materials by subject
          </p>
        </div>
        <Button className="gradient-primary text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Topic
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">Filter</Button>
        <Button variant="outline">Sort</Button>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTopics.map((topic) => (
          <Card key={topic.id} className="study-card group cursor-pointer hover:shadow-lg">
            <div className="space-y-4">
              {/* Topic Header */}
              <div className="flex items-start justify-between">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: topic.color }}
                >
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <Badge className={getPriorityColor(topic.priority_level)}>
                  Priority {topic.priority_level}
                </Badge>
              </div>

              {/* Topic Info */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {topic.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {topic.description || 'No description available'}
                </p>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">{Math.round(topic.study_progress)}%</span>
                </div>
                <Progress value={topic.study_progress} className="w-full h-2" />
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{topic.total_pdfs} PDFs</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatStudyTime(topic.estimated_completion_hours)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Target className="h-4 w-4 mr-1" />
                  Study
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Stats
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredTopics.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No topics found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or create a new topic.
          </p>
        </div>
      )}
    </div>
  );
};

export default Topics;
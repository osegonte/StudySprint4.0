// src/pages/Topics.tsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Clock, 
  Target, 
  TrendingUp,
  Filter,
  Grid3X3,
  List,
  Star,
  Calendar,
  Users,
  Award,
  ChevronRight,
  MoreVertical,
  Edit,
  Archive,
  Trash2,
  Play,
  BarChart3
} from 'lucide-react';

interface Topic {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  difficulty_level: number;
  priority_level: number;
  total_pdfs: number;
  total_exercises: number;
  study_progress: number;
  estimated_completion_hours: number;
  actual_study_hours: number;
  completion_percentage: number;
  last_studied: string;
  next_deadline?: string;
  study_streak: number;
  average_session_rating: number;
  is_archived: boolean;
  is_starred: boolean;
  created_at: string;
  updated_at: string;
  tags: string[];
  study_plan: {
    weekly_goal_hours: number;
    current_week_hours: number;
    sessions_this_week: number;
  };
  performance: {
    quiz_average: number;
    focus_score: number;
    retention_rate: number;
  };
}

const mockTopics: Topic[] = [
  {
    id: '1',
    name: 'Advanced Calculus',
    description: 'Integration, differentiation, multivariable calculus, and series convergence',
    color: '#3B82F6',
    icon: '∫',
    difficulty_level: 4,
    priority_level: 5,
    total_pdfs: 12,
    total_exercises: 45,
    study_progress: 72.5,
    estimated_completion_hours: 120,
    actual_study_hours: 87,
    completion_percentage: 72,
    last_studied: '2024-01-20T14:30:00Z',
    next_deadline: '2024-02-15',
    study_streak: 8,
    average_session_rating: 4.3,
    is_archived: false,
    is_starred: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-20T14:30:00Z',
    tags: ['mathematics', 'calculus', 'advanced'],
    study_plan: {
      weekly_goal_hours: 8,
      current_week_hours: 6.5,
      sessions_this_week: 4
    },
    performance: {
      quiz_average: 88,
      focus_score: 92,
      retention_rate: 85
    }
  },
  {
    id: '2',
    name: 'Quantum Physics',
    description: 'Quantum mechanics, wave functions, uncertainty principle, and quantum entanglement',
    color: '#8B5CF6',
    icon: 'ψ',
    difficulty_level: 5,
    priority_level: 4,
    total_pdfs: 8,
    total_exercises: 32,
    study_progress: 58.3,
    estimated_completion_hours: 95,
    actual_study_hours: 55,
    completion_percentage: 58,
    last_studied: '2024-01-18T16:45:00Z',
    next_deadline: '2024-03-01',
    study_streak: 3,
    average_session_rating: 3.9,
    is_archived: false,
    is_starred: false,
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-18T16:45:00Z',
    tags: ['physics', 'quantum', 'advanced'],
    study_plan: {
      weekly_goal_hours: 6,
      current_week_hours: 3.2,
      sessions_this_week: 2
    },
    performance: {
      quiz_average: 75,
      focus_score: 85,
      retention_rate: 78
    }
  },
  {
    id: '3',
    name: 'Organic Chemistry',
    description: 'Molecular structures, reaction mechanisms, synthesis, and spectroscopy',
    color: '#10B981',
    icon: '⌬',
    difficulty_level: 3,
    priority_level: 3,
    total_pdfs: 15,
    total_exercises: 78,
    study_progress: 41.2,
    estimated_completion_hours: 80,
    actual_study_hours: 33,
    completion_percentage: 41,
    last_studied: '2024-01-17T11:20:00Z',
    study_streak: 0,
    average_session_rating: 4.1,
    is_archived: false,
    is_starred: false,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-17T11:20:00Z',
    tags: ['chemistry', 'organic', 'molecules'],
    study_plan: {
      weekly_goal_hours: 5,
      current_week_hours: 2.1,
      sessions_this_week: 1
    },
    performance: {
      quiz_average: 82,
      focus_score: 78,
      retention_rate: 73
    }
  },
  {
    id: '4',
    name: 'Linear Algebra',
    description: 'Vector spaces, matrices, eigenvalues, transformations, and applications',
    color: '#F59E0B',
    icon: '⟂',
    difficulty_level: 2,
    priority_level: 2,
    total_pdfs: 4,
    total_exercises: 25,
    study_progress: 89.4,
    estimated_completion_hours: 60,
    actual_study_hours: 54,
    completion_percentage: 89,
    last_studied: '2024-01-19T09:15:00Z',
    study_streak: 12,
    average_session_rating: 4.7,
    is_archived: false,
    is_starred: true,
    created_at: '2023-12-15T00:00:00Z',
    updated_at: '2024-01-19T09:15:00Z',
    tags: ['mathematics', 'linear-algebra', 'vectors'],
    study_plan: {
      weekly_goal_hours: 3,
      current_week_hours: 4.2,
      sessions_this_week: 3
    },
    performance: {
      quiz_average: 95,
      focus_score: 94,
      retention_rate: 92
    }
  }
];

const Topics = () => {
  const [topics] = useState(mockTopics);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'priority' | 'last_studied'>('priority');
  const [filterBy, setFilterBy] = useState<'all' | 'starred' | 'active' | 'completed'>('all');

  const filteredAndSortedTopics = topics
    .filter(topic => {
      const matchesSearch = topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFilter = filterBy === 'all' || 
                           (filterBy === 'starred' && topic.is_starred) ||
                           (filterBy === 'active' && topic.study_progress < 100 && !topic.is_archived) ||
                           (filterBy === 'completed' && topic.study_progress >= 90);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'progress': return b.study_progress - a.study_progress;
        case 'priority': return b.priority_level - a.priority_level;
        case 'last_studied': return new Date(b.last_studied).getTime() - new Date(a.last_studied).getTime();
        default: return 0;
      }
    });

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return 'bg-destructive text-destructive-foreground';
    if (priority >= 3) return 'bg-warning text-warning-foreground';
    return 'bg-success text-success-foreground';
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-success';
    if (difficulty <= 3) return 'text-warning';
    return 'text-destructive';
  };

  const formatLastStudied = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-success';
    if (progress >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const overallStats = {
    totalTopics: topics.length,
    averageProgress: Math.round(topics.reduce((sum, topic) => sum + topic.study_progress, 0) / topics.length),
    totalStudyHours: topics.reduce((sum, topic) => sum + topic.actual_study_hours, 0),
    completedTopics: topics.filter(topic => topic.study_progress >= 90).length,
    activeStreak: Math.max(...topics.map(topic => topic.study_streak))
  };

  return (
    <div className="p-6 space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Study Topics</h1>
          <p className="text-muted-foreground">
            Organize and track your academic subjects
          </p>
        </div>
        <Button className="gradient-primary text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Topic
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xl font-bold text-foreground">{overallStats.totalTopics}</p>
            <p className="text-xs text-muted-foreground">Total Topics</p>
          </div>
        </Card>
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mx-auto">
              <Target className="h-5 w-5 text-success" />
            </div>
            <p className="text-xl font-bold text-foreground">{overallStats.averageProgress}%</p>
            <p className="text-xs text-muted-foreground">Avg Progress</p>
          </div>
        </Card>
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-focus/10 rounded-lg flex items-center justify-center mx-auto">
              <Clock className="h-5 w-5 text-focus" />
            </div>
            <p className="text-xl font-bold text-foreground">{overallStats.totalStudyHours}h</p>
            <p className="text-xs text-muted-foreground">Total Study Time</p>
          </div>
        </Card>
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center mx-auto">
              <Award className="h-5 w-5 text-warning" />
            </div>
            <p className="text-xl font-bold text-foreground">{overallStats.completedTopics}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </Card>
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <p className="text-xl font-bold text-foreground">{overallStats.activeStreak}</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
        </Card>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search topics, tags, or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filterBy === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterBy('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filterBy === 'starred' ? 'default' : 'outline'}
            onClick={() => setFilterBy('starred')}
            size="sm"
          >
            <Star className="h-3 w-3 mr-1" />
            Starred
          </Button>
          <Button
            variant={filterBy === 'active' ? 'default' : 'outline'}
            onClick={() => setFilterBy('active')}
            size="sm"
          >
            Active
          </Button>
          <Button
            variant={filterBy === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilterBy('completed')}
            size="sm"
          >
            Completed
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-border rounded-md bg-background text-sm"
          >
            <option value="priority">Sort by Priority</option>
            <option value="progress">Sort by Progress</option>
            <option value="name">Sort by Name</option>
            <option value="last_studied">Sort by Last Studied</option>
          </select>

          <div className="flex border border-border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Topics Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedTopics.map((topic) => (
            <Card key={topic.id} className="study-card group cursor-pointer hover:shadow-lg transition-all">
              <div className="space-y-4">
                {/* Topic Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                      style={{ backgroundColor: topic.color }}
                    >
                      {topic.icon}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        {topic.is_starred && <Star className="h-4 w-4 text-warning fill-warning" />}
                        <Badge className={getPriorityColor(topic.priority_level)}>
                          P{topic.priority_level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className={getDifficultyColor(topic.difficulty_level)}>
                          {'★'.repeat(topic.difficulty_level)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>

                {/* Topic Info */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {topic.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {topic.description}
                  </p>
                </div>

                {/* Progress Section */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Overall Progress</span>
                      <span className={`font-medium ${getProgressColor(topic.study_progress)}`}>
                        {Math.round(topic.study_progress)}%
                      </span>
                    </div>
                    <Progress value={topic.study_progress} className="w-full h-2" />
                  </div>

                  {/* Weekly Goal Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">This Week</span>
                      <span className="text-muted-foreground">
                        {topic.study_plan.current_week_hours}h / {topic.study_plan.weekly_goal_hours}h
                      </span>
                    </div>
                    <Progress 
                      value={(topic.study_plan.current_week_hours / topic.study_plan.weekly_goal_hours) * 100} 
                      className="w-full h-1" 
                    />
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-secondary/50 rounded">
                    <p className="text-xs text-muted-foreground">Focus</p>
                    <p className="text-sm font-semibold text-foreground">{topic.performance.focus_score}%</p>
                  </div>
                  <div className="p-2 bg-secondary/50 rounded">
                    <p className="text-xs text-muted-foreground">Quiz Avg</p>
                    <p className="text-sm font-semibold text-foreground">{topic.performance.quiz_average}%</p>
                  </div>
                  <div className="p-2 bg-secondary/50 rounded">
                    <p className="text-xs text-muted-foreground">Streak</p>
                    <p className="text-sm font-semibold text-foreground">{topic.study_streak}d</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{topic.total_pdfs} PDFs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{topic.actual_study_hours}h studied</span>
                  </div>
                </div>

                {/* Last Studied */}
                <div className="text-xs text-muted-foreground">
                  Last studied: {formatLastStudied(topic.last_studied)}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Play className="h-4 w-4 mr-1" />
                    Study
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Stats
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        // List View
        <div className="space-y-3">
          {filteredAndSortedTopics.map((topic) => (
            <Card key={topic.id} className="study-card">
              <div className="flex items-center gap-4 p-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: topic.color }}
                >
                  {topic.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-foreground">{topic.name}</h3>
                    {topic.is_starred && <Star className="h-4 w-4 text-warning fill-warning" />}
                    <Badge className={getPriorityColor(topic.priority_level)}>
                      P{topic.priority_level}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{topic.description}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className={`text-lg font-bold ${getProgressColor(topic.study_progress)}`}>
                      {Math.round(topic.study_progress)}%
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Study Time</p>
                    <p className="text-lg font-bold text-foreground">{topic.actual_study_hours}h</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Streak</p>
                    <p className="text-lg font-bold text-foreground">{topic.study_streak}d</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-1" />
                      Study
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredAndSortedTopics.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchQuery ? 'No topics found' : 'No topics yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? 'Try adjusting your search terms or filters.'
              : 'Create your first topic to start organizing your studies.'
            }
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Topic
          </Button>
        </div>
      )}
    </div>
  );
};

export default Topics;
// src/pages/Topics.tsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { SearchInput } from '@/components/common/SearchInput';
import { 
  Plus, 
  BookOpen, 
  Clock, 
  Target, 
  TrendingUp,
  Grid3X3,
  List,
  Star,
  MoreVertical,
  Play,
  BarChart3,
  Trash2
} from 'lucide-react';
import { useTopics, useCreateTopic, useUpdateTopic, useDeleteTopic } from '@/hooks/useApi';

// --- CreateTopicModal ---
const defaultTopic = {
  name: '',
  description: '',
  color: '#6366f1',
  icon: '📚',
  difficulty_level: 3,
  priority_level: 3,
};

function CreateTopicModal({ open, onClose, onCreate, isLoading }: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState(defaultTopic);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name.endsWith('_level') ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    setError('');
    onCreate(form);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create New Topic</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input name="description" value={form.description} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Color</label>
              <input name="color" type="color" value={form.color} onChange={handleChange} className="w-full h-10 p-1 border rounded" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Icon</label>
              <input name="icon" value={form.icon} onChange={handleChange} className="w-full p-2 border rounded" maxLength={2} />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <select name="difficulty_level" value={form.difficulty_level} onChange={handleChange} className="w-full p-2 border rounded">
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select name="priority_level" value={form.priority_level} onChange={handleChange} className="w-full p-2 border rounded">
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          {error && <div className="text-destructive text-sm">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-primary text-white" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- End CreateTopicModal ---

const Topics = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'priority' | 'updated_at'>('priority');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'archived'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: topics = [], isLoading, error, refetch } = useTopics();
  const createTopicMutation = useCreateTopic();
  const updateTopicMutation = useUpdateTopic();
  const deleteTopicMutation = useDeleteTopic();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredAndSortedTopics = topics
    .filter(topic => {
      const matchesSearch = topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           topic.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterBy === 'all' || 
                           (filterBy === 'active' && !topic.is_archived) ||
                           (filterBy === 'archived' && topic.is_archived);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'progress': return b.study_progress - a.study_progress;
        case 'priority': return b.priority_level - a.priority_level;
        case 'updated_at': return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
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

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const overallStats = topics.length > 0 ? {
    totalTopics: topics.length,
    averageProgress: Math.round(topics.reduce((sum, topic) => sum + topic.study_progress, 0) / topics.length),
    totalPDFs: topics.reduce((sum, topic) => sum + topic.total_pdfs, 0),
    totalExercises: topics.reduce((sum, topic) => sum + topic.total_exercises, 0),
    estimatedHours: topics.reduce((sum, topic) => sum + topic.estimated_completion_hours, 0)
  } : {
    totalTopics: 0,
    averageProgress: 0,
    totalPDFs: 0,
    totalExercises: 0,
    estimatedHours: 0
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading your topics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <EmptyState
          title="Unable to load topics"
          description="We're having trouble connecting to your data. Please try refreshing the page."
          icon={<BookOpen className="h-12 w-12" />}
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
          <h1 className="text-3xl font-bold text-foreground">Study Topics</h1>
          <p className="text-muted-foreground">
            Organize and track your academic subjects
          </p>
        </div>
        <Button 
          className="gradient-primary text-white"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Topic
        </Button>
      </div>

      {/* Stats Overview - Only show if topics exist */}
      {topics.length > 0 && (
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
              <p className="text-xl font-bold text-foreground">{overallStats.estimatedHours}h</p>
              <p className="text-xs text-muted-foreground">Est. Hours</p>
            </div>
          </Card>
          <Card className="study-card text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center mx-auto">
                <BookOpen className="h-5 w-5 text-warning" />
              </div>
              <p className="text-xl font-bold text-foreground">{overallStats.totalPDFs}</p>
              <p className="text-xs text-muted-foreground">PDFs</p>
            </div>
          </Card>
          <Card className="study-card text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <p className="text-xl font-bold text-foreground">{overallStats.totalExercises}</p>
              <p className="text-xs text-muted-foreground">Exercises</p>
            </div>
          </Card>
        </div>
      )}

      {/* Search and Filters - Only show if topics exist */}
      {topics.length > 0 && (
        <div className="flex items-center gap-4 flex-wrap">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search topics or descriptions..."
            className="flex-1 max-w-md"
          />
          
          <div className="flex gap-2">
            <Button
              variant={filterBy === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterBy('all')}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={filterBy === 'active' ? 'default' : 'outline'}
              onClick={() => setFilterBy('active')}
              size="sm"
            >
              Active
            </Button>
            <Button
              variant={filterBy === 'archived' ? 'default' : 'outline'}
              onClick={() => setFilterBy('archived')}
              size="sm"
            >
              Archived
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
              <option value="updated_at">Sort by Last Updated</option>
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
      )}

      {/* Topics Display */}
      {filteredAndSortedTopics.length > 0 ? (
        viewMode === 'grid' ? (
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
                        <Badge className={getPriorityColor(topic.priority_level)}>
                          P{topic.priority_level}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs">
                          <span className={getDifficultyColor(topic.difficulty_level)}>
                            {'★'.repeat(topic.difficulty_level)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100" onClick={() => setDeleteConfirmId(topic.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Topic Info */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {topic.name}
                    </h3>
                    {topic.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {topic.description}
                      </p>
                    )}
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">
                        {Math.round(topic.study_progress)}%
                      </span>
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
                      <Target className="h-4 w-4" />
                      <span>{topic.total_exercises} exercises</span>
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div className="text-xs text-muted-foreground">
                    Updated: {formatLastUpdated(topic.updated_at)}
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
                {/* Delete Confirmation Modal */}
                {deleteConfirmId === topic.id && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-sm">
                      <h3 className="text-lg font-bold mb-2">Delete Topic?</h3>
                      <p className="mb-4">Are you sure you want to delete <span className="font-semibold">{topic.name}</span>? This action cannot be undone.</p>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 rounded border">Cancel</button>
                        <button onClick={async () => {
                          await deleteTopicMutation.mutateAsync(topic.id);
                          setDeleteConfirmId(null);
                        }} className="px-4 py-2 rounded bg-destructive text-white" disabled={deleteTopicMutation.isPending}>
                          {deleteTopicMutation.isPending ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
                      <Badge className={getPriorityColor(topic.priority_level)}>
                        P{topic.priority_level}
                      </Badge>
                    </div>
                    {topic.description && (
                      <p className="text-sm text-muted-foreground">{topic.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="text-lg font-bold text-foreground">
                        {Math.round(topic.study_progress)}%
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">PDFs</p>
                      <p className="text-lg font-bold text-foreground">{topic.total_pdfs}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Exercises</p>
                      <p className="text-lg font-bold text-foreground">{topic.total_exercises}</p>
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
        )
      ) : (
        // Empty State
        <EmptyState
          title={searchQuery ? 'No topics found' : topics.length === 0 ? 'No topics yet' : 'No matching topics'}
          description={
            searchQuery 
              ? 'Try adjusting your search terms or filters.'
              : topics.length === 0
              ? 'Create your first topic to start organizing your studies.'
              : 'No topics match your current filters.'
          }
          icon={<BookOpen className="h-12 w-12" />}
          action={topics.length === 0 ? {
            label: "Create Your First Topic",
            onClick: () => {
              // TODO: Open create topic modal/form
              console.log('Create first topic clicked');
            }
          } : undefined}
        />
      )}
      <CreateTopicModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={async (data) => {
          await createTopicMutation.mutateAsync(data);
          setShowCreateModal(false);
        }}
        isLoading={createTopicMutation.isPending}
      />
    </div>
  );
};

export default Topics;
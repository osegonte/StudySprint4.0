// src/pages/Notes.tsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { SearchInput } from '@/components/common/SearchInput';
import { 
  Plus, 
  StickyNote, 
  BookOpen, 
  Calendar,
  Tag,
  FileText,
  Star,
  MoreVertical,
  Edit,
  Link2
} from 'lucide-react';
import { useNotes, useCreateNote } from '@/hooks/useApi';

const Notes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showEditor, setShowEditor] = useState(false);

  const { data: notes = [], isLoading, error, refetch } = useNotes();
  const createNoteMutation = useCreateNote();

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || note.note_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'general':
        return 'bg-primary text-primary-foreground';
      case 'summary':
        return 'bg-success text-success-foreground';
      case 'question':
        return 'bg-warning text-warning-foreground';
      case 'idea':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPreview = (content: string, maxLength: number = 150) => {
    if (!content) return 'No content';
    const plainText = content.replace(/[#*`]/g, '').trim();
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...'
      : plainText;
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading your notes..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <EmptyState
          title="Unable to load notes"
          description="We're having trouble connecting to your data. Please try refreshing the page."
          icon={<StickyNote className="h-12 w-12" />}
          action={{
            label: "Retry",
            onClick: () => refetch()
          }}
        />
      </div>
    );
  }

  if (showEditor) {
    return (
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Editor Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Create Note</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              Cancel
            </Button>
            <Button disabled={createNoteMutation.isPending}>
              {createNoteMutation.isPending ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : null}
              Save Note
            </Button>
          </div>
        </div>

        {/* Editor */}
        <Card className="study-card">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Title</label>
              <Input 
                placeholder="Enter note title..."
                className="text-lg font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Type</label>
                <select className="w-full p-2 border border-border rounded-md bg-background">
                  <option value="general">General Note</option>
                  <option value="summary">Summary</option>
                  <option value="question">Question</option>
                  <option value="idea">Idea</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Topic (Optional)</label>
                <Input placeholder="Select or type topic..." />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Content</label>
              <textarea
                className="w-full h-96 p-4 border border-border rounded-md bg-background resize-none font-mono text-sm"
                placeholder="Start writing your note... (Markdown supported)"
              />
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Markdown supported</span>
              <span>•</span>
              <span>Auto-save enabled</span>
              <span>•</span>
              <span>Word count: 0</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Notes</h1>
          <p className="text-muted-foreground">
            Capture and organize your study insights
          </p>
        </div>
        <Button 
          onClick={() => setShowEditor(true)}
          className="gradient-primary text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Stats - Only show if notes exist */}
      {notes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="study-card text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <StickyNote className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xl font-bold text-foreground">{notes.length}</p>
              <p className="text-xs text-muted-foreground">Total Notes</p>
            </div>
          </Card>
          <Card className="study-card text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center mx-auto">
                <Star className="h-5 w-5 text-warning" />
              </div>
              <p className="text-xl font-bold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">Starred</p>
            </div>
          </Card>
          <Card className="study-card text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-focus/10 rounded-lg flex items-center justify-center mx-auto">
                <Link2 className="h-5 w-5 text-focus" />
              </div>
              <p className="text-xl font-bold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">Connections</p>
            </div>
          </Card>
          <Card className="study-card text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mx-auto">
                <FileText className="h-5 w-5 text-success" />
              </div>
              <p className="text-xl font-bold text-foreground">
                {notes.reduce((acc, note) => acc + (note.content?.split(' ').length || 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Words</p>
            </div>
          </Card>
        </div>
      )}

      {/* Search and Filters - Only show if notes exist */}
      {notes.length > 0 && (
        <div className="flex items-center gap-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search notes, content..."
            className="flex-1 max-w-md"
          />
          
          <div className="flex gap-2">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedType('all')}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={selectedType === 'general' ? 'default' : 'outline'}
              onClick={() => setSelectedType('general')}
              size="sm"
            >
              General
            </Button>
            <Button
              variant={selectedType === 'summary' ? 'default' : 'outline'}
              onClick={() => setSelectedType('summary')}
              size="sm"
            >
              Summary
            </Button>
            <Button
              variant={selectedType === 'question' ? 'default' : 'outline'}
              onClick={() => setSelectedType('question')}
              size="sm"
            >
              Questions
            </Button>
            <Button
              variant={selectedType === 'idea' ? 'default' : 'outline'}
              onClick={() => setSelectedType('idea')}
              size="sm"
            >
              Ideas
            </Button>
          </div>
        </div>
      )}

      {/* Notes Display */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <Card 
              key={note.id} 
              className="study-card group cursor-pointer hover:shadow-lg transition-all"
              onClick={() => setShowEditor(true)}
            >
              <div className="space-y-4">
                {/* Note Header */}
                <div className="flex items-start justify-between">
                  <Badge className={getTypeColor(note.note_type)}>
                    {note.note_type}
                  </Badge>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>

                {/* Note Content */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {note.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-4">
                    {getPreview(note.content || '')}
                  </p>
                </div>

                {/* Note Meta */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {note.topic_id && (
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>Topic</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(note.updated_at)}</span>
                  </div>
                </div>

                {/* Word Count */}
                <div className="text-xs text-muted-foreground">
                  {note.content?.split(' ').length || 0} words
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        // Empty State
        <EmptyState
          title={searchQuery ? 'No notes found' : 'No notes yet'}
          description={
            searchQuery 
              ? 'Try adjusting your search terms or filters.'
              : 'Start capturing your study insights and ideas.'
          }
          icon={<StickyNote className="h-12 w-12" />}
          action={notes.length === 0 ? {
            label: "Create Your First Note",
            onClick: () => setShowEditor(true)
          } : undefined}
        />
      )}
    </div>
  );
};

export default Notes;
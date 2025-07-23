// src/pages/Notes.tsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  StickyNote, 
  BookOpen, 
  Calendar,
  Filter,
  Link2,
  Tag,
  FileText,
  Star,
  MoreVertical
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  type: 'quick' | 'detailed' | 'summary' | 'question';
  topic?: string;
  tags: string[];
  isStarred: boolean;
  linkedNotes: string[];
  linkedPDFs: string[];
  createdAt: string;
  updatedAt: string;
  wordCount: number;
}

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Eigenvalues and Eigenvectors Summary',
    content: `## Key Concepts

**Eigenvalue Definition**: If Av = λv for some non-zero vector v, then λ is an eigenvalue and v is an eigenvector.

**Finding Eigenvalues**:
1. Solve det(A - λI) = 0
2. This gives the characteristic polynomial
3. Roots are the eigenvalues

**Properties**:
- Eigenvalues can be complex numbers
- Sum of eigenvalues = trace of matrix
- Product of eigenvalues = determinant

**Applications**:
- Principal Component Analysis
- Markov chains
- Quantum mechanics`,
    type: 'summary',
    topic: 'Linear Algebra',
    tags: ['eigenvalues', 'linear-algebra', 'mathematics'],
    isStarred: true,
    linkedNotes: ['2'],
    linkedPDFs: ['linear-algebra-textbook.pdf'],
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T14:15:00Z',
    wordCount: 87
  },
  {
    id: '2',
    title: 'Matrix Diagonalization Process',
    content: `Steps for diagonalizing a matrix A:

1. **Find eigenvalues**: Solve det(A - λI) = 0
2. **Find eigenvectors**: For each λ, solve (A - λI)v = 0
3. **Check diagonalizability**: Need n linearly independent eigenvectors
4. **Form matrices**: P = [v₁ v₂ ... vₙ], D = diag(λ₁, λ₂, ..., λₙ)
5. **Verify**: A = PDP⁻¹

**Important Notes**:
- Not all matrices are diagonalizable
- Symmetric matrices are always diagonalizable
- Geometric multiplicity ≤ algebraic multiplicity`,
    type: 'detailed',
    topic: 'Linear Algebra',
    tags: ['diagonalization', 'eigenvalues', 'matrices'],
    isStarred: false,
    linkedNotes: ['1'],
    linkedPDFs: [],
    createdAt: '2024-01-19T15:45:00Z',
    updatedAt: '2024-01-19T16:20:00Z',
    wordCount: 112
  },
  {
    id: '3',
    title: 'Quantum State Vectors',
    content: `Quick note: In quantum mechanics, state vectors |ψ⟩ are eigenvectors of observable operators. 

Measurement collapses the state to an eigenstate with probability |⟨φₙ|ψ⟩|².

Need to review: How does this relate to the uncertainty principle?`,
    type: 'question',
    topic: 'Physics',
    tags: ['quantum-mechanics', 'eigenvectors', 'physics'],
    isStarred: false,
    linkedNotes: [],
    linkedPDFs: ['quantum-mechanics-intro.pdf'],
    createdAt: '2024-01-18T09:20:00Z',
    updatedAt: '2024-01-18T09:20:00Z',
    wordCount: 45
  },
  {
    id: '4',
    title: 'Study Session Insights',
    content: `Today's calculus session went well! 

Key breakthroughs:
- Finally understood L'Hôpital's rule applications
- Integration by parts is becoming more intuitive
- Need to practice more trig substitutions

Next session: Focus on parametric equations and polar coordinates.`,
    type: 'quick',
    topic: 'Mathematics',
    tags: ['calculus', 'study-log', 'integration'],
    isStarred: false,
    linkedNotes: [],
    linkedPDFs: [],
    createdAt: '2024-01-17T20:15:00Z',
    updatedAt: '2024-01-17T20:15:00Z',
    wordCount: 52
  }
];

const Notes = () => {
  const [notes] = useState(mockNotes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedType === 'all' || note.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quick':
        return 'bg-primary text-primary-foreground';
      case 'detailed':
        return 'bg-focus text-focus-foreground';
      case 'summary':
        return 'bg-success text-success-foreground';
      case 'question':
        return 'bg-warning text-warning-foreground';
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
    const plainText = content.replace(/[#*`]/g, '').trim();
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...'
      : plainText;
  };

  if (showEditor) {
    return (
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Editor Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            {selectedNote ? 'Edit Note' : 'New Note'}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              Cancel
            </Button>
            <Button>Save Note</Button>
          </div>
        </div>

        {/* Editor */}
        <Card className="study-card">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Title</label>
              <Input 
                placeholder="Enter note title..."
                defaultValue={selectedNote?.title || ''}
                className="text-lg font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Type</label>
                <select className="w-full p-2 border border-border rounded-md bg-background">
                  <option value="quick">Quick Note</option>
                  <option value="detailed">Detailed Note</option>
                  <option value="summary">Summary</option>
                  <option value="question">Question</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Topic</label>
                <Input placeholder="e.g., Linear Algebra" defaultValue={selectedNote?.topic || ''} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tags</label>
                <Input placeholder="tag1, tag2, tag3" defaultValue={selectedNote?.tags.join(', ') || ''} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Content</label>
              <textarea
                className="w-full h-96 p-4 border border-border rounded-md bg-background resize-none font-mono text-sm"
                placeholder="Start writing your note... (Markdown supported)"
                defaultValue={selectedNote?.content || ''}
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
          onClick={() => {
            setSelectedNote(null);
            setShowEditor(true);
          }}
          className="gradient-primary text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Stats */}
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
            <p className="text-xl font-bold text-foreground">{notes.filter(n => n.isStarred).length}</p>
            <p className="text-xs text-muted-foreground">Starred</p>
          </div>
        </Card>
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-focus/10 rounded-lg flex items-center justify-center mx-auto">
              <Link2 className="h-5 w-5 text-focus" />
            </div>
            <p className="text-xl font-bold text-foreground">
              {notes.reduce((acc, note) => acc + note.linkedNotes.length, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Connections</p>
          </div>
        </Card>
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mx-auto">
              <FileText className="h-5 w-5 text-success" />
            </div>
            <p className="text-xl font-bold text-foreground">
              {notes.reduce((acc, note) => acc + note.wordCount, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Words</p>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes, tags, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedType('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={selectedType === 'quick' ? 'default' : 'outline'}
            onClick={() => setSelectedType('quick')}
            size="sm"
          >
            Quick
          </Button>
          <Button
            variant={selectedType === 'detailed' ? 'default' : 'outline'}
            onClick={() => setSelectedType('detailed')}
            size="sm"
          >
            Detailed
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
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <Card 
            key={note.id} 
            className="study-card group cursor-pointer hover:shadow-lg"
            onClick={() => {
              setSelectedNote(note);
              setShowEditor(true);
            }}
          >
            <div className="space-y-4">
              {/* Note Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(note.type)}>
                    {note.type}
                  </Badge>
                  {note.isStarred && (
                    <Star className="h-4 w-4 text-warning fill-warning" />
                  )}
                </div>
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
                  {getPreview(note.content)}
                </p>
              </div>

              {/* Tags */}
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {note.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{note.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Note Meta */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  {note.topic && (
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      <span>{note.topic}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(note.updatedAt)}</span>
                </div>
              </div>

              {/* Connections */}
              {(note.linkedNotes.length > 0 || note.linkedPDFs.length > 0) && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Link2 className="h-3 w-3" />
                  <span>
                    {note.linkedNotes.length} notes, {note.linkedPDFs.length} PDFs
                  </span>
                </div>
              )}

              {/* Word Count */}
              <div className="text-xs text-muted-foreground">
                {note.wordCount} words
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <StickyNote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchQuery ? 'No notes found' : 'No notes yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? 'Try adjusting your search terms or filters.'
              : 'Start capturing your study insights and ideas.'
            }
          </p>
          <Button 
            onClick={() => {
              setSelectedNote(null);
              setShowEditor(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Note
          </Button>
        </div>
      )}
    </div>
  );
};

export default Notes;
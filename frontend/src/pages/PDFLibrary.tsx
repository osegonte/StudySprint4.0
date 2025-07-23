// src/pages/PDFLibrary.tsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Search, 
  FileText, 
  BookOpen, 
  Clock,
  CheckCircle,
  Filter,
  Grid3X3,
  List,
  Star,
  MoreVertical,
  Play,
  Eye,
  Download,
  Share,
  Bookmark,
  Target,
  TrendingUp,
  Calendar,
  User,
  FileCheck,
  AlertCircle,
  Paperclip
} from 'lucide-react';

interface PDF {
  id: string;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  total_pages: number;
  current_page: number;
  last_read_page: number;
  reading_progress: number;
  pdf_type: 'study' | 'exercise' | 'reference' | 'textbook';
  difficulty_level: number;
  topic_id?: string;
  topic_name?: string;
  topic_color?: string;
  estimated_read_time_minutes: number;
  actual_read_time_minutes: number;
  is_completed: boolean;
  completion_date?: string;
  upload_status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_status: 'pending' | 'extracting' | 'analyzing' | 'completed';
  language: string;
  author?: string;
  subject?: string;
  keywords: string[];
  is_starred: boolean;
  is_bookmarked: boolean;
  last_accessed: string;
  created_at: string;
  updated_at: string;
  reading_sessions: number;
  average_session_time: number;
  notes_count: number;
  highlights_count: number;
  bookmarks_count: number;
  ai_analysis?: {
    summary: string;
    key_concepts: string[];
    difficulty_assessment: number;
    estimated_study_time: number;
  };
  study_metrics: {
    focus_score: number;
    comprehension_rate: number;
    retention_score: number;
    quiz_performance: number;
  };
}

const mockPDFs: PDF[] = [
  {
    id: '1',
    title: 'Advanced Calculus and Real Analysis',
    description: 'Comprehensive textbook covering multivariable calculus, sequences, series, and real analysis fundamentals',
    file_name: 'advanced_calculus_rudin.pdf',
    file_path: '/uploads/pdfs/advanced_calculus_rudin.pdf',
    file_size: 15728640, // 15MB
    total_pages: 456,
    current_page: 328,
    last_read_page: 328,
    reading_progress: 71.9,
    pdf_type: 'textbook',
    difficulty_level: 5,
    topic_id: '1',
    topic_name: 'Advanced Calculus',
    topic_color: '#3B82F6',
    estimated_read_time_minutes: 1368,
    actual_read_time_minutes: 984,
    is_completed: false,
    upload_status: 'completed',
    processing_status: 'completed',
    language: 'en',
    author: 'Walter Rudin',
    subject: 'Mathematics',
    keywords: ['calculus', 'real analysis', 'mathematics', 'advanced'],
    is_starred: true,
    is_bookmarked: true,
    last_accessed: '2024-01-20T14:30:00Z',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z',
    reading_sessions: 23,
    average_session_time: 42,
    notes_count: 15,
    highlights_count: 47,
    bookmarks_count: 8,
    ai_analysis: {
      summary: 'Advanced mathematical text focusing on rigorous proofs and theoretical foundations',
      key_concepts: ['Convergence', 'Continuity', 'Differentiation', 'Integration', 'Sequences'],
      difficulty_assessment: 5,
      estimated_study_time: 45
    },
    study_metrics: {
      focus_score: 92,
      comprehension_rate: 78,
      retention_score: 85,
      quiz_performance: 88
    }
  },
  {
    id: '2',
    title: 'Introduction to Quantum Mechanics',
    description: 'Foundational text covering wave mechanics, operators, and quantum systems',
    file_name: 'quantum_mechanics_griffiths.pdf',
    file_path: '/uploads/pdfs/quantum_mechanics_griffiths.pdf',
    file_size: 12582912, // 12MB
    total_pages: 468,
    current_page: 468,
    last_read_page: 468,
    reading_progress: 100,
    pdf_type: 'textbook',
    difficulty_level: 4,
    topic_id: '2',
    topic_name: 'Quantum Physics',
    topic_color: '#8B5CF6',
    estimated_read_time_minutes: 1404,
    actual_read_time_minutes: 1589,
    is_completed: true,
    completion_date: '2024-01-18T16:45:00Z',
    upload_status: 'completed',
    processing_status: 'completed',
    language: 'en',
    author: 'David J. Griffiths',
    subject: 'Physics',
    keywords: ['quantum mechanics', 'physics', 'wave function', 'operators'],
    is_starred: true,
    is_bookmarked: false,
    last_accessed: '2024-01-18T16:45:00Z',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-18T16:45:00Z',
    reading_sessions: 31,
    average_session_time: 51,
    notes_count: 28,
    highlights_count: 83,
    bookmarks_count: 12,
    ai_analysis: {
      summary: 'Comprehensive introduction to quantum mechanics with practical applications',
      key_concepts: ['Wave Function', 'Schrödinger Equation', 'Operators', 'Quantum States'],
      difficulty_assessment: 4,
      estimated_study_time: 38
    },
    study_metrics: {
      focus_score: 87,
      comprehension_rate: 82,
      retention_score: 79,
      quiz_performance: 91
    }
  },
  {
    id: '3',
    title: 'Organic Chemistry Mechanisms',
    description: 'Detailed study of reaction mechanisms, synthesis strategies, and spectroscopic analysis',
    file_name: 'organic_chemistry_clayden.pdf',
    file_path: '/uploads/pdfs/organic_chemistry_clayden.pdf',
    file_size: 18874368, // 18MB
    total_pages: 512,
    current_page: 187,
    last_read_page: 187,
    reading_progress: 36.5,
    pdf_type: 'textbook',
    difficulty_level: 3,
    topic_id: '3',
    topic_name: 'Organic Chemistry',
    topic_color: '#10B981',
    estimated_read_time_minutes: 1536,
    actual_read_time_minutes: 578,
    is_completed: false,
    upload_status: 'completed',
    processing_status: 'completed',
    language: 'en',
    author: 'Jonathan Clayden',
    subject: 'Chemistry',
    keywords: ['organic chemistry', 'reactions', 'mechanisms', 'synthesis'],
    is_starred: false,
    is_bookmarked: true,
    last_accessed: '2024-01-17T11:20:00Z',
    created_at: '2024-01-12T14:30:00Z',
    updated_at: '2024-01-17T11:20:00Z',
    reading_sessions: 12,
    average_session_time: 48,
    notes_count: 9,
    highlights_count: 24,
    bookmarks_count: 5,
    ai_analysis: {
      summary: 'Comprehensive organic chemistry text with mechanism-focused approach',
      key_concepts: ['Reaction Mechanisms', 'Stereochemistry', 'Synthesis', 'Spectroscopy'],
      difficulty_assessment: 3,
      estimated_study_time: 42
    },
    study_metrics: {
      focus_score: 84,
      comprehension_rate: 76,
      retention_score: 71,
      quiz_performance: 85
    }
  },
  {
    id: '4',
    title: 'Linear Algebra Problem Sets',
    description: 'Collection of solved problems and exercises covering vector spaces and transformations',
    file_name: 'linear_algebra_problems.pdf',
    file_path: '/uploads/pdfs/linear_algebra_problems.pdf',
    file_size: 8388608, // 8MB
    total_pages: 234,
    current_page: 220,
    last_read_page: 220,
    reading_progress: 94.0,
    pdf_type: 'exercise',
    difficulty_level: 2,
    topic_id: '4',
    topic_name: 'Linear Algebra',
    topic_color: '#F59E0B',
    estimated_read_time_minutes: 702,
    actual_read_time_minutes: 673,
    is_completed: false,
    upload_status: 'completed',
    processing_status: 'completed',
    language: 'en',
    author: 'Various Contributors',
    subject: 'Mathematics',
    keywords: ['linear algebra', 'problems', 'exercises', 'vectors', 'matrices'],
    is_starred: false,
    is_bookmarked: false,
    last_accessed: '2024-01-19T09:15:00Z',
    created_at: '2024-01-08T16:00:00Z',
    updated_at: '2024-01-19T09:15:00Z',
    reading_sessions: 18,
    average_session_time: 37,
    notes_count: 12,
    highlights_count: 31,
    bookmarks_count: 3,
    ai_analysis: {
      summary: 'Problem collection with step-by-step solutions and explanations',
      key_concepts: ['Vector Spaces', 'Linear Transformations', 'Eigenvalues', 'Matrix Operations'],
      difficulty_assessment: 2,
      estimated_study_time: 25
    },
    study_metrics: {
      focus_score: 95,
      comprehension_rate: 91,
      retention_score: 88,
      quiz_performance: 96
    }
  }
];

const PDFLibrary = () => {
  const [pdfs] = useState(mockPDFs);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'title' | 'progress' | 'last_accessed' | 'difficulty'>('last_accessed');
  const [filterBy, setFilterBy] = useState<'all' | 'starred' | 'completed' | 'in_progress' | 'textbook' | 'exercise'>('all');

  const filteredAndSortedPDFs = pdfs
    .filter(pdf => {
      const matchesSearch = pdf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           pdf.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           pdf.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           pdf.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFilter = filterBy === 'all' || 
                           (filterBy === 'starred' && pdf.is_starred) ||
                           (filterBy === 'completed' && pdf.is_completed) ||
                           (filterBy === 'in_progress' && !pdf.is_completed && pdf.reading_progress > 0) ||
                           (filterBy === 'textbook' && pdf.pdf_type === 'textbook') ||
                           (filterBy === 'exercise' && pdf.pdf_type === 'exercise');
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title': return a.title.localeCompare(b.title);
        case 'progress': return b.reading_progress - a.reading_progress;
        case 'last_accessed': return new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime();
        case 'difficulty': return b.difficulty_level - a.difficulty_level;
        default: return 0;
      }
    });

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-success text-success-foreground';
    if (difficulty <= 3) return 'bg-warning text-warning-foreground';
    return 'bg-destructive text-destructive-foreground';
  };

  const getDifficultyLabel = (difficulty: number) => {
    const labels = ['', 'Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];
    return labels[difficulty] || 'Unknown';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'textbook': return 'bg-primary text-primary-foreground';
      case 'exercise': return 'bg-focus text-focus-foreground';
      case 'reference': return 'bg-accent text-accent-foreground';
      case 'study': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const formatLastAccessed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-success';
    if (progress >= 50) return 'text-warning';
    return 'text-primary';
  };

  const libraryStats = {
    totalPDFs: pdfs.length,
    completedPDFs: pdfs.filter(pdf => pdf.is_completed).length,
    totalPages: pdfs.reduce((sum, pdf) => sum + pdf.total_pages, 0),
    pagesRead: pdfs.reduce((sum, pdf) => sum + pdf.current_page, 0),
    totalStudyTime: pdfs.reduce((sum, pdf) => sum + pdf.actual_read_time_minutes, 0),
    averageProgress: Math.round(pdfs.reduce((sum, pdf) => sum + pdf.reading_progress, 0) / pdfs.length)
  };

  return (
    <div className="p-6 space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">PDF Library</h1>
          <p className="text-muted-foreground">
            Manage your study materials and track reading progress
          </p>
        </div>
        <Button className="gradient-primary text-white">
          <Upload className="h-4 w-4 mr-2" />
          Upload PDF
        </Button>
      </div>

      {/* Library Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xl font-bold text-foreground">{libraryStats.totalPDFs}</p>
            <p className="text-xs text-muted-foreground">Total PDFs</p>
          </div>
        </Card>
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mx-auto">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <p className="text-xl font-bold text-foreground">{libraryStats.completedPDFs}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </Card>
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-focus/10 rounded-lg flex items-center justify-center mx-auto">
              <BookOpen className="h-5 w-5 text-focus" />
            </div>
            <p className="text-xl font-bold text-foreground">{libraryStats.pagesRead}</p>
            <p className="text-xs text-muted-foreground">Pages Read</p>
          </div>
        </Card>
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center mx-auto">
              <Target className="h-5 w-5 text-warning" />
            </div>
            <p className="text-xl font-bold text-foreground">{libraryStats.averageProgress}%</p>
            <p className="text-xs text-muted-foreground">Avg Progress</p>
          </div>
        </Card>
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <p className="text-xl font-bold text-foreground">{Math.round(libraryStats.totalStudyTime / 60)}h</p>
            <p className="text-xs text-muted-foreground">Study Time</p>
          </div>
        </Card>
        <Card className="study-card text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mx-auto">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <p className="text-xl font-bold text-foreground">{libraryStats.totalPages}</p>
            <p className="text-xs text-muted-foreground">Total Pages</p>
          </div>
        </Card>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search PDFs, authors, or keywords..."
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
            variant={filterBy === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilterBy('completed')}
            size="sm"
          >
            Completed
          </Button>
          <Button
            variant={filterBy === 'in_progress' ? 'default' : 'outline'}
            onClick={() => setFilterBy('in_progress')}
            size="sm"
          >
            In Progress
          </Button>
          <Button
            variant={filterBy === 'textbook' ? 'default' : 'outline'}
            onClick={() => setFilterBy('textbook')}
            size="sm"
          >
            Textbooks
          </Button>
          <Button
            variant={filterBy === 'exercise' ? 'default' : 'outline'}
            onClick={() => setFilterBy('exercise')}
            size="sm"
          >
            Exercises
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-border rounded-md bg-background text-sm"
          >
            <option value="last_accessed">Sort by Last Accessed</option>
            <option value="progress">Sort by Progress</option>
            <option value="title">Sort by Title</option>
            <option value="difficulty">Sort by Difficulty</option>
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

      {/* Enhanced PDF Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedPDFs.map((pdf) => (
            <Card key={pdf.id} className="study-card group cursor-pointer hover:shadow-lg transition-all">
              <div className="space-y-4">
                {/* PDF Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center relative">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                      {pdf.topic_color && (
                        <div 
                          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                          style={{ backgroundColor: pdf.topic_color }}
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        {pdf.is_starred && <Star className="h-4 w-4 text-warning fill-warning" />}
                        {pdf.is_bookmarked && <Bookmark className="h-4 w-4 text-primary" />}
                        <Badge className={getTypeColor(pdf.pdf_type)}>
                          {pdf.pdf_type}
                        </Badge>
                      </div>
                      <Badge className={getDifficultyColor(pdf.difficulty_level)}>
                        {getDifficultyLabel(pdf.difficulty_level)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {pdf.is_completed && (
                      <CheckCircle className="h-5 w-5 text-success" />
                    )}
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* PDF Info */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {pdf.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {pdf.description || 'No description available'}
                  </p>
                  {pdf.author && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{pdf.author}</span>
                    </div>
                  )}
                </div>

                {/* Topic Link */}
                {pdf.topic_name && (
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: pdf.topic_color }}
                    />
                    <span className="text-sm text-muted-foreground">{pdf.topic_name}</span>
                  </div>
                )}

                {/* Reading Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Reading Progress</span>
                    <span className={`font-medium ${getProgressColor(pdf.reading_progress)}`}>
                      {Math.round(pdf.reading_progress)}%
                    </span>
                  </div>
                  <Progress value={pdf.reading_progress} className="w-full h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Page {pdf.current_page} of {pdf.total_pages}</span>
                    <span>{formatLastAccessed(pdf.last_accessed)}</span>
                  </div>
                </div>

                {/* Study Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-secondary/50 rounded">
                    <p className="text-xs text-muted-foreground">Focus</p>
                    <p className="text-sm font-semibold text-foreground">{pdf.study_metrics.focus_score}%</p>
                  </div>
                  <div className="p-2 bg-secondary/50 rounded">
                    <p className="text-xs text-muted-foreground">Sessions</p>
                    <p className="text-sm font-semibold text-foreground">{pdf.reading_sessions}</p>
                  </div>
                  <div className="p-2 bg-secondary/50 rounded">
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="text-sm font-semibold text-foreground">{pdf.notes_count}</p>
                  </div>
                </div>

                {/* PDF Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{pdf.total_pages} pages</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(pdf.actual_read_time_minutes)}</span>
                  </div>
                </div>

                {/* File Info */}
                <div className="text-xs text-muted-foreground">
                  {formatFileSize(pdf.file_size)} • {pdf.language.toUpperCase()}
                  {pdf.highlights_count > 0 && (
                    <span> • {pdf.highlights_count} highlights</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Play className="h-4 w-4 mr-1" />
                    {pdf.is_completed ? 'Review' : 'Continue'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        // Enhanced List View
        <div className="space-y-3">
          {filteredAndSortedPDFs.map((pdf) => (
            <Card key={pdf.id} className="study-card">
              <div className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center relative">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                  {pdf.topic_color && (
                    <div 
                      className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                      style={{ backgroundColor: pdf.topic_color }}
                    />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-foreground">{pdf.title}</h3>
                    {pdf.is_starred && <Star className="h-4 w-4 text-warning fill-warning" />}
                    {pdf.is_completed && <CheckCircle className="h-4 w-4 text-success" />}
                    <Badge className={getTypeColor(pdf.pdf_type)}>
                      {pdf.pdf_type}
                    </Badge>
                    <Badge className={getDifficultyColor(pdf.difficulty_level)}>
                      {getDifficultyLabel(pdf.difficulty_level)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{pdf.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {pdf.author && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{pdf.author}</span>
                      </div>
                    )}
                    <span>{pdf.total_pages} pages</span>
                    <span>{formatFileSize(pdf.file_size)}</span>
                    <span>{formatLastAccessed(pdf.last_accessed)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className={`text-lg font-bold ${getProgressColor(pdf.reading_progress)}`}>
                      {Math.round(pdf.reading_progress)}%
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Study Time</p>
                    <p className="text-lg font-bold text-foreground">{formatDuration(pdf.actual_read_time_minutes)}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Focus Score</p>
                    <p className="text-lg font-bold text-foreground">{pdf.study_metrics.focus_score}%</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-1" />
                      {pdf.is_completed ? 'Review' : 'Continue'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredAndSortedPDFs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchQuery ? 'No PDFs found' : 'No PDFs yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? 'Try adjusting your search terms or filters.'
              : 'Upload your first PDF to start building your library.'
            }
          </p>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Your First PDF
          </Button>
        </div>
      )}
    </div>
  );
};

export default PDFLibrary;
// src/pages/PDFLibrary.tsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { SearchInput } from '@/components/common/SearchInput';
import { 
  Upload, 
  FileText, 
  BookOpen, 
  Clock,
  CheckCircle,
  Grid3X3,
  List,
  Star,
  MoreVertical,
  Play,
  Eye,
  Download,
  Target,
  TrendingUp,
  User
} from 'lucide-react';
import { usePDFs, useUploadPDF } from '@/hooks/useApi';
import { useTopics } from '@/hooks/useApi';
import { API, Topic } from '@/services/api';

const PDFLibrary = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'title' | 'progress' | 'last_accessed' | 'difficulty'>('last_accessed');
  const [filterBy, setFilterBy] = useState<'all' | 'completed' | 'in_progress' | 'textbook' | 'exercise'>('all');

  const { data: pdfData, isLoading, error, refetch } = usePDFs({
    query: searchQuery || undefined,
    page: 1,
    page_size: 50
  });
  const uploadPDFMutation = useUploadPDF();
  const { data: topics = [] } = useTopics();
  const [selectedTopicId, setSelectedTopicId] = useState('');

  const pdfs = pdfData?.pdfs || [];
  const totalCount = pdfData?.total || 0;

  const filteredAndSortedPDFs = pdfs
    .filter((pdf: any) => {
      const matchesFilter = filterBy === 'all' || 
                           (filterBy === 'completed' && pdf.is_completed) ||
                           (filterBy === 'in_progress' && !pdf.is_completed && pdf.reading_progress > 0) ||
                           (filterBy === 'textbook' && pdf.pdf_type === 'textbook') ||
                           (filterBy === 'exercise' && pdf.pdf_type === 'exercise');
      
      return matchesFilter;
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case 'title': return a.title.localeCompare(b.title);
        case 'progress': return b.reading_progress - a.reading_progress;
        case 'last_accessed': return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
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
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
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

  const libraryStats = pdfs.length > 0 ? {
    totalPDFs: totalCount,
    completedPDFs: pdfs.filter((pdf: any) => pdf.is_completed).length,
    totalPages: pdfs.reduce((sum: number, pdf: any) => sum + pdf.total_pages, 0),
    pagesRead: pdfs.reduce((sum: number, pdf: any) => sum + pdf.current_page, 0),
    totalStudyTime: pdfs.reduce((sum: number, pdf: any) => sum + pdf.actual_read_time_minutes, 0),
    averageProgress: Math.round(pdfs.reduce((sum: number, pdf: any) => sum + pdf.reading_progress, 0) / pdfs.length)
  } : {
    totalPDFs: 0,
    completedPDFs: 0,
    totalPages: 0,
    pagesRead: 0,
    totalStudyTime: 0,
    averageProgress: 0
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
    if (selectedTopicId) formData.append('topic_id', selectedTopicId);

    try {
      await uploadPDFMutation.mutateAsync({ formData });
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading your PDF library..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <EmptyState
          title="Unable to load PDF library"
          description="We're having trouble connecting to your data. Please try refreshing the page."
          icon={<FileText className="h-12 w-12" />}
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
          <h1 className="text-3xl font-bold text-foreground">PDF Library</h1>
          <p className="text-muted-foreground">
            Manage your study materials and track reading progress
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={selectedTopicId}
            onChange={e => setSelectedTopicId(e.target.value)}
            className="p-2 border rounded text-sm"
          >
            <option value="">Select Topic (optional)</option>
            {topics.map((topic: Topic) => (
              <option key={topic.id} value={topic.id}>{topic.name}</option>
            ))}
          </select>
          <div className="relative">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload as any}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploadPDFMutation.isPending}
            />
            <Button 
              className="gradient-primary text-white"
              disabled={uploadPDFMutation.isPending}
            >
              {uploadPDFMutation.isPending ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Upload PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Library Statistics - Only show if PDFs exist */}
      {pdfs.length > 0 && (
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
      )}

      {/* Search and Filters - Only show if PDFs exist */}
      {pdfs.length > 0 && (
        <div className="flex items-center gap-4 flex-wrap">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search PDFs, authors, or keywords..."
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
      )}

      {/* PDF Display */}
      {filteredAndSortedPDFs.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedPDFs.map((pdf: any) => (
              <Card key={pdf.id} className="study-card group cursor-pointer hover:shadow-lg transition-all">
                <div className="space-y-4">
                  {/* PDF Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center relative">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
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
                    {pdf.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {pdf.description}
                      </p>
                    )}
                    {pdf.author && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{pdf.author}</span>
                      </div>
                    )}
                  </div>

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
                      <span>{formatLastAccessed(pdf.updated_at)}</span>
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
                      <span>{Math.round(pdf.actual_read_time_minutes / 60)}h read</span>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="text-xs text-muted-foreground">
                    {formatFileSize(pdf.file_size)} • {pdf.language?.toUpperCase() || 'Unknown'}
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
          // List View
          <div className="space-y-3">
            {filteredAndSortedPDFs.map((pdf: any) => (
              <Card key={pdf.id} className="study-card">
                <div className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center relative">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-foreground">{pdf.title}</h3>
                      {pdf.is_completed && <CheckCircle className="h-4 w-4 text-success" />}
                      <Badge className={getTypeColor(pdf.pdf_type)}>
                        {pdf.pdf_type}
                      </Badge>
                      <Badge className={getDifficultyColor(pdf.difficulty_level)}>
                        {getDifficultyLabel(pdf.difficulty_level)}
                      </Badge>
                    </div>
                    {pdf.description && (
                      <p className="text-sm text-muted-foreground mb-2">{pdf.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {pdf.author && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{pdf.author}</span>
                        </div>
                      )}
                      <span>{pdf.total_pages} pages</span>
                      <span>{formatFileSize(pdf.file_size)}</span>
                      <span>{formatLastAccessed(pdf.updated_at)}</span>
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
                      <p className="text-sm text-muted-foreground">Read Time</p>
                      <p className="text-lg font-bold text-foreground">{Math.round(pdf.actual_read_time_minutes / 60)}h</p>
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
        )
      ) : (
        // Empty State
        <EmptyState
          title={searchQuery ? 'No PDFs found' : pdfs.length === 0 ? 'No PDFs yet' : 'No matching PDFs'}
          description={
            searchQuery 
              ? 'Try adjusting your search terms or filters.'
              : pdfs.length === 0
              ? 'Upload your first PDF to start building your library.'
              : 'No PDFs match your current filters.'
          }
          icon={<FileText className="h-12 w-12" />}
          action={pdfs.length === 0 ? {
            label: "Upload Your First PDF",
            onClick: () => {
              // Trigger file input
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.pdf';
              input.onchange = handleFileUpload as any;
              input.click();
            }
          } : undefined}
        />
      )}
    </div>
  );
};

export default PDFLibrary;
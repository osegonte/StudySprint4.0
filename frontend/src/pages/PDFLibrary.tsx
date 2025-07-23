// src/pages/PDFLibrary.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  Filter
} from 'lucide-react';
import { API, PDF } from '@/lib/api';
import { formatDuration } from '@/lib/date-utils';

const PDFLibrary = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: pdfData, isLoading } = useQuery({
    queryKey: ['pdfs'],
    queryFn: () => API.pdfs.getAll({ page: 1, page_size: 20 }),
  });

  const pdfs = pdfData?.items || [];

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-success text-success-foreground';
    if (difficulty <= 3) return 'bg-warning text-warning-foreground';
    return 'bg-destructive text-destructive-foreground';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return 'Easy';
    if (difficulty <= 3) return 'Medium';
    return 'Hard';
  };

  const getReadingProgress = (currentPage: number, totalPages: number) => {
    return Math.round((currentPage / totalPages) * 100);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
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
        <Button className="gradient-primary text-white">
          <Upload className="h-4 w-4 mr-2" />
          Upload PDF
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search PDFs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <Button variant="outline">Sort</Button>
      </div>

      {/* PDF Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pdfs.map((pdf) => {
          const progress = getReadingProgress(pdf.current_page, pdf.total_pages);
          
          return (
            <Card key={pdf.id} className="study-card group cursor-pointer hover:shadow-lg">
              <div className="space-y-4">
                {/* PDF Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={getDifficultyColor(pdf.difficulty_level)}>
                        {getDifficultyLabel(pdf.difficulty_level)}
                      </Badge>
                    </div>
                  </div>
                  {pdf.is_completed && (
                    <CheckCircle className="h-5 w-5 text-success" />
                  )}
                </div>

                {/* PDF Info */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {pdf.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {pdf.description || 'No description available'}
                  </p>
                </div>

                {/* Reading Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Reading Progress</span>
                    <span className="font-medium text-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full h-2" />
                  <p className="text-xs text-muted-foreground">
                    Page {pdf.current_page} of {pdf.total_pages}
                  </p>
                </div>

                {/* PDF Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{pdf.total_pages} pages</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(pdf.estimated_read_time_minutes)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    {pdf.is_completed ? 'Review' : 'Continue Reading'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{pdfs.length}</p>
          <p className="text-sm text-muted-foreground">Total PDFs</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-success">
            {pdfs.filter(pdf => pdf.is_completed).length}
          </p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-focus">
            {pdfs.reduce((acc, pdf) => acc + pdf.current_page, 0)}
          </p>
          <p className="text-sm text-muted-foreground">Pages Read</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">
            {Math.round(
              pdfs.reduce((acc, pdf) => acc + (pdf.current_page / pdf.total_pages), 0) / 
              (pdfs.length || 1) * 100
            )}%
          </p>
          <p className="text-sm text-muted-foreground">Avg Progress</p>
        </div>
      </div>
    </div>
  );
};

export default PDFLibrary;
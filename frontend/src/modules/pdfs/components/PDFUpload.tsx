// frontend/src/modules/pdfs/components/PDFUpload.tsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDF, Topic, PDFUploadData } from '../types';
import { usePDFUpload, useTopics } from '../hooks';

interface PDFUploadProps {
  onUploadSuccess?: (pdf: { pdf_id: string; message: string }) => void;
  onUploadError?: (error: string) => void;
}

export const PDFUpload: React.FC<PDFUploadProps> = ({ onUploadSuccess, onUploadError }) => {
  const { topics } = useTopics();
  const { uploadPDF, uploading, uploadProgress, error } = usePDFUpload();
  const [uploadData, setUploadData] = useState<PDFUploadData>({
    title: '',
    description: '',
    topic_id: '',
    pdf_type: 'study',
    difficulty_level: 1,
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Auto-generate title from filename if not provided
    if (!uploadData.title) {
      const filename = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      setUploadData(prev => ({ ...prev, title: filename }));
    }

    try {
      const result = await uploadPDF(file, {
        ...uploadData,
        title: uploadData.title || file.name.replace(/\.[^/.]+$/, ''),
      });
      onUploadSuccess?.(result);
      
      // Reset form
      setUploadData({
        title: '',
        description: '',
        topic_id: '',
        pdf_type: 'study',
        difficulty_level: 1,
      });
    } catch (err) {
      onUploadError?.(error || 'Upload failed');
    }
  }, [uploadData, uploadPDF, onUploadSuccess, onUploadError, error]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload PDF</h3>
      
      {/* Upload Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={uploadData.title}
            onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter PDF title"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={uploadData.description}
            onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Optional description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
              Topic
            </label>
            <select
              id="topic"
              value={uploadData.topic_id || ''}
              onChange={(e) => setUploadData(prev => ({ ...prev, topic_id: e.target.value || undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No topic</option>
              {topics.map(topic => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="type"
              value={uploadData.pdf_type}
              onChange={(e) => setUploadData(prev => ({ ...prev, pdf_type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="study">Study Material</option>
              <option value="exercise">Exercise</option>
              <option value="reference">Reference</option>
            </select>
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select
              id="difficulty"
              value={uploadData.difficulty_level}
              onChange={(e) => setUploadData(prev => ({ ...prev, difficulty_level: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1 - Beginner</option>
              <option value={2}>2 - Easy</option>
              <option value={3}>3 - Intermediate</option>
              <option value={4}>4 - Advanced</option>
              <option value={5}>5 - Expert</option>
            </select>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : uploading 
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="space-y-4">
            <div className="text-blue-600">
              <svg className="mx-auto h-12 w-12 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="text-gray-600">
              <div className="font-medium">Uploading...</div>
              <div className="text-sm">{uploadProgress}% complete</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-gray-400">
              <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-gray-600">
              {isDragActive ? (
                <div className="font-medium text-blue-600">Drop the PDF here</div>
              ) : (
                <div>
                  <div className="font-medium">Drag and drop a PDF file here</div>
                  <div className="text-sm">or click to select a file</div>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500">
              Maximum file size: 500MB
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-red-700 text-sm">{error}</div>
        </div>
      )}
    </div>
  );
};

// frontend/src/modules/pdfs/components/PDFCard.tsx
import React from 'react';
import { PDF } from '../types';

interface PDFCardProps {
  pdf: PDF;
  onView?: (pdf: PDF) => void;
  onEdit?: (pdf: PDF) => void;
  onDelete?: (pdf: PDF) => void;
}

export const PDFCard: React.FC<PDFCardProps> = ({ pdf, onView, onEdit, onDelete }) => {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDifficultyColor = (level: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800',
    };
    return colors[level as keyof typeof colors] || colors[1];
  };

  const getTypeColor = (type: string) => {
    const colors = {
      study: 'bg-blue-100 text-blue-800',
      exercise: 'bg-purple-100 text-purple-800',
      reference: 'bg-gray-100 text-gray-800',
    };
    return colors[type as keyof typeof colors] || colors.study;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      {/* Thumbnail/Icon */}
      <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-t-lg">
        <div className="flex items-center justify-center">
          <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 truncate flex-1" title={pdf.title}>
            {pdf.title}
          </h3>
        </div>

        {pdf.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {pdf.description}
          </p>
        )}

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-xs text-gray-500">
            <span className="mr-4">{pdf.total_pages} pages</span>
            <span className="mr-4">{formatFileSize(pdf.file_size)}</span>
            <span>{formatDate(pdf.created_at)}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(pdf.pdf_type)}`}>
              {pdf.pdf_type}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(pdf.difficulty_level)}`}>
              Level {pdf.difficulty_level}
            </span>
            {pdf.is_completed && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Complete
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round(pdf.reading_progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${pdf.reading_progress}%` }}
            ></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView?.(pdf)}
            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            View
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(pdf)}
              className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(pdf)}
              className="px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-md hover:bg-red-200 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// frontend/src/modules/pdfs/components/PDFLibrary.tsx
import React, { useState, useMemo } from 'react';
import { PDF, PDFSearchParams } from '../types';
import { usePDFs, useTopics } from '../hooks';
import { PDFCard } from './PDFCard';
import { PDFUpload } from './PDFUpload';

interface PDFLibraryProps {
  onViewPDF?: (pdf: PDF) => void;
}

export const PDFLibrary: React.FC<PDFLibraryProps> = ({ onViewPDF }) => {
  const { topics } = useTopics();
  const [searchParams, setSearchParams] = useState<PDFSearchParams>({
    page: 1,
    page_size: 20,
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);

  const { pdfs, loading, error, pagination, refetch } = usePDFs(searchParams);

  const updateSearchParams = (updates: Partial<PDFSearchParams>) => {
    setSearchParams(prev => ({
      ...prev,
      ...updates,
      page: updates.page || 1, // Reset to first page when filtering
    }));
  };

  const handleSearch = (query: string) => {
    updateSearchParams({ query: query || undefined });
  };

  const handleFilterChange = (filters: Partial<PDFSearchParams>) => {
    updateSearchParams(filters);
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ page });
  };

  const handleUploadSuccess = () => {
    setShowUpload(false);
    refetch();
  };

  if (loading && pdfs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading PDFs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">PDF Library</h2>
          <p className="text-gray-600">
            {pagination.total} PDF{pagination.total !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          {showUpload ? 'Cancel' : 'Upload PDF'}
        </button>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <PDFUpload
          onUploadSuccess={handleUploadSuccess}
          onUploadError={(error) => console.error('Upload error:', error)}
        />
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search PDFs..."
              value={searchParams.query || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Topic Filter */}
          <div>
            <select
              value={searchParams.topic_id || ''}
              onChange={(e) => handleFilterChange({ topic_id: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Topics</option>
              {topics.map(topic => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={searchParams.pdf_type || ''}
              onChange={(e) => handleFilterChange({ pdf_type: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="study">Study Material</option>
              <option value="exercise">Exercise</option>
              <option value="reference">Reference</option>
            </select>
          </div>
        </div>

        {/* Additional Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={searchParams.difficulty_level || ''}
              onChange={(e) => handleFilterChange({ 
                difficulty_level: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Difficulties</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
              <option value="5">Level 5</option>
            </select>

            <select
              value={searchParams.is_completed === undefined ? '' : searchParams.is_completed.toString()}
              onChange={(e) => handleFilterChange({ 
                is_completed: e.target.value === '' ? undefined : e.target.value === 'true'
              })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="false">In Progress</option>
              <option value="true">Completed</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* PDF Grid/List */}
      {error ? (
        <div className="text-center py-12">
          <div className="text-red-600 text-lg mb-2">Error loading PDFs</div>
          <div className="text-gray-500">{error}</div>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : pdfs.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No PDFs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchParams.query || searchParams.topic_id 
              ? 'Try adjusting your search criteria.' 
              : 'Get started by uploading your first PDF.'
            }
          </p>
          {!searchParams.query && !searchParams.topic_id && (
            <button
              onClick={() => setShowUpload(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Upload PDF
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {pdfs.map(pdf => (
              <PDFCard
                key={pdf.id}
                pdf={pdf}
                onView={onViewPDF}
                onEdit={(pdf) => console.log('Edit PDF:', pdf)}
                onDelete={(pdf) => console.log('Delete PDF:', pdf)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.total_pages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {(pagination.page - 1) * pagination.page_size + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.page_size, pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            pageNum === pagination.page
                              ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.total_pages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
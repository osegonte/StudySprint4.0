// frontend/src/modules/pdfs/types/index.ts
export interface PDF {
  id: string;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  total_pages: number;
  current_page: number;
  last_read_page: number;
  reading_progress: number;
  pdf_type: 'study' | 'exercise' | 'reference';
  difficulty_level: number;
  topic_id?: string;
  parent_pdf_id?: string;
  estimated_read_time_minutes: number;
  actual_read_time_minutes: number;
  is_completed: boolean;
  completion_date?: string;
  upload_status: 'pending' | 'uploading' | 'completed' | 'failed';
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  content_hash?: string;
  language: string;
  author?: string;
  subject?: string;
  keywords: string[];
  metadata: Record<string, any>;
  ai_analysis: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  total_pdfs: number;
  total_exercises: number;
  study_progress: number;
  estimated_completion_hours: number;
  difficulty_level: number;
  priority_level: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface PDFSearchParams {
  query?: string;
  topic_id?: string;
  pdf_type?: string;
  difficulty_level?: number;
  is_completed?: boolean;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PDFUploadData {
  title: string;
  description?: string;
  topic_id?: string;
  pdf_type?: 'study' | 'exercise' | 'reference';
  difficulty_level?: number;
  parent_pdf_id?: string;
}

// frontend/src/modules/pdfs/services/index.ts
import axios from 'axios';
import { PDF, Topic, PDFSearchParams, PDFUploadData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class PDFService {
  private baseURL = `${API_URL}/api/v1`;

  async uploadPDF(file: File, data: PDFUploadData): Promise<{ pdf_id: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', data.title);
    
    if (data.description) formData.append('description', data.description);
    if (data.topic_id) formData.append('topic_id', data.topic_id);
    if (data.pdf_type) formData.append('pdf_type', data.pdf_type);
    if (data.difficulty_level) formData.append('difficulty_level', data.difficulty_level.toString());
    if (data.parent_pdf_id) formData.append('parent_pdf_id', data.parent_pdf_id);

    const response = await axios.post(`${this.baseURL}/pdfs/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  async getPDFs(params: PDFSearchParams = {}): Promise<{
    pdfs: PDF[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  }> {
    const response = await axios.get(`${this.baseURL}/pdfs`, { params });
    return response.data;
  }

  async getPDF(id: string): Promise<PDF> {
    const response = await axios.get(`${this.baseURL}/pdfs/${id}`);
    return response.data;
  }

  async updatePDF(id: string, data: Partial<PDFUploadData>): Promise<PDF> {
    const response = await axios.put(`${this.baseURL}/pdfs/${id}`, data);
    return response.data;
  }

  async deletePDF(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/pdfs/${id}`);
  }

  async updateReadingProgress(id: string, currentPage: number): Promise<PDF> {
    const response = await axios.put(`${this.baseURL}/pdfs/${id}/progress`, {
      current_page: currentPage,
    });
    return response.data;
  }

  async searchContent(query: string, topicId?: string): Promise<any> {
    const params = { query, ...(topicId && { topic_id: topicId }) };
    const response = await axios.get(`${this.baseURL}/pdfs/search/content`, { params });
    return response.data;
  }

  getPDFContentURL(id: string): string {
    return `${this.baseURL}/pdfs/${id}/content`;
  }

  getThumbnailURL(id: string): string {
    return `${this.baseURL}/pdfs/${id}/thumbnail`;
  }
}

class TopicService {
  private baseURL = `${API_URL}/api/v1`;

  async getTopics(includeArchived = false): Promise<{
    topics: Topic[];
    total: number;
    archived_count: number;
  }> {
    const response = await axios.get(`${this.baseURL}/topics`, {
      params: { include_archived: includeArchived },
    });
    return response.data;
  }

  async getTopic(id: string): Promise<Topic> {
    const response = await axios.get(`${this.baseURL}/topics/${id}`);
    return response.data;
  }

  async createTopic(data: Omit<Topic, 'id' | 'created_at' | 'updated_at' | 'total_pdfs' | 'total_exercises' | 'study_progress' | 'estimated_completion_hours' | 'is_archived'>): Promise<Topic> {
    const response = await axios.post(`${this.baseURL}/topics`, data);
    return response.data;
  }

  async updateTopic(id: string, data: Partial<Topic>): Promise<Topic> {
    const response = await axios.put(`${this.baseURL}/topics/${id}`, data);
    return response.data;
  }

  async archiveTopic(id: string): Promise<void> {
    await axios.post(`${this.baseURL}/topics/${id}/archive`);
  }

  async restoreTopic(id: string): Promise<void> {
    await axios.post(`${this.baseURL}/topics/${id}/restore`);
  }

  async deleteTopic(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/topics/${id}`);
  }
}

export const pdfService = new PDFService();
export const topicService = new TopicService();

// frontend/src/modules/pdfs/hooks/index.ts
import { useState, useEffect, useCallback } from 'react';
import { PDF, Topic, PDFSearchParams, PDFUploadData } from '../types';
import { pdfService, topicService } from '../services';

export const usePDFs = (searchParams: PDFSearchParams = {}) => {
  const [pdfs, setPDFs] = useState<PDF[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    page_size: 20,
    total_pages: 0,
  });

  const fetchPDFs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pdfService.getPDFs(searchParams);
      setPDFs(response.pdfs);
      setPagination({
        total: response.total,
        page: response.page,
        page_size: response.page_size,
        total_pages: response.total_pages,
      });
    } catch (err) {
      setError('Failed to fetch PDFs');
      console.error('Error fetching PDFs:', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchPDFs();
  }, [fetchPDFs]);

  return {
    pdfs,
    loading,
    error,
    pagination,
    refetch: fetchPDFs,
  };
};

export const usePDF = (id: string) => {
  const [pdf, setPDF] = useState<PDF | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPDF = async () => {
      try {
        setLoading(true);
        setError(null);
        const pdfData = await pdfService.getPDF(id);
        setPDF(pdfData);
      } catch (err) {
        setError('Failed to fetch PDF');
        console.error('Error fetching PDF:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPDF();
    }
  }, [id]);

  const updateProgress = useCallback(async (currentPage: number) => {
    if (!pdf) return;

    try {
      const updatedPDF = await pdfService.updateReadingProgress(pdf.id, currentPage);
      setPDF(updatedPDF);
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  }, [pdf]);

  return {
    pdf,
    loading,
    error,
    updateProgress,
  };
};

export const useTopics = (includeArchived = false) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await topicService.getTopics(includeArchived);
      setTopics(response.topics);
    } catch (err) {
      setError('Failed to fetch topics');
      console.error('Error fetching topics:', err);
    } finally {
      setLoading(false);
    }
  }, [includeArchived]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  return {
    topics,
    loading,
    error,
    refetch: fetchTopics,
  };
};

export const usePDFUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadPDF = useCallback(async (file: File, data: PDFUploadData) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      // Simulate progress for now - in real implementation, you'd use axios onUploadProgress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await pdfService.uploadPDF(file, data);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      return result;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);

  return {
    uploadPDF,
    uploading,
    uploadProgress,
    error,
  };
};

// frontend/src/modules/pdfs/components/PDFViewer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDF } from '../types';
import { usePDF } from '../hooks';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfId: string;
  onPageChange?: (page: number) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ pdfId, onPageChange }) => {
  const { pdf, loading, error, updateProgress } = usePDF(pdfId);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pdf) {
      setPageNumber(pdf.current_page || 1);
    }
  }, [pdf]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    setPdfError('Failed to load PDF document');
    console.error('PDF load error:', error);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= numPages) {
      setPageNumber(page);
      updateProgress(page);
      onPageChange?.(page);
    }
  };

  const nextPage = () => goToPage(pageNumber + 1);
  const prevPage = () => goToPage(pageNumber - 1);

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setScale(1.0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading PDF...</span>
      </div>
    );
  }

  if (error || !pdf) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">Failed to load PDF</div>
          <div className="text-gray-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer bg-gray-50 rounded-lg">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold text-gray-900">{pdf.title}</h3>
          <div className="text-sm text-gray-500">
            Page {pageNumber} of {numPages}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Navigation Controls */}
          <button
            onClick={prevPage}
            disabled={pageNumber <= 1}
            className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm disabled:opacity-50"
          >
            Previous
          </button>
          
          <input
            type="number"
            value={pageNumber}
            onChange={(e) => goToPage(parseInt(e.target.value))}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
            min={1}
            max={numPages}
          />
          
          <button
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm disabled:opacity-50"
          >
            Next
          </button>

          {/* Zoom Controls */}
          <div className="border-l border-gray-300 ml-4 pl-4 flex items-center space-x-2">
            <button
              onClick={zoomOut}
              className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm"
            >
              -
            </button>
            <span className="text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
            <button
              onClick={zoomIn}
              className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm"
            >
              +
            </button>
            <button
              onClick={resetZoom}
              className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div 
        ref={containerRef}
        className="pdf-content overflow-auto bg-gray-100 p-4"
        style={{ height: 'calc(100vh - 200px)' }}
      >
        <div className="flex justify-center">
          {pdfError ? (
            <div className="text-red-600 p-4">{pdfError}</div>
          ) : (
            <Document
              file={`/api/v1/pdfs/${pdfId}/content`}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                className="shadow-lg"
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Reading Progress</span>
          <span>{Math.round((pageNumber / numPages) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(pageNumber / numPages) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
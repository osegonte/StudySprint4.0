import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import 'react-pdf/node_modules/pdfjs-dist/web/pdf_viewer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  fileUrl?: string; // URL or path to the PDF file
  sessionId?: string;
  pdfId?: string;
  onPageChange?: (page: number) => void;
  onActivity?: () => void;
  onEndSession?: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, sessionId, pdfId, onPageChange, onActivity, onEndSession }) => {
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer logic with activity callback
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimer((t) => t + 1);
        if (onActivity) onActivity();
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, onActivity]);

  const handleStart = () => setIsActive(true);
  const handlePause = () => setIsActive(false);
  const handleEnd = () => {
    setIsActive(false);
    setTimer(0);
    if (onEndSession) onEndSession();
  };

  // Format timer as HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    if (onPageChange) onPageChange(1);
  };

  const goToPrevPage = () => {
    setPageNumber((p) => {
      const newPage = Math.max(1, p - 1);
      if (onPageChange) onPageChange(newPage);
      return newPage;
    });
  };
  const goToNextPage = () => {
    setPageNumber((p) => {
      const newPage = numPages ? Math.min(numPages, p + 1) : p + 1;
      if (onPageChange) onPageChange(newPage);
      return newPage;
    });
  };

  return (
    <div className="flex flex-col items-center w-full h-full p-4 gap-4">
      <div className="flex items-center gap-4 mb-2">
        <span className="text-lg font-mono">Timer: {formatTime(timer)}</span>
        <Button onClick={handleStart} disabled={isActive}>Start</Button>
        <Button onClick={handlePause} disabled={!isActive}>Pause</Button>
        <Button onClick={handleEnd}>End</Button>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <Button onClick={goToPrevPage} disabled={pageNumber <= 1}>Previous</Button>
        <span>Page {pageNumber} of {numPages || '?'}</span>
        <Button onClick={goToNextPage} disabled={numPages ? pageNumber >= numPages : false}>Next</Button>
      </div>
      <div className="w-full flex-1 flex items-center justify-center border rounded shadow bg-white min-h-[80vh]">
        {fileUrl ? (
          <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} loading={<div>Loading PDF...</div>}>
            <Page pageNumber={pageNumber} width={800} />
          </Document>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">No PDF selected</div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer; 
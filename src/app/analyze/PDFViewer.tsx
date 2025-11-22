'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { usePDF } from '@/contexts/PDFContext';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFViewerProps {
  onHeights: (heights: number[]) => void;
}

export default function PDFViewer({ onHeights }: PDFViewerProps) {
  const { pdfFile } = usePDF();
  const [numPages, setNumPages] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pdfFile) {
      setError('No PDF file uploaded. Please upload a PDF to analyze.');
    }
  }, [pdfFile]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF. Please upload a valid PDF file.');
  }

  function onPageLoadSuccess(pageNumber: number) {
    // Get canvas element and its height
    const canvas = document.querySelector(
      `[data-page-number="${pageNumber}"] canvas`
    ) as HTMLCanvasElement;
    if (canvas) {
      const currentHeights = Array(numPages).fill(0);
      currentHeights[pageNumber - 1] = canvas.height;

      // Check if all pages are loaded
      const allCanvases = document.querySelectorAll('.react-pdf__Page canvas');
      if (allCanvases.length === numPages) {
        const heights = Array.from(allCanvases).map(
          (c) => (c as HTMLCanvasElement).height
        );
        onHeights(heights);
      }
    }
  }

  if (error || !pdfFile) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <p className="mb-4">{error || 'No PDF uploaded'}</p>
          <a href="/upload" className="text-blue-400 hover:text-blue-300">
            Upload PDF
          </a>
        </div>
      </div>
    );
  }

  return (
    <Document
      file={pdfFile}
      onLoadSuccess={onDocumentLoadSuccess}
      onLoadError={onDocumentLoadError}
      loading={
        <div className="flex items-center justify-center h-full text-gray-400">
          Loading PDF...
        </div>
      }
    >
      {Array.from(new Array(numPages), (el, index) => (
        <Page
          key={`page_${index + 1}`}
          pageNumber={index + 1}
          onLoadSuccess={() => onPageLoadSuccess(index + 1)}
          width={800}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      ))}
    </Document>
  );
}

'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFViewerProps {
  onHeights: (heights: number[]) => void;
}

export default function PDFViewer({ onHeights }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
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

  return (
    <Document file="/sample.pdf" onLoadSuccess={onDocumentLoadSuccess}>
      {Array.from(new Array(numPages), (el, index) => (
        <Page
          key={`page_${index + 1}`}
          pageNumber={index + 1}
          onLoadSuccess={() => onPageLoadSuccess(index + 1)}
          width={600}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      ))}
    </Document>
  );
}

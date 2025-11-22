'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface PDFContextType {
  pdfFile: string | null;
  setPdfFile: (file: string | null) => void;
  uploadPDF: (file: File) => Promise<void>;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  uploadError: string | null;
}

const PDFContext = createContext<PDFContextType | undefined>(undefined);

export function PDFProvider({ children }: { children: ReactNode }) {
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadPDF = async (file: File) => {
    setUploadStatus('uploading');
    setUploadError(null);

    try {
      // Read file as data URL for local display
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Store locally for immediate display
      setPdfFile(dataUrl);
      localStorage.setItem('uploadedPDF', dataUrl);

      // Upload to backend
      const formData = new FormData();
      formData.append('file', file);

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || 'https://sinceai.onrender.com';
      const response = await fetch(`${apiUrl}/extract`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Upload response:', data);

      setUploadStatus('success');
    } catch (error) {
      console.error('Error uploading PDF:', error);
      setUploadStatus('error');
      setUploadError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
      throw error;
    }
  };

  // Initialize from localStorage on mount
  if (typeof window !== 'undefined' && pdfFile === null) {
    const stored = localStorage.getItem('uploadedPDF');
    if (stored) {
      setPdfFile(stored);
    }
  }

  return (
    <PDFContext.Provider
      value={{ pdfFile, setPdfFile, uploadPDF, uploadStatus, uploadError }}
    >
      {children}
    </PDFContext.Provider>
  );
}

export function usePDF() {
  const context = useContext(PDFContext);
  if (context === undefined) {
    throw new Error('usePDF must be used within a PDFProvider');
  }
  return context;
}

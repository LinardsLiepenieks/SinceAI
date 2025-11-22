'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePDF } from '@/contexts/PDFContext';
import { useExtractionData } from '@/contexts/ExtractionDataContext';

export default function Upload() {
  const router = useRouter();
  const { uploadPDF, uploadStatus, uploadError } = usePDF();
  const { setExtractionData } = useExtractionData();
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        alert('Please select a PDF file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      await uploadPDF(file, setExtractionData);
      router.push('/analyze');
    } catch (error) {
      console.error('Error uploading PDF:', error);
    }
  };

  const isUploading = uploadStatus === 'uploading';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 max-w-[1920px] mx-auto">
      <div className="max-w-md w-full bg-background/50 rounded-lg shadow-xl p-8 border border-foreground/10">
        <h1 className="text-3xl font-bold text-foreground mb-6 text-center">
          Upload PDF
        </h1>

        <div className="mb-6">
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-all duration-150 ${
              isUploading
                ? 'border-foreground/20 bg-background/30 cursor-not-allowed'
                : 'border-foreground/20 bg-background/30 hover:border-djanbee/60 hover:bg-djanbee/10 cursor-pointer'
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isUploading ? (
                <p className="text-lg font-semibold text-foreground/70">
                  Loading...
                </p>
              ) : (
                <>
                  <svg
                    className="w-12 h-12 mb-4 text-foreground/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-foreground/70">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-foreground/50">PDF files only</p>
                </>
              )}
            </div>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>

        {file && (
          <div className="mb-6 p-4 bg-background/40 rounded-lg border border-foreground/10">
            <p className="text-sm text-foreground/80">
              <span className="font-semibold">Selected file:</span> {file.name}
            </p>
            <p className="text-xs text-foreground/60 mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {uploadError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-600">
              <span className="font-semibold">Error:</span> {uploadError}
            </p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full py-3 px-4 bg-djanbee hover:brightness-95 disabled:bg-foreground/20 disabled:cursor-not-allowed text-foreground font-semibold rounded-lg transition-all"
        >
          {isUploading ? 'Uploading...' : 'Upload and Analyze'}
        </button>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-djanbee hover:brightness-90 transition-all"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

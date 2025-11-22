'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePDF } from '@/contexts/PDFContext';

export default function Upload() {
  const router = useRouter();
  const { uploadPDF, uploadStatus, uploadError } = usePDF();
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
      await uploadPDF(file);
      router.push('/analyze');
    } catch (error) {
      console.error('Error uploading PDF:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 max-w-[1920px] mx-auto">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Upload PDF
        </h1>

        <div className="mb-6">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-12 h-12 mb-4 text-gray-400"
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
              <p className="mb-2 text-sm text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500">PDF files only</p>
            </div>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {file && (
          <div className="mb-6 p-4 bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-300">
              <span className="font-semibold">Selected file:</span> {file.name}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {uploadError && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-sm text-red-200">
              <span className="font-semibold">Error:</span> {uploadError}
            </p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploadStatus === 'uploading'}
          className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload and Analyze'}
        </button>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

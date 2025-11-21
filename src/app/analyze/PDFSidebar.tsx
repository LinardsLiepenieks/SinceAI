'use client';

import dynamic from 'next/dynamic';

const PDFViewer = dynamic(() => import('./PDFViewer'), { ssr: false });

interface PDFSidebarProps {
  isVisible: boolean;
  onHeights: (heights: number[]) => void;
}

export default function PDFSidebar({ isVisible, onHeights }: PDFSidebarProps) {
  return (
    <div
      className={`p-4 transition-all duration-300 overflow-y-auto ${
        isVisible ? 'w-1/2' : 'w-0 p-0 overflow-hidden'
      }`}
    >
      {isVisible && <PDFViewer onHeights={onHeights} />}
    </div>
  );
}

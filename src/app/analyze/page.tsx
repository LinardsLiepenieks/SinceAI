'use client';

import { useState } from 'react';
import Navbar from './Navbar';
import PDFSidebar from './PDFSidebar';
import AnalysisCanvas from './AnalysisCanvas';
import { useExtractionData } from '@/contexts/ExtractionDataContext';

export default function Analyze() {
  const [heights, setHeights] = useState<number[]>([]);
  const [isPdfVisible, setIsPdfVisible] = useState(true);
  const { extractionData } = useExtractionData();

  return (
    <div className="flex flex-col min-h-screen max-w-[1920px] mx-auto">
      <Navbar
        isPdfVisible={isPdfVisible}
        onTogglePdf={() => setIsPdfVisible(!isPdfVisible)}
      />
      <div className="flex flex-1 overflow-hidden">
        <AnalysisCanvas
          heights={heights}
          isExpanded={!isPdfVisible}
          dummyData={extractionData}
        />
        <PDFSidebar isVisible={isPdfVisible} onHeights={setHeights} />
      </div>
    </div>
  );
}

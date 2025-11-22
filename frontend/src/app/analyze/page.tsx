'use client';

import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import PDFSidebar from './PDFSidebar';
import AnalysisCanvas from './AnalysisCanvas';
import { useExtractionData } from '@/contexts/ExtractionDataContext';

export default function Analyze() {
  const [heights, setHeights] = useState<number[]>([]);
  const [isPdfVisible, setIsPdfVisible] = useState(true);
  const { extractionData } = useExtractionData();

  useEffect(() => {
    console.log('📊 Analyze page - Extraction data loaded:', extractionData);
    console.log('📄 Number of pages:', Object.keys(extractionData).length);
    Object.entries(extractionData).forEach(([pageIndex, rows]) => {
      console.log(`   Page ${Number(pageIndex) + 1}: ${rows.length} rows`);
    });
  }, [extractionData]);

  return (
    <div className=" bg-djanbee/8 ">
      <div className="  flex flex-col min-h-screen max-w-[1920px] mx-auto">
        <Navbar
          isPdfVisible={isPdfVisible}
          onTogglePdf={() => setIsPdfVisible(!isPdfVisible)}
        />
        <div className="flex flex-1 overflow-hidden  gap-1">
          <AnalysisCanvas
            heights={heights}
            isExpanded={!isPdfVisible}
            dummyData={extractionData}
          />
          <PDFSidebar isVisible={isPdfVisible} onHeights={setHeights} />
        </div>
      </div>
    </div>
  );
}

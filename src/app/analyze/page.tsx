'use client';

import { useState } from 'react';
import Navbar from './Navbar';
import PDFSidebar from './PDFSidebar';
import AnalysisCanvas from './AnalysisCanvas';

export default function Analyze() {
  const [heights, setHeights] = useState<number[]>([]);
  const [isPdfVisible, setIsPdfVisible] = useState(true);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        isPdfVisible={isPdfVisible}
        onTogglePdf={() => setIsPdfVisible(!isPdfVisible)}
      />
      <div className="flex flex-1 overflow-hidden">
        <AnalysisCanvas heights={heights} isExpanded={!isPdfVisible} />
        <PDFSidebar isVisible={isPdfVisible} onHeights={setHeights} />
      </div>
    </div>
  );
}

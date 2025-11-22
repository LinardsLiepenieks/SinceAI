'use client';

import PageAnalysisPanel from './PageAnalysisPanel';

interface ExtractionRowData {
  icons?: string[];
  nro?: string;
  kuvateksti?: string;
  suoja?: string;
  kaapeli?: string;
}

interface AnalysisCanvasProps {
  heights: number[];
  isExpanded: boolean;
  dummyData?: Record<number, ExtractionRowData[]>;
}

export default function AnalysisCanvas({
  heights,
  isExpanded,
  dummyData = {},
}: AnalysisCanvasProps) {
  return (
    <div
      className={`my-4 transition-all duration-300 overflow-y-auto border border-foreground/20 ${
        isExpanded ? 'w-full' : 'w-1/2'
      }`}
    >
      <div className="w-full flex flex-col">
        {heights.length > 0 ? (
          heights.map((height, index) => (
            <PageAnalysisPanel
              key={index}
              pageIndex={index}
              height={height}
              rowData={dummyData[index] || []}
            />
          ))
        ) : (
          <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-gray-500">Load a PDF to start analyzing</div>
          </div>
        )}
      </div>
    </div>
  );
}

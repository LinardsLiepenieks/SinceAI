'use client';

import PageAnalysisPanel from './PageAnalysisPanel';

interface AnalysisCanvasProps {
  heights: number[];
  isExpanded: boolean;
}

export default function AnalysisCanvas({
  heights,
  isExpanded,
}: AnalysisCanvasProps) {
  return (
    <div
      className={`p-4 transition-all duration-300 overflow-y-auto ${
        isExpanded ? 'w-full' : 'w-1/2'
      }`}
    >
      <div className="w-full flex flex-col">
        {heights.length > 0 ? (
          heights.map((height, index) => (
            <PageAnalysisPanel key={index} pageIndex={index} height={height} />
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

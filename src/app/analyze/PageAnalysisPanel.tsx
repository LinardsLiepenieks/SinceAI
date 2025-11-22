'use client';

import ExtractionField from './ExtractionField';

interface ExtractionRowData {
  icons?: string[];
  nro?: string;
  kuvateksti?: string;
  suoja?: string;
  kaapeli?: string;
}

interface PageAnalysisPanelProps {
  pageIndex: number;
  height: number;
  rowData?: ExtractionRowData[];
}

export default function PageAnalysisPanel({
  pageIndex,
  height,
  rowData = [],
}: PageAnalysisPanelProps) {
  return (
    <div
      className="w-full bg-gray-700 rounded flex flex-col items-start justify-start text-white overflow-x-auto overflow-y-auto [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:bg-gray-700 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full"
      style={{ height: `${height}px` }}
    >
      <div className="w-full min-w-[800px] border border-gray-500 border-solid overflow-x-auto [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:bg-gray-700 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full">
        {/* Header with field labels */}
        <div className="flex h-12 text-white px-4 items-center gap-4 flex-shrink-0 border mt-4 border-gray-500 bg-gray-800">
          {/* ICON */}
          <div
            className="flex items-center flex-shrink-0"
            style={{ width: '164px' }}
          >
            <span className="text-sm font-medium whitespace-nowrap">ICON</span>
          </div>

          {/* NRo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-medium whitespace-nowrap w-16">
              NRo
            </span>
          </div>

          {/* Kuvateksti */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-medium whitespace-nowrap w-64">
              Kuvateksti
            </span>
          </div>

          {/* Suoja */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-medium whitespace-nowrap w-20">
              Suoja
            </span>
          </div>

          {/* Kaapeli */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-medium whitespace-nowrap w-36">
              Kaapeli
            </span>
          </div>
        </div>

        {/* Data rows */}
        {[...Array(11)].map((_, rowIndex) => (
          <ExtractionField
            key={`${pageIndex}-${rowIndex}`}
            pageIndex={pageIndex}
            rowIndex={rowIndex}
            initialData={rowData[rowIndex]}
          />
        ))}
      </div>
    </div>
  );
}

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
      className="w-full bg-gray-800/92 rounded flex flex-col items-start justify-start text-foreground overflow-x-auto overflow-y-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-zinc-800/40 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-400 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-300"
      style={{ height: `${height}px` }}
    >
      <div className="w-full min-w-[800px] border border-zinc-700/30 border-solid overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-zinc-800/40 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-400 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-300">
        {/* Header with field labels */}
        <div className="flex h-12 text-foreground px-4 items-center gap-4 flex-shrink-0 border-b border-zinc-700/40 bg-zinc-900 backdrop-blur-sm">
          {/* ICON */}
          <div
            className="flex items-center flex-shrink-0"
            style={{ width: '164px' }}
          >
            <span className="text-sm font-semibold whitespace-nowrap text-foreground">
              ICON
            </span>
          </div>

          {/* NRo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-semibold whitespace-nowrap w-16">
              NRo
            </span>
          </div>

          {/* Kuvateksti */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-semibold whitespace-nowrap w-64">
              Kuvateksti
            </span>
          </div>

          {/* Suoja */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-semibold whitespace-nowrap w-20">
              Suoja
            </span>
          </div>

          {/* Kaapeli */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-semibold whitespace-nowrap w-36">
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

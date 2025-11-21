'use client';

import ExtractionField from './ExtractionField';

interface PageAnalysisPanelProps {
  pageIndex: number;
  height: number;
}

export default function PageAnalysisPanel({
  pageIndex,
  height,
}: PageAnalysisPanelProps) {
  return (
    <div
      className="w-full bg-gray-700 rounded  flex flex-col items-start justify-start py-2.5 text-white"
      style={{ height: `${height}px` }}
    >
      <div className="w-full border border-gray-500 border-solid h-full">
        <div className="border border-gray-500 border-solid mt-4 h-12 flex items-center px-8">
          Header
        </div>
        <ExtractionField pageIndex={pageIndex} />
        <ExtractionField pageIndex={pageIndex} />
        <ExtractionField pageIndex={pageIndex} />
        <ExtractionField pageIndex={pageIndex} />
        <ExtractionField pageIndex={pageIndex} />
        <ExtractionField pageIndex={pageIndex} />
        <ExtractionField pageIndex={pageIndex} />
        <ExtractionField pageIndex={pageIndex} />
        <ExtractionField pageIndex={pageIndex} />
        <ExtractionField pageIndex={pageIndex} />
      </div>
    </div>
  );
}

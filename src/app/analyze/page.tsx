'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const PDFViewer = dynamic(() => import('./PDFViewer'), { ssr: false });

export default function Analyze() {
  const [heights, setHeights] = useState<number[]>([]);

  return (
    <div className="flex min-h-screen">
      <div>NAVBAR</div>
      <div className="w-1/2 p-4">
        <div className="w-full bg-gray-200 flex flex-col">
          {heights.length > 0 ? (
            heights.map((height, index) => (
              <div
                key={index}
                className="w-full bg-blue-500 rounded"
                style={{ height: `${height}px` }}
              />
            ))
          ) : (
            <div className="w-full min-h-screen bg-gray-200 flex items-center justify-center">
              <div className="w-64 h-64 bg-blue-500 rounded"></div>
            </div>
          )}
        </div>
      </div>
      <div className="w-1/2 p-4">
        <PDFViewer onHeights={setHeights} />
      </div>
    </div>
  );
}

'use client';

import { ProtectionSummary } from './types';

interface ProtectionBreakdownProps {
  data: ProtectionSummary[];
}

// Color mapping for different protection values
const protectionColors: Record<string, string> = {
  '10A': 'bg-green-500',
  '16A': 'bg-blue-500',
  '25A': 'bg-yellow-500',
  '32A': 'bg-orange-500',
  '40A': 'bg-red-500',
  '63A': 'bg-purple-500',
};

function getProtectionColor(suoja: string): string {
  return protectionColors[suoja] || 'bg-gray-500';
}

export default function ProtectionBreakdown({ data }: ProtectionBreakdownProps) {
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">By Protection Value</h2>
        <p className="text-sm text-gray-400 mt-1">
          Distribution of devices by protection rating
        </p>
      </div>

      <div className="p-6 space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white ${getProtectionColor(
                    item.suoja
                  )}`}
                >
                  {item.suoja}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">{item.percentage}%</span>
                <span className="text-sm font-semibold text-white">
                  {item.count} devices
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProtectionColor(
                  item.suoja
                )}`}
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="px-6 py-4 border-t border-gray-700 bg-gray-850">
        <div className="flex flex-wrap gap-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${getProtectionColor(item.suoja)}`}
              />
              <span className="text-xs text-gray-400">
                {item.suoja}: {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

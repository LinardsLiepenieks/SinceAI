'use client';

import { AggregatedByProtection } from '@/hooks/useSummaryData';

interface ProtectionBreakdownProps {
  data: AggregatedByProtection[];
  totalCount: number;
}

// Color mapping for different protection values
const protectionColors: Record<string, string> = {
  '10A': 'bg-emerald-500',
  C10: 'bg-emerald-500',
  '16A': 'bg-blue-500',
  C16: 'bg-blue-500',
  '25A': 'bg-djanbee',
  C25: 'bg-djanbee',
  '32A': 'bg-orange-500',
  C32: 'bg-orange-500',
  '40A': 'bg-red-500',
  C40: 'bg-red-500',
  '63A': 'bg-purple-500',
  C63: 'bg-purple-500',
};

function getProtectionColor(suoja: string): string {
  return protectionColors[suoja] || 'bg-zinc-500';
}

export default function ProtectionBreakdown({
  data,
  totalCount,
}: ProtectionBreakdownProps) {
  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-foreground">
          By Protection Value
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Distribution of devices by protection rating
        </p>
      </div>

      <div className="p-6 space-y-4">
        {data.map((item) => {
          const percentage =
            totalCount > 0
              ? ((item.count / totalCount) * 100).toFixed(1)
              : '0.0';

          return (
            <div key={item.suoja} className="space-y-2">
              <div className="flex items-center justify-between ">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-background ${getProtectionColor(
                      item.suoja
                    )}`}
                  >
                    {item.suoja}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400">{percentage}%</span>
                  <span className="text-sm font-semibold text-foreground">
                    {item.count} devices
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProtectionColor(
                    item.suoja
                  )}`}
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/50">
        <div className="flex flex-wrap gap-4">
          {data.map((item) => (
            <div key={item.suoja} className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${getProtectionColor(
                  item.suoja
                )}`}
              />
              <span className="text-xs text-zinc-400">
                {item.suoja}: {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import { AggregatedItem } from '@/hooks/useSummaryData';
import { getSymbolById } from '@/models/symbols';

interface SummaryTableProps {
  data: AggregatedItem[];
  totalCount: number;
  showCable: boolean;
  onToggleCable: () => void;
  separateInputOutput: boolean;
  onToggleSeparateInputOutput: () => void;
}

export default function SummaryTable({
  data,
  totalCount,
  showCable,
  onToggleCable,
  separateInputOutput,
  onToggleSeparateInputOutput,
}: SummaryTableProps) {
  const parseSuoja = (suoja: string) => {
    if (separateInputOutput && suoja.includes('/')) {
      const [input, output] = suoja.split('/').map((s) => s.trim());
      return { input, output, hasSeparator: true };
    }
    return { input: suoja, output: null, hasSeparator: false };
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Device Summary
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Aggregated by icon combination and protection value
          </p>
        </div>
        {/* Toggles */}
        <div className="flex items-center gap-4">
          {/* Cable Toggle */}
          <div className="flex items-center gap-3 text-right">
            <span className="text-sm text-zinc-400">Show Cable</span>
            <button
              onClick={onToggleCable}
              className={`relative inline-flex h-6 w-11 hover:cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-djanbee focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                showCable ? 'bg-djanbee' : 'bg-zinc-700'
              }`}
              role="switch"
              aria-checked={showCable}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showCable ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Separate Input/Output Toggle */}
          <div className="flex items-center gap-3 text-right">
            <span className="text-sm text-zinc-400">Separate Input/Output</span>
            <button
              onClick={onToggleSeparateInputOutput}
              className={`relative inline-flex h-6 w-11 items-center hover:cursor-pointer rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-djanbee focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                separateInputOutput ? 'bg-djanbee' : 'bg-zinc-700'
              }`}
              role="switch"
              aria-checked={separateInputOutput}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  separateInputOutput ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-800/50 border-b border-zinc-800">
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Icons
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                {separateInputOutput ? 'Suoja (In/Out)' : 'Suoja'}
              </th>
              {showCable && (
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Cable Types
                </th>
              )}
              <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Quantity
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {data.map((item) => {
              const { input, output, hasSeparator } = parseSuoja(item.suoja);

              return (
                <tr
                  key={item.id}
                  className="hover:bg-zinc-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {item.icons.map((iconId, idx) => {
                          const symbol = getSymbolById(iconId);
                          return symbol ? (
                            <div
                              key={idx}
                              className="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded flex items-center justify-center"
                            >
                              <img
                                src={`/el_icons/${symbol.iconFileName}`}
                                alt={symbol.name}
                                className="w-6 h-6 object-contain"
                              />
                            </div>
                          ) : null;
                        })}
                      </div>
                      <div className="flex flex-col">
                        {item.icons.map((iconId, idx) => {
                          const symbol = getSymbolById(iconId);
                          return symbol ? (
                            <span key={idx} className="text-xs text-zinc-300">
                              {symbol.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {separateInputOutput && output ? (
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          In: {input}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          Out: {output}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-djanbee/20 text-djanbee border border-djanbee/30">
                        {item.suoja}
                      </span>
                    )}
                  </td>
                  {showCable && (
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {item.kaapeliTypes.length > 0 ? (
                          item.kaapeliTypes.map((cable, idx) => (
                            <span key={idx} className="text-xs text-zinc-300">
                              {cable}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-zinc-500 italic">
                            -
                          </span>
                        )}
                        {item.hasCableMismatch && (
                          <span className="text-xs text-orange-400 flex items-center gap-1">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Mismatch
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded bg-djanbee/20 text-djanbee border border-djanbee/30 text-sm font-semibold">
                      {item.count}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-zinc-950/50 border-t-2 border-zinc-700">
              <td colSpan={showCable ? 3 : 2} className="px-4 py-4 text-right">
                <span className="text-sm font-medium text-zinc-300">
                  Total Devices:
                </span>
              </td>
              <td className="px-4 py-4 text-right">
                <span className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1 rounded bg-djanbee text-background text-lg font-bold">
                  {totalCount}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

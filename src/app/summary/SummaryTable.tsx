'use client';

import { AggregatedDevice } from './types';

interface SummaryTableProps {
  data: AggregatedDevice[];
  totalCount: number;
}

export default function SummaryTable({ data, totalCount }: SummaryTableProps) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Device Summary</h2>
        <p className="text-sm text-gray-400 mt-1">
          Aggregated by device type, protection, and cable
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-750 border-b border-gray-700">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Kuvateksti
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Suoja
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Kaapeli
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Quantity
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {data.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-gray-750 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                    {/* Placeholder for symbol image */}
                    <img
                      src={item.symbol}
                      alt={item.kuvateksti}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        // Fallback to colored box if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `
                          <div class="w-6 h-6 bg-blue-500 rounded"></div>
                        `;
                      }}
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-white">{item.kuvateksti}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-200">
                    {item.suoja}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-300">{item.kaapeli}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded bg-blue-600 text-white text-sm font-semibold">
                    {item.count}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-900 border-t-2 border-gray-600">
              <td colSpan={4} className="px-4 py-4 text-right">
                <span className="text-sm font-medium text-gray-300">
                  Total Devices:
                </span>
              </td>
              <td className="px-4 py-4 text-right">
                <span className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1 rounded bg-green-600 text-white text-lg font-bold">
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

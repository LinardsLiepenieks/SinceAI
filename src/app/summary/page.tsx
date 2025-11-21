'use client';

import Link from 'next/link';
import { getSummaryData } from './dummyData';
import SummaryTable from './SummaryTable';
import ProtectionBreakdown from './ProtectionBreakdown';
import ExportButton from './ExportButton';

export default function SummaryPage() {
  const { devices, aggregated, byProtection, totalCount } = getSummaryData();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/analyze"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-white">
                Extraction Summary
              </h1>
            </div>
            <ExportButton
              devices={devices}
              aggregated={aggregated}
              byProtection={byProtection}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-sm font-medium text-gray-400">Total Devices</div>
            <div className="mt-2 text-3xl font-bold text-white">{totalCount}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-sm font-medium text-gray-400">Unique Types</div>
            <div className="mt-2 text-3xl font-bold text-white">
              {aggregated.length}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-sm font-medium text-gray-400">
              Protection Values
            </div>
            <div className="mt-2 text-3xl font-bold text-white">
              {byProtection.length}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Summary Table - Takes 2 columns */}
          <div className="lg:col-span-2">
            <SummaryTable data={aggregated} totalCount={totalCount} />
          </div>

          {/* Protection Breakdown - Takes 1 column */}
          <div className="lg:col-span-1">
            <ProtectionBreakdown data={byProtection} />
          </div>
        </div>

        {/* Raw Data Section */}
        <div className="mt-8">
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  All Extracted Data
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Complete list of all devices from the PDF
                </p>
              </div>
              <span className="text-sm text-gray-400">
                {devices.length} rows
              </span>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-800">
                  <tr className="border-b border-gray-700">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Page
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Symbol
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      NRo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Kuvateksti
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Suoja
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Kaapeli
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {devices.map((device) => (
                    <tr
                      key={device.id}
                      className="hover:bg-gray-750 transition-colors"
                    >
                      <td className="px-4 py-2 text-sm text-gray-400">
                        {device.pageNumber}
                      </td>
                      <td className="px-4 py-2">
                        <div className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center">
                          <img
                            src={device.symbol}
                            alt=""
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-white font-mono">
                        {device.nro}
                      </td>
                      <td className="px-4 py-2 text-sm text-white">
                        {device.kuvateksti}
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-900 text-yellow-200">
                          {device.suoja}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-300">
                        {device.kaapeli}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

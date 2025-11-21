'use client';

import * as XLSX from 'xlsx';
import { DeviceRow, AggregatedDevice, ProtectionSummary } from './types';

interface ExportButtonProps {
  devices: DeviceRow[];
  aggregated: AggregatedDevice[];
  byProtection: ProtectionSummary[];
}

export default function ExportButton({
  devices,
  aggregated,
  byProtection,
}: ExportButtonProps) {
  const handleExport = () => {
    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: All Devices (raw data)
    const allDevicesData = devices.map(device => ({
      'Page': device.pageNumber,
      'Row': device.rowNumber,
      'NRo': device.nro,
      'Kuvateksti': device.kuvateksti,
      'Suoja': device.suoja,
      'Kaapeli': device.kaapeli,
      'Symbol': device.symbol,
    }));
    const allDevicesSheet = XLSX.utils.json_to_sheet(allDevicesData);

    // Set column widths for better readability
    allDevicesSheet['!cols'] = [
      { wch: 6 },  // Page
      { wch: 6 },  // Row
      { wch: 8 },  // NRo
      { wch: 25 }, // Kuvateksti
      { wch: 8 },  // Suoja
      { wch: 15 }, // Kaapeli
      { wch: 30 }, // Symbol
    ];
    XLSX.utils.book_append_sheet(workbook, allDevicesSheet, 'All Devices');

    // Sheet 2: Aggregated Summary
    const aggregatedData = aggregated.map(item => ({
      'Kuvateksti': item.kuvateksti,
      'Suoja': item.suoja,
      'Kaapeli': item.kaapeli,
      'Quantity': item.count,
      'NRo List': item.nros.join(', '),
    }));

    // Add total row
    aggregatedData.push({
      'Kuvateksti': 'TOTAL',
      'Suoja': '',
      'Kaapeli': '',
      'Quantity': devices.length,
      'NRo List': '',
    });

    const aggregatedSheet = XLSX.utils.json_to_sheet(aggregatedData);
    aggregatedSheet['!cols'] = [
      { wch: 25 }, // Kuvateksti
      { wch: 8 },  // Suoja
      { wch: 15 }, // Kaapeli
      { wch: 10 }, // Quantity
      { wch: 40 }, // NRo List
    ];
    XLSX.utils.book_append_sheet(workbook, aggregatedSheet, 'Summary');

    // Sheet 3: Protection Breakdown
    const protectionData = byProtection.map(item => ({
      'Protection (Suoja)': item.suoja,
      'Count': item.count,
      'Percentage': `${item.percentage}%`,
    }));
    const protectionSheet = XLSX.utils.json_to_sheet(protectionData);
    protectionSheet['!cols'] = [
      { wch: 18 }, // Protection
      { wch: 10 }, // Count
      { wch: 12 }, // Percentage
    ];
    XLSX.utils.book_append_sheet(workbook, protectionSheet, 'By Protection');

    // Generate filename with date
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const filename = `device-summary-${dateStr}.xlsx`;

    // Download
    XLSX.writeFile(workbook, filename);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Export to Excel
    </button>
  );
}

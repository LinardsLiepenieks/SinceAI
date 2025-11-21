import { DeviceRow, AggregatedDevice, ProtectionSummary, SummaryData } from './types';

// Dummy device data - simulating extracted PDF data
export const dummyDevices: DeviceRow[] = [
  // Page 1
  { id: '1-1', pageNumber: 1, rowNumber: 1, symbol: '/symbols/switch-single.svg', nro: '0101', kuvateksti: 'Kytkin 1-napainen', suoja: '16A', kaapeli: 'MMJ 3x1.5S' },
  { id: '1-2', pageNumber: 1, rowNumber: 2, symbol: '/symbols/switch-double.svg', nro: '0102', kuvateksti: 'Kytkin 2-napainen', suoja: '16A', kaapeli: 'MMJ 3x1.5S' },
  { id: '1-3', pageNumber: 1, rowNumber: 3, symbol: '/symbols/outlet.svg', nro: '0103', kuvateksti: 'Pistorasia 1-osainen', suoja: '16A', kaapeli: 'MMJ 3x2.5S' },
  { id: '1-4', pageNumber: 1, rowNumber: 4, symbol: '/symbols/outlet.svg', nro: '0104', kuvateksti: 'Pistorasia 1-osainen', suoja: '16A', kaapeli: 'MMJ 3x2.5S' },
  { id: '1-5', pageNumber: 1, rowNumber: 5, symbol: '/symbols/outlet-double.svg', nro: '0105', kuvateksti: 'Pistorasia 2-osainen', suoja: '16A', kaapeli: 'MMJ 3x2.5S' },
  { id: '1-6', pageNumber: 1, rowNumber: 6, symbol: '/symbols/light.svg', nro: '0106', kuvateksti: 'Valaisinpiste', suoja: '10A', kaapeli: 'MMJ 3x1.5S' },
  { id: '1-7', pageNumber: 1, rowNumber: 7, symbol: '/symbols/light.svg', nro: '0107', kuvateksti: 'Valaisinpiste', suoja: '10A', kaapeli: 'MMJ 3x1.5S' },
  { id: '1-8', pageNumber: 1, rowNumber: 8, symbol: '/symbols/dimmer.svg', nro: '0108', kuvateksti: 'Himmennin', suoja: '16A', kaapeli: 'MMJ 5x1.5S' },

  // Page 2
  { id: '2-1', pageNumber: 2, rowNumber: 1, symbol: '/symbols/switch-single.svg', nro: '0201', kuvateksti: 'Kytkin 1-napainen', suoja: '16A', kaapeli: 'MMJ 3x1.5S' },
  { id: '2-2', pageNumber: 2, rowNumber: 2, symbol: '/symbols/switch-single.svg', nro: '0202', kuvateksti: 'Kytkin 1-napainen', suoja: '16A', kaapeli: 'MMJ 3x1.5S' },
  { id: '2-3', pageNumber: 2, rowNumber: 3, symbol: '/symbols/outlet.svg', nro: '0203', kuvateksti: 'Pistorasia 1-osainen', suoja: '16A', kaapeli: 'MMJ 3x2.5S' },
  { id: '2-4', pageNumber: 2, rowNumber: 4, symbol: '/symbols/outlet-ip44.svg', nro: '0204', kuvateksti: 'Pistorasia IP44', suoja: '16A', kaapeli: 'MMJ 3x2.5S' },
  { id: '2-5', pageNumber: 2, rowNumber: 5, symbol: '/symbols/outlet-ip44.svg', nro: '0205', kuvateksti: 'Pistorasia IP44', suoja: '16A', kaapeli: 'MMJ 3x2.5S' },
  { id: '2-6', pageNumber: 2, rowNumber: 6, symbol: '/symbols/light.svg', nro: '0206', kuvateksti: 'Valaisinpiste', suoja: '10A', kaapeli: 'MMJ 3x1.5S' },
  { id: '2-7', pageNumber: 2, rowNumber: 7, symbol: '/symbols/light-outdoor.svg', nro: '0207', kuvateksti: 'Ulkovalaisin', suoja: '10A', kaapeli: 'MMJ 3x1.5S' },
  { id: '2-8', pageNumber: 2, rowNumber: 8, symbol: '/symbols/motion-sensor.svg', nro: '0208', kuvateksti: 'Liiketunnistin', suoja: '10A', kaapeli: 'MMJ 3x1.5S' },

  // Page 3
  { id: '3-1', pageNumber: 3, rowNumber: 1, symbol: '/symbols/distribution.svg', nro: '0301', kuvateksti: 'Keskus', suoja: '25A', kaapeli: 'MMJ 5x6S' },
  { id: '3-2', pageNumber: 3, rowNumber: 2, symbol: '/symbols/outlet-cee.svg', nro: '0302', kuvateksti: 'CEE-pistorasia 16A', suoja: '16A', kaapeli: 'MMJ 5x2.5S' },
  { id: '3-3', pageNumber: 3, rowNumber: 3, symbol: '/symbols/outlet-cee.svg', nro: '0303', kuvateksti: 'CEE-pistorasia 32A', suoja: '32A', kaapeli: 'MMJ 5x6S' },
  { id: '3-4', pageNumber: 3, rowNumber: 4, symbol: '/symbols/outlet.svg', nro: '0304', kuvateksti: 'Pistorasia 1-osainen', suoja: '16A', kaapeli: 'MMJ 3x2.5S' },
  { id: '3-5', pageNumber: 3, rowNumber: 5, symbol: '/symbols/switch-single.svg', nro: '0305', kuvateksti: 'Kytkin 1-napainen', suoja: '16A', kaapeli: 'MMJ 3x1.5S' },
  { id: '3-6', pageNumber: 3, rowNumber: 6, symbol: '/symbols/light.svg', nro: '0306', kuvateksti: 'Valaisinpiste', suoja: '10A', kaapeli: 'MMJ 3x1.5S' },
  { id: '3-7', pageNumber: 3, rowNumber: 7, symbol: '/symbols/light.svg', nro: '0307', kuvateksti: 'Valaisinpiste', suoja: '10A', kaapeli: 'MMJ 3x1.5S' },
  { id: '3-8', pageNumber: 3, rowNumber: 8, symbol: '/symbols/smoke-detector.svg', nro: '0308', kuvateksti: 'Palovaroitin', suoja: '10A', kaapeli: 'MMJ 2x1.5S' },
];

// Helper function to aggregate devices by description + protection + cable
export function aggregateDevices(devices: DeviceRow[]): AggregatedDevice[] {
  const grouped = new Map<string, AggregatedDevice>();

  devices.forEach(device => {
    const key = `${device.kuvateksti}|${device.suoja}|${device.kaapeli}`;

    if (grouped.has(key)) {
      const existing = grouped.get(key)!;
      existing.count++;
      existing.nros.push(device.nro);
    } else {
      grouped.set(key, {
        kuvateksti: device.kuvateksti,
        suoja: device.suoja,
        kaapeli: device.kaapeli,
        symbol: device.symbol,
        count: 1,
        nros: [device.nro],
      });
    }
  });

  return Array.from(grouped.values()).sort((a, b) => b.count - a.count);
}

// Helper function to get protection value breakdown
export function getProtectionBreakdown(devices: DeviceRow[]): ProtectionSummary[] {
  const grouped = new Map<string, number>();

  devices.forEach(device => {
    const current = grouped.get(device.suoja) || 0;
    grouped.set(device.suoja, current + 1);
  });

  const total = devices.length;

  return Array.from(grouped.entries())
    .map(([suoja, count]) => ({
      suoja,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

// Get complete summary data
export function getSummaryData(): SummaryData {
  const devices = dummyDevices;
  const aggregated = aggregateDevices(devices);
  const byProtection = getProtectionBreakdown(devices);

  return {
    devices,
    aggregated,
    byProtection,
    totalCount: devices.length,
  };
}

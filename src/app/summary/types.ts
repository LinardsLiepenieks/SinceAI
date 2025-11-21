// Device data model for extracted PDF data

export interface DeviceRow {
  id: string;
  pageNumber: number;
  rowNumber: number;
  symbol: string; // Path to symbol image (e.g., "/symbols/switch.png")
  nro: string; // Device number/identifier
  kuvateksti: string; // Description
  suoja: string; // Protection value (e.g., "16A", "25A")
  kaapeli: string; // Cable type (e.g., "NYM 3x2.5")
}

export interface AggregatedDevice {
  kuvateksti: string;
  suoja: string;
  kaapeli: string;
  symbol: string;
  count: number;
  nros: string[]; // List of NRo values for this group
}

export interface ProtectionSummary {
  suoja: string;
  count: number;
  percentage: number;
}

export interface SummaryData {
  devices: DeviceRow[];
  aggregated: AggregatedDevice[];
  byProtection: ProtectionSummary[];
  totalCount: number;
}

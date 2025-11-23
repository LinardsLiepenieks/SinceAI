// Symbol types and data models for electrical diagram analysis

export interface Symbol {
  id: string;
  name: string;
  apiId: string; // ID format from API response (underscores instead of spaces)
  iconFileName: string; // Filename in /public/el_icons/
}

// Available electrical symbols based on icons in /public/el_icons/
export const SYMBOLS: Symbol[] = [
  {
    id: 'KATKAISIJA_3_4',
    name: '3 ja 4-NAP KATKAISIJA',
    apiId: '3_ja_4_NAP_KATKAISIJA',
    iconFileName: '3 ja 4-NAP KATKAISIJA icon.svg',
  },
  {
    id: 'KONTAKTORI_3',
    name: '3-NAP KONTAKTORI',
    apiId: '3_NAP_KONTAKTORI',
    iconFileName: '3-NAP KONTAKTORI icon.svg',
  },
  {
    id: 'KYTKINVAROKE_3',
    name: '3-NAP KYTKINVAROKE KVKE',
    apiId: '3_NAP_KYTKINVAROKE_KVKE',
    iconFileName: '3-NAP KYTKINVAROKE KVKE icon.svg',
  },
  {
    id: 'KAHVAROKEALUSTA',
    name: '3-VAIHE KAHVAROKEALUSTA',
    apiId: '3_VAIHE_KAHVAROKEALUSTA',
    iconFileName: '3-VAIHE KAHVAROKEALUSTA icon.svg',
  },
  {
    id: 'TULPPAVAROKE_3',
    name: '3-VAIHEINEN TULPPAVAROKE',
    apiId: '3_VAIHEINEN_TULPPAVAROKE',
    iconFileName: '3-VAIHEINEN TULPPAVAROKE icon.svg',
  },
  {
    id: 'VIRTAMUUNTAJA_3KPL',
    name: '3kpl VIRTAMUUNTAJA',
    apiId: '3kpl_VIRTAMUUNTAJA',
    iconFileName: '3kpl VIRTAMUUNTAJA icon.svg',
  },
  {
    id: 'CUAI',
    name: 'CUAI',
    apiId: 'CUAI',
    iconFileName: 'CUAI icon.svg',
  },
  {
    id: 'JOHDONSUOJA_1',
    name: 'JOHDONSUOJA 1-NAP',
    apiId: 'JOHDONSUOJA_1_NAP',
    iconFileName: 'JOHDONSUOJA 1-NAP icon.svg',
  },
  {
    id: 'JOHDONSUOJA_3',
    name: 'JOHDONSUOJA 3-NAP',
    apiId: 'JOHDONSUOJA_3_NAP',
    iconFileName: 'JOHDONSUOJA 3-NAP icon.svg',
  },
  {
    id: 'MERKKILAMPPU',
    name: 'Merkkilamppu DIN tai Kansiasennus',
    apiId: 'MERKKILAMPPU',
    iconFileName: 'Merkkilamppu DIN tai Kansiasennus icon.svg',
  },
  {
    id: 'VIKAVIRTASUOJA',
    name: 'VIKAVIRTASUOJA',
    apiId: 'VIKAVIRTASUOJA',
    iconFileName: 'VIKAVIRTASUOJA icon.svg',
  },
  {
    id: 'YHDISTELMASUOJA',
    name: 'YHDISTELMASUOJA',
    apiId: 'YHDISTELMASUOJA',
    iconFileName: 'YHDISTELMASUOJA icon.svg',
  },
  {
    id: 'KILOWATTTUNTIMITTARI',
    name: 'Kilowattituntimittari',
    apiId: 'KILOWATTTUNTIMITTARI',
    iconFileName: 'kilowattituntimittari icon.svg',
  },
];

// Helper function to get symbol by ID
export function getSymbolById(id: string): Symbol | undefined {
  return SYMBOLS.find((symbol) => symbol.id === id);
}

// Helper function to get symbol by API ID (format from extraction response)
export function getSymbolByApiId(apiId: string): Symbol | undefined {
  return SYMBOLS.find((symbol) => symbol.apiId === apiId);
}

// Find a symbol by a human-readable name coming from the extractor.
// The extractor may use spaces or underscores; try a few normalizations.
export function getSymbolByName(name: string): Symbol | undefined {
  if (!name) return undefined;
  const normalize = (s: string) =>
    String(s)
      .toLowerCase()
      .trim()
      .replace(/[\s\-]+/g, '_')
      .replace(/[^a-z0-9_]/g, '');

  const target = normalize(name);

  return (
    SYMBOLS.find((s) => normalize(s.name) === target) ||
    SYMBOLS.find((s) => normalize(s.apiId) === target)
  );
}

// Helper function to get symbol icon path
export function getSymbolIconPath(symbol: Symbol): string {
  return `/el_icons/${symbol.iconFileName}`;
}

// Type for extraction field data
export interface ExtractionData {
  pageNumber: number;
  rows: ExtractionRow[];
}

export interface ExtractionRow {
  id: string;
  symbolId?: string; // References Symbol.id
  nro: string;
  kuvateksti: string;
  suoja: string;
  kaapeli: string;
}

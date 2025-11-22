// Symbol types and data models for electrical diagram analysis

export interface Symbol {
  id: string;
  name: string;
  iconFileName: string; // Filename in /public/el_icons/
}

// Available electrical symbols based on icons in /public/el_icons/
export const SYMBOLS: Symbol[] = [
  {
    id: 'KATKAISIJA_3_4',
    name: '3 ja 4-NAP KATKAISIJA',
    iconFileName: '3 ja 4-NAP KATKAISIJA icon.svg',
  },
  {
    id: 'KYTKINVAROKE_3',
    name: '3-NAP KYTKINVAROKE KVKE',
    iconFileName: '3-NAP KYTKINVAROKE KVKE icon.svg',
  },
  {
    id: 'TULPPAVAROKE_3',
    name: '3-VAIHEINEN TULPPAVAROKE',
    iconFileName: '3-VAIHEINEN TULPPAVAROKE icon.svg',
  },
  {
    id: 'JOHDONSUOJA_1',
    name: 'JOHDONSUOJA 1-NAP',
    iconFileName: 'JOHDONSUOJA 1-NAP icon.svg',
  },
  {
    id: 'JOHDONSUOJA_3',
    name: 'JOHDONSUOJA 3-NAP',
    iconFileName: 'JOHDONSUOJA 3-NAP icon.svg',
  },
  {
    id: 'VIKAVIRTASUOJA',
    name: 'VIKAVIRTASUOJA',
    iconFileName: 'VIKAVIRTASUOJA icon.svg',
  },
  {
    id: 'YHDISTELMASUOJA',
    name: 'YHDISTELMASUOJA',
    iconFileName: 'YHDISTELMASUOJA icon.svg',
  },
];

// Helper function to get symbol by ID
export function getSymbolById(id: string): Symbol | undefined {
  return SYMBOLS.find((symbol) => symbol.id === id);
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

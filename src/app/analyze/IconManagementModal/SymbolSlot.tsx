'use client';

import Image from 'next/image';
import { getSymbolById, getSymbolIconPath } from '../../../models/symbols';

interface SymbolSlotProps {
  symbolId?: string;
  onRequestSelection: () => void;
  onRemove: () => void;
}

export default function SymbolSlot({
  symbolId,
  onRequestSelection,
  onRemove,
}: SymbolSlotProps) {
  const symbol = symbolId ? getSymbolById(symbolId) : undefined;

  if (!symbol) {
    return (
      <button
        onClick={onRequestSelection}
        className="w-32 h-32 flex-shrink-0 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-lg border-2 border-dashed border-gray-500 transition-colors cursor-pointer"
      >
        <span className="text-gray-400 text-sm">Select Icon</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={onRequestSelection}
        className="w-32 h-32 flex-shrink-0 flex flex-col items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-colors cursor-pointer gap-2"
      >
        <Image
          src={getSymbolIconPath(symbol)}
          alt={symbol.name}
          width={64}
          height={64}
          className="object-contain"
        />
        <span className="text-xs text-gray-200 text-center">{symbol.name}</span>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -top-2 -left-2 w-6 h-6 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
        title="Remove symbol"
      >
        <svg
          className="w-4 h-4 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M20 12H4"
          />
        </svg>
      </button>
    </div>
  );
}

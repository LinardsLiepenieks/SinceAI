'use client';

import { Fragment } from 'react';
import SymbolSlot from './SymbolSlot';

interface SymbolComposerProps {
  symbolIds: (string | undefined)[];
  onRequestSelection: (index: number) => void;
  onAddSymbol: () => void;
  onRemoveSymbol: (index: number) => void;
}

export default function SymbolComposer({
  symbolIds,
  onRequestSelection,
  onAddSymbol,
  onRemoveSymbol,
}: SymbolComposerProps) {
  return (
    <div className="px-8 py-6 flex flex-col items-center gap-6">
      <div className="flex items-center overflow-x-auto max-w-full px-2 py-4 [&::-webkit-scrollbar]:h-[3px] [&::-webkit-scrollbar-track]:bg-gray-700 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full">
        {symbolIds.map((symbolId, index) => (
          <Fragment key={index}>
            <SymbolSlot
              symbolId={symbolId}
              onRequestSelection={() => onRequestSelection(index)}
              onRemove={() => onRemoveSymbol(index)}
            />
            {index < symbolIds.length - 1 && (
              <div className="w-8 h-0.5 bg-gray-500 flex-shrink-0" />
            )}
          </Fragment>
        ))}
        <button
          onClick={onAddSymbol}
          className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer ml-4"
          title="Add another symbol"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

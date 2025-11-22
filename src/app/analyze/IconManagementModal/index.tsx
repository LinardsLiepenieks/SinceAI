'use client';

import { useState } from 'react';
import Image from 'next/image';
import { SYMBOLS, getSymbolIconPath } from '../../../models/symbols';
import SymbolComposer from './SymbolComposer';

interface IconManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcons: (iconIds: string[]) => void;
  currentIcons?: string[];
}

export default function IconManagementModal({
  isOpen,
  onClose,
  onSelectIcons,
  currentIcons = [],
}: IconManagementModalProps) {
  const [isSelectingIcon, setIsSelectingIcon] = useState(false);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number>(0);
  const [symbolIds, setSymbolIds] = useState<(string | undefined)[]>(
    currentIcons.length > 0 ? currentIcons : [undefined]
  );

  if (!isOpen) return null;

  const handleIconClick = (iconId: string) => {
    const newSymbolIds = [...symbolIds];
    newSymbolIds[currentEditingIndex] = iconId;
    setSymbolIds(newSymbolIds);
    const validIcons = newSymbolIds.filter(
      (id): id is string => id !== undefined
    );
    onSelectIcons(validIcons);
    setIsSelectingIcon(false);
  };

  const handleAddSymbol = () => {
    setSymbolIds([...symbolIds, undefined]);
  };

  const handleRemoveSymbol = (index: number) => {
    const newSymbolIds = symbolIds.filter((_, i) => i !== index);
    // Keep at least one slot
    if (newSymbolIds.length === 0) {
      setSymbolIds([undefined]);
      onSelectIcons([]);
    } else {
      setSymbolIds(newSymbolIds);
      const validIcons = newSymbolIds.filter(
        (id): id is string => id !== undefined
      );
      onSelectIcons(validIcons);
    }
  };

  const handleClose = () => {
    setIsSelectingIcon(false);
    onClose();
  };

  // First screen: Show current icon
  if (!isSelectingIcon) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Current Symbol</h2>
              <button
                onClick={handleClose}
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <SymbolComposer
            symbolIds={symbolIds}
            onRequestSelection={(index: number) => {
              setCurrentEditingIndex(index);
              setIsSelectingIcon(true);
            }}
            onAddSymbol={handleAddSymbol}
            onRemoveSymbol={handleRemoveSymbol}
          />

          <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Second screen: Icon selection grid
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Select Symbol</h2>
            <button
              onClick={handleClose}
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {SYMBOLS.map((symbol) => (
              <button
                key={symbol.id}
                onClick={() => handleIconClick(symbol.id)}
                className="p-4 rounded-lg border-2 transition-all border-gray-600 bg-gray-700 hover:border-gray-500"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 flex items-center justify-center">
                    <Image
                      src={getSymbolIconPath(symbol)}
                      alt={symbol.name}
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-xs text-gray-300 text-center">
                    {symbol.name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 flex justify-between gap-3">
          <button
            onClick={() => setIsSelectingIcon(false)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

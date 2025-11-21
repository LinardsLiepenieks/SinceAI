'use client';

import { SYMBOLS, SymbolCategory } from '@/models/symbols';

interface IconManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (iconId: string) => void;
  currentIcon?: string;
}

export default function IconManagementModal({
  isOpen,
  onClose,
  onSelectIcon,
  currentIcon,
}: IconManagementModalProps) {
  if (!isOpen) return null;

  const handleIconClick = (iconId: string) => {
    onSelectIcon(iconId);
    onClose();
  };

  const categories = Object.values(SymbolCategory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Select Symbol</h2>
            <button
              onClick={onClose}
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
          {categories.map((category) => {
            const categorySymbols = SYMBOLS.filter(
              (s) => s.category === category
            );
            if (categorySymbols.length === 0) return null;

            return (
              <div key={category} className="mb-6">
                <h3 className="text-lg font-semibold text-gray-300 mb-3">
                  {category}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categorySymbols.map((symbol) => (
                    <button
                      key={symbol.id}
                      onClick={() => handleIconClick(symbol.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        currentIcon === symbol.id
                          ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                          : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-gray-600 rounded flex items-center justify-center text-white font-bold text-lg">
                          {symbol.id}
                        </div>
                        <div className="text-xs text-gray-300 text-center">
                          {symbol.name}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

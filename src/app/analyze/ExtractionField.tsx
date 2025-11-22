'use client';

import { useState, Fragment } from 'react';
import Image from 'next/image';
import IconManagementModal from './IconManagementModal';
import { getSymbolById, getSymbolIconPath } from '@/models/symbols';

interface ExtractionFieldProps {
  pageIndex: number;
}

export default function ExtractionField({ pageIndex }: ExtractionFieldProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIcons, setSelectedIcons] = useState<string[]>([]);

  const handleIconsSelect = (iconIds: string[]) => {
    setSelectedIcons(iconIds);
  };

  return (
    <>
      <div className="flex h-12 text-white px-4 items-center gap-4 flex-shrink-0 border border-gray-500">
        {/* ICON */}
        <div className="flex items-center h-full" style={{ width: '164px' }}>
          <div className="flex items-center overflow-x-auto overflow-y-hidden flex-1 h-full [&::-webkit-scrollbar]:h-[3px] [&::-webkit-scrollbar-track]:bg-gray-700 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-none">
            {selectedIcons.length > 0
              ? selectedIcons.map((iconId, index) => {
                  const symbol = getSymbolById(iconId);
                  return symbol ? (
                    <div
                      key={index}
                      className="w-12 h-12 flex items-center justify-center overflow-hidden flex-shrink-0"
                    >
                      <Image
                        src={getSymbolIconPath(symbol)}
                        alt={symbol.name}
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    </div>
                  ) : null;
                })
              : null}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-7 h-7 bg-gray-600 hover:bg-gray-500 rounded flex-shrink-0 flex items-center justify-center text-white text-sm font-bold transition-colors cursor-pointer overflow-hidden p-0.5 ml-1"
            title="Click to manage symbols"
          >
            {selectedIcons.length === 0 ? '+' : '+'}
          </button>
        </div>

        {/* NRo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <input
            type="text"
            maxLength={4}
            className="w-16 text-sm px-2 py-1 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 placeholder-gray-400"
            placeholder="####"
          />
        </div>

        {/* Kuvateksti */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <input
            type="text"
            className="w-64 text-sm px-2 py-1 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 placeholder-gray-400"
            placeholder="Enter description..."
          />
        </div>

        {/* Suoja */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <input
            type="text"
            maxLength={6}
            className="w-20 text-sm px-2 py-1 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 placeholder-gray-400"
            placeholder="######"
          />
        </div>

        {/* Kaapeli */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <input
            type="text"
            maxLength={14}
            className="w-36 text-sm px-2 py-1 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 placeholder-gray-400"
            placeholder="##############"
          />
        </div>
      </div>

      <IconManagementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectIcons={handleIconsSelect}
        currentIcons={selectedIcons}
      />
    </>
  );
}

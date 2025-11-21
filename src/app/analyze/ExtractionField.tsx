'use client';

interface ExtractionFieldProps {
  pageIndex: number;
}

export default function ExtractionField({ pageIndex }: ExtractionFieldProps) {
  return (
    <div className=" w-full flex h-10 text-white px-4 items-center border border-gray-500 border-solid">
      <label className="text-sm font-medium text-white whitespace-nowrap flex-shrink-0">
        INPUT TITLE
      </label>
      <input
        type="text"
        className="flex-1 text-xs px-4  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter extracted data..."
      />
    </div>
  );
}

'use client';

interface NavbarProps {
  isPdfVisible: boolean;
  onTogglePdf: () => void;
}

export default function Navbar({ isPdfVisible, onTogglePdf }: NavbarProps) {
  return (
    <div className="h-16 bg-gray-800 text-white flex items-center px-4">
      <span className="text-xl font-bold">NAVBAR</span>
      <button
        onClick={onTogglePdf}
        className="ml-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded transition-colors"
      >
        {isPdfVisible ? 'Hide PDF' : 'Show PDF'}
      </button>
    </div>
  );
}

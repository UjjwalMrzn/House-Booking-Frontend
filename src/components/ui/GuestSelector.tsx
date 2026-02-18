import React from 'react';

interface GuestSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const GuestSelector: React.FC<GuestSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <span className="font-bold text-gray-700 ml-2">Traveling with</span>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => onChange(Math.max(1, value - 1))} 
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 font-bold hover:border-brand-green transition-all shadow-sm"
        >
          -
        </button>
        <span className="font-bold w-4 text-center">{value}</span>
        <button 
          onClick={() => onChange(value + 1)} 
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 font-bold hover:border-brand-green transition-all shadow-sm"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default GuestSelector;
import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface GuestSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

const GuestSelector: React.FC<GuestSelectorProps> = ({ 
  value, 
  onChange, 
  min = 1, 
  max = 10,
  className = "" 
}) => {
  // RULE: Design CSS Once. 
  // Box layout, padding, and rounding exactly match the Universal Input Pattern.
  const boxBaseStyles = "peer block w-full px-4 pt-6 pb-2 bg-white border border-gray-200 rounded-xl transition-all flex items-center justify-between group-hover:border-gray-300 select-none";

  return (
    <div className={`relative w-full group ${className}`}>
      <div className="relative">
        <div className={boxBaseStyles}>
          {/* Display Value */}
          <span className="text-sm font-bold text-gray-900">
            {value} Guest{value > 1 ? 's' : ''}
          </span>

          {/* Controls - Standardized Slim Style */}
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => { e.preventDefault(); onChange(Math.max(min, value - 1)); }}
              disabled={value <= min}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-brand-dark disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-gray-100"
            >
              <Minus size={14} strokeWidth={3} />
            </button>
            
            <button
              onClick={(e) => { e.preventDefault(); onChange(Math.min(max, value + 1)); }}
              disabled={value >= max}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-green/5 hover:bg-brand-green hover:text-white text-brand-green disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-brand-green/10"
            >
              <Plus size={14} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* RULE: Floating Label - Exact match to Input system. */}
        <label className="absolute text-sm text-gray-400 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 font-medium pointer-events-none">
          Guests
        </label>
      </div>
    </div>
  );
};

export default GuestSelector;
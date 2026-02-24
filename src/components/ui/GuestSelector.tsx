// import React from 'react';
import { Minus, Plus } from 'lucide-react';

const GuestSelector = ({ value, onChange, min = 1, max = 10, className = "" }: any) => {
  // FIXED: Scaled to 56px (h-[56px])
  const boxBaseStyles = "peer block w-full h-[56px] px-4 pt-5 pb-1.5 bg-white border border-gray-200 rounded-xl transition-all flex items-center justify-between group-hover:border-gray-300 select-none";

  return (
    <div className={`relative w-full group ${className}`}>
      <div className="relative">
        <div className={boxBaseStyles}>
          <span className="text-[14px] font-normal text-gray-900">
            {value} Guest{value > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            {/* Slightly increased button sizes to match the 56px height */}
            <button onClick={(e) => { e.preventDefault(); onChange(Math.max(min, value - 1)); }} disabled={value <= min} className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-50 border border-gray-100 text-gray-400 disabled:opacity-20">
              <Minus size={14} strokeWidth={3} />
            </button>
            <button onClick={(e) => { e.preventDefault(); onChange(Math.min(max, value + 1)); }} disabled={value >= max} className="w-8 h-8 flex items-center justify-center rounded-md bg-brand-green/5 border border-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white transition-all">
              <Plus size={14} strokeWidth={3} />
            </button>
          </div>
        </div>
        <label className="absolute text-[12px] text-gray-400 duration-150 transform -translate-y-2.5 scale-75 top-3.5 z-10 origin-[0] left-4 font-medium pointer-events-none">
          Guests
        </label>
      </div>
    </div>
  );
};

export default GuestSelector;
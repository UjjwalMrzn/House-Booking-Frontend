import { Minus, Plus } from 'lucide-react';

const GuestSelector = ({ value, onChange, min = 1, max = 10, className = "" }: any) => {
  const currentVal = Number(value) || 1;
  const currentMax = Number(max) || 10;
  const currentMin = Number(min) || 1;

  const boxBaseStyles = "peer block w-full h-[56px] px-4 pt-5 pb-1.5 bg-white border border-gray-200 rounded-xl transition-all flex items-center justify-between group-hover:border-gray-300 select-none";

  return (
    <div className={`relative w-full group ${className}`}>
      <div className="relative">
        <div className={boxBaseStyles}>
          <div className="flex flex-col items-start">
            <span className="text-[14px] font-normal text-gray-900 leading-none">
              {currentVal} Guest{currentVal > 1 ? 's' : ''}
            </span>
            {currentVal >= currentMax && (
              <span className="text-[9px] font-black uppercase text-amber-600 tracking-tighter mt-1">
                Maximum capacity reached
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.preventDefault(); onChange(currentVal - 1); }} 
              disabled={currentVal <= currentMin} 
              className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-50 border border-gray-100 text-gray-400 disabled:opacity-20 transition-all"
            >
              <Minus size={14} strokeWidth={3} />
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); onChange(currentVal + 1); }} 
              disabled={currentVal >= currentMax} 
              className="w-8 h-8 flex items-center justify-center rounded-md bg-brand-green/5 border border-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white transition-all disabled:opacity-20 disabled:pointer-events-none"
            >
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
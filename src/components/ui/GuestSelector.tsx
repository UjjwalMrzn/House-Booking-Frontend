import { useState, useRef, useEffect } from 'react';
import { Minus, Plus, Users, ChevronDown } from 'lucide-react';

interface GuestSelectorProps {
  adults: number;
  kids: number;
  onAdultsChange: (val: number) => void;
  onKidsChange: (val: number) => void;
  max: number;
  className?: string;
}

const GuestSelector = ({ adults, kids, onAdultsChange, onKidsChange, max = 10, className = "" }: GuestSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalGuests = adults + kids;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const StepperRow = ({ title, sub, val, onIncrease, onDecrease, minAllowed }: any) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <div className="text-sm font-bold text-gray-900">{title}</div>
        {/* SURGICAL FIX: Contrast changed from text-gray-400 to text-gray-500 */}
        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{sub}</div>
      </div>
      <div className="flex items-center gap-3">
        <button 
          type="button"
          onClick={onDecrease} 
          disabled={val <= minAllowed} 
          className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-50 border border-gray-100 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <Minus size={14} strokeWidth={3} />
        </button>
        <span className="w-4 text-center font-normal text-[14px] text-gray-900">{val}</span>
        <button 
          type="button"
          onClick={onIncrease} 
          disabled={totalGuests >= max} 
          className="w-8 h-8 flex items-center justify-center rounded-md bg-brand-green/5 border border-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <Plus size={14} strokeWidth={3} />
        </button>
      </div>
    </div>
  );

  return (
    <div className={`relative w-full group ${className}`} ref={dropdownRef}>
      <div className="relative">
        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
          className={`peer block w-full h-[56px] px-4 pt-5 pb-1.5 bg-white border rounded-xl transition-all flex items-center justify-between hover:border-gray-300 select-none text-left focus:outline-none
            ${isOpen ? 'border-brand-green ring-1 ring-brand-green/20' : 'border-gray-200'}
          `}
        >
          {/* RESTORED: font-normal, text-gray-900, matching exact original layout */}
          <div className="flex flex-col items-start">
            <span className="text-[14px] font-normal text-gray-900 leading-none">
              {totalGuests} Guest{totalGuests !== 1 ? 's' : ''}
            </span>
          </div>
          {/* SURGICAL FIX: Contrast changed from text-gray-400 to text-gray-500 */}
          <div className="flex items-center text-gray-500 shrink-0 ml-2">
            <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-green' : ''}`} />
          </div>
        </button>
        
        {/* SURGICAL FIX: Contrast changed from text-gray-400 to text-gray-500 */}
        <label className="absolute text-[12px] text-gray-500 duration-150 transform -translate-y-2.5 scale-75 top-3.5 z-10 origin-[0] left-4 font-medium pointer-events-none">
          Guests
        </label>
      </div>

      {isOpen && (
        <div className="absolute top-[64px] left-0 w-full min-w-[280px] bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100 p-4 z-50 animate-fade-in">
          
          {/* SURGICAL FIX: Contrast changed from text-gray-400 to text-gray-500 */}
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100 text-gray-500">
            <Users size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Maximum capacity: {max}</span>
          </div>

          <StepperRow 
            title="Adults" sub="Ages 13 or above" 
            val={adults} minAllowed={1}
            onDecrease={(e: any) => { e.preventDefault(); onAdultsChange(adults - 1); }}
            onIncrease={(e: any) => { e.preventDefault(); onAdultsChange(adults + 1); }}
          />
          <StepperRow 
            title="Children" sub="Ages 2–12" 
            val={kids} minAllowed={0}
            onDecrease={(e: any) => { e.preventDefault(); onKidsChange(kids - 1); }}
            onIncrease={(e: any) => { e.preventDefault(); onKidsChange(kids + 1); }}
          />
        </div>
      )}
    </div>
  );
};

export default GuestSelector;
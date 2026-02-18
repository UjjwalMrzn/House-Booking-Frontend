import { useState, useRef, useEffect } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import type { DateRange } from 'react-day-picker';
import { format, parseISO } from 'date-fns';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
  value?: { checkIn: string; checkOut: string };
  onChange?: (range: DateRange | undefined) => void;
  className?: string;
}

const DatePicker = ({ value, onChange, className }: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const range: DateRange | undefined = value?.checkIn ? {
    from: parseISO(value.checkIn),
    to: value.checkOut ? parseISO(value.checkOut) : undefined
  } : undefined;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // RULE: Box Design Designed Once. 
  // Padding (pt-6 pb-2), Rounding (rounded-xl), and Font weight matched to standard Input.
  const boxBaseStyles = "peer block w-full px-4 pt-6 pb-2 text-sm font-bold text-gray-900 bg-white border border-gray-200 rounded-xl transition-all cursor-pointer flex items-center justify-between focus:outline-none focus:ring-0 select-none";
  const boxActiveStyles = isOpen ? "border-brand-green ring-1 ring-brand-green/20" : "hover:border-gray-300";

  return (
    <div className={`relative w-full group ${className}`} ref={containerRef}>
      <div className="relative">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={`${boxBaseStyles} ${boxActiveStyles}`}
          tabIndex={0}
        >
          <span className={range?.from ? 'text-brand-dark' : 'text-gray-400'}>
            {range?.from ? format(range.from, 'd MMM yyyy') : "Arrival"}
          </span>

          <ArrowRight size={14} className="text-gray-300 mx-2" />

          <div className="flex items-center gap-2">
            <span className={range?.to ? 'text-brand-dark' : 'text-gray-400'}>
              {range?.to ? format(range.to, 'd MMM yyyy') : "Departure"}
            </span>
            
            {range && (range.from || range.to) && (
              <button 
                className="ml-1 p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onChange?.(undefined); 
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* RULE: Label designed once. Exact match to Input system. */}
        <label className="absolute text-sm text-gray-400 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 font-medium pointer-events-none">
          Dates
        </label>
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-white shadow-2xl rounded-[2rem] border border-gray-100 p-6 z-[9999] min-w-[320px] md:min-w-[650px] animate-entrance">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={(newRange) => {
              onChange?.(newRange);
              if (newRange?.from && newRange?.to) setIsOpen(false);
            }}
            numberOfMonths={window.innerWidth > 768 ? 2 : 1}
            showOutsideDays
            fromDate={new Date()}
          />
        </div>
      )}
    </div>
  );
};

export default DatePicker;
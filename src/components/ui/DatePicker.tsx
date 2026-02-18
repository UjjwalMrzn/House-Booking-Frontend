import { useState, useRef, useEffect } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import type { DateRange } from 'react-day-picker';
import { format, parseISO } from 'date-fns';
import SearchInput from './SearchInput';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
  value?: { checkIn: string; checkOut: string };
  onChange?: (range: DateRange | undefined) => void;
}

const DatePicker = ({ value, onChange }: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal range with passed values
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

  return (
    <div className="relative flex-1" ref={containerRef}>
      {/* Wrapper to ensure click opens the calendar */}
      <div 
        className="cursor-pointer" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <SearchInput 
          label="Dates" 
          className={isOpen ? "bg-gray-50 ring-1 ring-brand-green/20" : ""}
        >
          <div className="flex items-center w-full justify-between">
            <span className={`text-sm font-semibold tracking-tight ${range?.from ? 'text-brand-dark' : 'text-gray-400'}`}>
              {range?.from ? format(range.from, 'd MMM yyyy') : "Arrival"}
            </span>
            <ArrowRight size={14} className="mx-4 text-gray-300" />
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold tracking-tight ${range?.to ? 'text-brand-dark' : 'text-gray-400'}`}>
                {range?.to ? format(range.to, 'd MMM yyyy') : "Departure"}
              </span>
              {range && (range.from || range.to) && (
                <X 
                  size={14} 
                  className="ml-2 text-gray-300 hover:text-red-500 transition-colors" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onChange?.(undefined); 
                  }} 
                />
              )}
            </div>
          </div>
        </SearchInput>
      </div>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-white shadow-2xl rounded-2xl border border-gray-100 p-6 z-[9999] min-w-[320px] md:min-w-[650px] animate-entrance">
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
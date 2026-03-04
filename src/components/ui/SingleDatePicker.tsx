import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import 'react-day-picker/dist/style.css';

interface SingleDatePickerProps {
  label: string;
  value: string; // Expects YYYY-MM-DD
  onChange: (date: string) => void;
}

const SingleDatePicker = ({ label, value, onChange }: SingleDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? parseISO(value) : undefined;

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
    <div className="relative w-full group" ref={containerRef}>
      <div className="relative">
        <div 
          onClick={() => setIsOpen(!isOpen)} 
          className={`peer block w-full h-[56px] px-4 pt-5 pb-1.5 text-[14px] font-normal bg-white border border-gray-200 rounded-xl transition-all cursor-pointer flex items-center justify-between select-none ${isOpen ? 'border-brand-green ring-1 ring-brand-green/20' : 'hover:border-gray-300'}`}
        >
          <span className={value ? 'text-brand-dark font-medium' : 'text-gray-400'}>
            {value ? format(selectedDate!, 'dd MMM yyyy') : 'Select date...'}
          </span>
          <CalendarIcon size={16} className={`transition-colors ${isOpen ? 'text-brand-green' : 'text-gray-400'}`} />
        </div>
        <label className="absolute text-[12px] text-gray-400 duration-150 transform -translate-y-2.5 scale-75 top-3.5 z-10 origin-[0] left-4 font-medium pointer-events-none">
          {label}
        </label>
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] rounded-2xl border border-gray-100 p-4 z-[99999] animate-entrance origin-top">
          <style>{`
            .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
              background-color: var(--color-brand-green) !important;
              color: white !important;
              font-weight: 900 !important;
              border-radius: 50% !important;
            }
          `}</style>
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                onChange(format(date, 'yyyy-MM-dd'));
                setIsOpen(false);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SingleDatePicker;
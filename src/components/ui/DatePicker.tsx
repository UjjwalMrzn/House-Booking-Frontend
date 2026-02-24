import { useState, useRef, useEffect } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format, parseISO } from 'date-fns';
import 'react-day-picker/dist/style.css';

const DatePicker = ({ value, onChange, className }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropDirection, setDropDirection] = useState<'down' | 'up'>('down');
  
  // FIXED LOGIC: Tracking the hovered date to render the selection gap
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const range = value?.checkIn ? {
    from: parseISO(value.checkIn),
    to: value.checkOut ? parseISO(value.checkOut) : undefined
  } : undefined;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHoveredDate(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOpen = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropDirection(spaceBelow < 420 ? 'up' : 'down');
    }
    if (isOpen) setHoveredDate(null);
    setIsOpen(!isOpen);
  };

  const boxBaseStyles = "peer block w-full h-[56px] px-4 pt-5 pb-1.5 text-[14px] font-normal text-gray-900 bg-white border border-gray-200 rounded-xl transition-all cursor-pointer flex items-center justify-between focus:outline-none focus:ring-0 select-none";
  const boxActiveStyles = isOpen ? "border-brand-green ring-1 ring-brand-green/20" : "hover:border-gray-300";

  // Helper to strip time for accurate day comparison
  const normalizeDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  return (
    <div className={`relative w-full group ${className}`} ref={containerRef}>
      <div className="relative">
        <div onClick={toggleOpen} className={`${boxBaseStyles} ${boxActiveStyles}`} tabIndex={0}>
          <span className={range?.from ? 'text-gray-900' : 'text-gray-400'}>
            {range?.from ? format(range.from, 'd MMM yyyy') : "Arrival"}
          </span>
          <ArrowRight size={14} className="text-gray-300 mx-1" />
          <div className="flex items-center gap-2">
            <span className={range?.to ? 'text-gray-900' : 'text-gray-400'}>
              {range?.to ? format(range.to, 'd MMM yyyy') : "Departure"}
            </span>
            {range && (range.from || range.to) && (
              <button className="ml-1 p-1 hover:bg-gray-100 rounded-full text-gray-400" onClick={(e) => { 
                e.stopPropagation(); 
                onChange?.(undefined); 
                setHoveredDate(null); 
              }}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        <label className="absolute text-[12px] text-gray-400 duration-150 transform -translate-y-2.5 scale-75 top-3.5 z-10 origin-[0] left-4 font-medium pointer-events-none">
          Dates
        </label>
      </div>

      {isOpen && (
        <div 
          className={`absolute ${dropDirection === 'up' ? 'bottom-[calc(100%+12px)]' : 'top-[calc(100%+12px)]'} left-1/2 -translate-x-1/2 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.2)] rounded-[2rem] border border-gray-100 p-6 z-[99999] min-w-[320px] md:min-w-[600px] animate-entrance`}
        >
          <DayPicker 
            mode="range" 
            selected={range} 
            onSelect={(newRange) => { 
              onChange?.(newRange); 
              if (newRange?.from && newRange?.to) {
                setIsOpen(false); 
                setHoveredDate(null);
              }
            }} 
            numberOfMonths={window.innerWidth > 768 ? 2 : 1} 
            fromDate={new Date()}
            // FIXED: Hover logic to trigger design-locked selection gap classes
            onDayMouseEnter={(date) => {
              if (range?.from && !range?.to) setHoveredDate(date);
            }}
            onDayMouseLeave={() => setHoveredDate(null)}
            modifiers={{
              hoverRange: (date) => {
                if (!range?.from || range?.to || !hoveredDate) return false;
                const d = normalizeDate(date), f = normalizeDate(range.from), h = normalizeDate(hoveredDate);
                return d > Math.min(f, h) && d < Math.max(f, h);
              },
              hoverEnd: (date) => {
                if (!range?.from || range?.to || !hoveredDate) return false;
                return normalizeDate(date) === normalizeDate(hoveredDate);
              }
            }}
            modifiersClassNames={{
              hoverRange: "rdp-day_range_middle", // Triggers existing light green middle CSS
              hoverEnd: "rdp-day_selected"       // Triggers existing solid green circle CSS
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DatePicker;
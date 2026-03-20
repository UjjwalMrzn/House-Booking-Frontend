import { useState, useRef, useEffect } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useToast } from './Toaster';
import 'react-day-picker/dist/style.css';

const DatePicker = ({ value, onChange, className, disabledDates = [], holidayDates = [], schoolHolidayDates = [] }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropDirection, setDropDirection] = useState<'down' | 'up'>('down');
  const [horizontalAlign, setHorizontalAlign] = useState<'center' | 'left' | 'right'>('center');
  
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

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
      const spaceAbove = rect.top;

      // SURGICAL FIX: Flawless Vertical Math
      if (spaceBelow < 420 && spaceAbove > spaceBelow) {
        setDropDirection('up');
      } else {
        setDropDirection('down');
      }

      // SURGICAL FIX: Flawless Horizontal Math
      const dropdownWidth = window.innerWidth > 768 ? 620 : 320;
      const centerSpill = (dropdownWidth - rect.width) / 2;

      if (rect.left - centerSpill < 20) {
        setHorizontalAlign('left'); 
      } else if (rect.right + centerSpill > window.innerWidth - 20) {
        setHorizontalAlign('right'); 
      } else {
        setHorizontalAlign('center'); 
      }
    }
    
    if (isOpen) setHoveredDate(null);
    setIsOpen(!isOpen);
  };

  const boxBaseStyles = "peer block w-full h-[56px] px-4 pt-5 pb-1.5 text-[14px] font-normal text-gray-900 bg-white border border-gray-200 rounded-xl transition-all cursor-pointer flex items-center justify-between focus:outline-none focus:ring-0 select-none";
  const boxActiveStyles = isOpen ? "border-brand-green ring-1 ring-brand-green/20" : "hover:border-gray-300";

  const normalizeDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  const getAlignClass = () => {
    if (horizontalAlign === 'left') return 'left-0';
    if (horizontalAlign === 'right') return 'right-0';
    return 'left-1/2 -translate-x-1/2';
  };

  return (
    <div className={`relative w-full group ${className}`} ref={containerRef}>
      <div className="relative">
        <div onClick={toggleOpen} className={`${boxBaseStyles} ${boxActiveStyles}`} tabIndex={0}>
          <span className={range?.from ? 'text-gray-900' : 'text-gray-500'}>
            {range?.from ? format(range.from, 'd MMM yyyy') : "Check-In"}
          </span>
          <ArrowRight size={14} className="text-gray-400 mx-1" />
          <div className="flex items-center gap-2">
            <span className={range?.to ? 'text-gray-900' : 'text-gray-500'}>
              {range?.to ? format(range.to, 'd MMM yyyy') : "Check-Out"}
            </span>
            {range && (range.from || range.to) && (
              <button className="ml-1 p-1 hover:bg-gray-100 rounded-full text-gray-500" onClick={(e) => { 
                e.stopPropagation(); 
                onChange?.(undefined); 
                setHoveredDate(null); 
              }}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        <label className="absolute text-[12px] text-gray-500 duration-150 transform -translate-y-2.5 scale-75 top-3.5 z-10 origin-[0] left-4 font-medium pointer-events-none">
          Dates
        </label>
      </div>

      {isOpen && (
        <div 
          className={`absolute ${dropDirection === 'up' ? 'bottom-[calc(100%+12px)]' : 'top-[calc(100%+12px)]'} ${getAlignClass()} bg-white shadow-[0_30px_80px_rgba(0,0,0,0.12)] rounded-[2.5rem] border border-gray-100 p-8 z-[99999] min-w-[320px] md:min-w-[620px] animate-entrance`}
        >
          <style>{`
            .rdp-day_weekend {
              color: #3b82f6 !important; 
              font-weight: 900 !important;
            }
            .rdp-day_holiday { 
              color: #8b5cf6 !important; 
              font-weight: 900 !important;
            }
            .rdp-day_school_holiday {
              color: #14b8a6 !important;
              font-weight: 900 !important;
            }
            .rdp-day_booked { 
              color: #ef4444 !important; 
              background-color: transparent !important; 
              opacity: 1 !important;
              font-weight: 900 !important;
              cursor: not-allowed !important;
            }
          `}</style>

          <DayPicker 
            mode="range" 
            selected={range} 
            onSelect={(newRange) => { 
              if (newRange?.from && newRange?.to) {
                const nights = differenceInDays(newRange.to, newRange.from);
                if (nights < 2) {
                  toast.info("Minimum 2 nights required for booking."); 
                  onChange?.({ from: newRange.from, to: undefined });
                  return;
                }

                onChange?.(newRange); 
                setIsOpen(false); 
                setHoveredDate(null);
              } else {
                onChange?.(newRange);
              }
            }} 
            numberOfMonths={window.innerWidth > 768 ? 2 : 1} 
            fromDate={new Date()}
            disabled={[{ before: new Date() }, ...disabledDates]}
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
              },
              weekend: { dayOfWeek: [0, 6] },
              booked: disabledDates,
              holiday: holidayDates,
              schoolHoliday: schoolHolidayDates
            }}
            modifiersClassNames={{
              hoverRange: "rdp-day_range_middle", 
              hoverEnd: "rdp-day_selected",
              weekend: "rdp-day_weekend", 
              booked: "rdp-day_booked",
              holiday: "rdp-day_holiday",
              schoolHoliday: "rdp-day_school_holiday"
            }}
            components={{
              DayContent: (props) => {
                const isBooked = disabledDates.some((dRange: any) => 
                  props.date >= dRange.from && props.date <= dRange.to
                );
                return (
                  <span title={isBooked ? "Date already reserved" : undefined}>
                    {props.date.getDate()}
                  </span>
                );
              }
            }}
          />

          {/* SURGICAL FIX: Changed gap-x-5 md:gap-10 to gap-x-4 md:gap-x-6 so all 5 items fit on one line perfectly */}
          <div className="mt-8 pt-6 border-t border-gray-50 flex flex-wrap items-center justify-center gap-y-3 gap-x-4 md:gap-x-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-green shadow-sm ring-4 ring-brand-green/10"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-brand-dark opacity-70">Pick Dates</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm ring-4 ring-blue-50"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-500">Weekend</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm ring-4 ring-purple-50"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-purple-500">Holiday</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-sm ring-4 ring-teal-50"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-teal-500">School Holiday</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm ring-4 ring-red-50"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-red-500">Reserved</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
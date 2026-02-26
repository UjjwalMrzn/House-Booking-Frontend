import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown } from 'lucide-react';

interface TimePickerProps {
  label?: string;
  value: string; // Expects "HH:mm" (24h format for the backend)
  onChange: (value: string) => void;
  required?: boolean;
}

// Arrays for our Dual-Pane Grid
const HOURS = ['12', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'];
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

const TimePicker: React.FC<TimePickerProps> = ({ label, value, onChange, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse the current value to figure out Hour, Minute, and AM/PM
  const safeValue = value || '12:00'; 
  const parsedHour24 = parseInt(safeValue.split(':')[0], 10);
  const currentMinute = safeValue.split(':')[1] || '00';
  
  const currentPeriod = parsedHour24 >= 12 ? 'PM' : 'AM';
  const currentHour12 = parsedHour24 % 12 === 0 ? 12 : parsedHour24 % 12;
  const currentHourStr = currentHour12.toString().padStart(2, '0');

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update the time and convert back to Django's 24-hour format
  const updateTime = (newH12: string, newM: string, newPeriod: string) => {
    let h24 = parseInt(newH12, 10);
    if (newPeriod === 'PM' && h24 !== 12) h24 += 12;
    if (newPeriod === 'AM' && h24 === 12) h24 = 0;
    
    onChange(`${h24.toString().padStart(2, '0')}:${newM}`);
  };

  // Format the visual label (e.g., "14:30" becomes "02:30 PM")
  const formatDisplayValue = (val: string) => {
    if (!val) return 'Select time...';
    const [h, m] = val.split(':');
    const hInt = parseInt(h, 10);
    const period = hInt >= 12 ? 'PM' : 'AM';
    const h12 = hInt === 0 ? 12 : (hInt > 12 ? hInt - 12 : hInt);
    return `${h12.toString().padStart(2, '0')}:${m} ${period}`;
  };

  return (
    <div className="space-y-2 w-full relative" ref={dropdownRef}>
      {label && (
        <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3.5 flex items-center justify-between bg-white border rounded-xl text-sm font-bold outline-none transition-all ${
          isOpen 
            ? 'border-brand-green ring-4 ring-brand-green/10' 
            : 'border-gray-200 hover:border-gray-300 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          <Clock size={18} className={value ? 'text-brand-green' : 'text-gray-400'} />
          <span className={value ? 'text-brand-dark' : 'text-gray-400'}>
            {formatDisplayValue(value)}
          </span>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* COMPACT DUAL-PANE MENU */}
      {isOpen && (
        <div className="absolute z-[120] top-full left-0 w-full min-w-[280px] mt-2 bg-white border border-gray-100 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden animate-fade-in origin-top">
          
          {/* AM / PM TABS (Slimmer padding) */}
          <div className="flex p-1.5 bg-gray-50/80 border-b border-gray-100">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); updateTime(currentHourStr, currentMinute, 'AM'); }}
              className={`flex-1 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all ${
                currentPeriod === 'AM' 
                  ? 'bg-white text-brand-dark shadow-sm ring-1 ring-gray-200/50' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              AM
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); updateTime(currentHourStr, currentMinute, 'PM'); }}
              className={`flex-1 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all ${
                currentPeriod === 'PM' 
                  ? 'bg-white text-brand-dark shadow-sm ring-1 ring-gray-200/50' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              PM
            </button>
          </div>

          {/* DUAL GRID: HOURS (Left) and MINUTES (Right) */}
          <div className="flex p-2 gap-2">
            
            {/* HOURS COLUMN */}
            <div className="flex-1">
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center mb-1.5">Hour</div>
              <div className="grid grid-cols-3 gap-1">
                {HOURS.map((h) => {
                  const isSelected = value && currentHourStr === h;
                  return (
                    <button
                      key={`h-${h}`}
                      type="button"
                      onClick={() => updateTime(h, currentMinute, currentPeriod)}
                      className={`py-1.5 rounded-lg text-[11px] transition-all ${
                        isSelected
                          ? 'bg-brand-green text-white font-black shadow-md shadow-brand-green/30 scale-105'
                          : 'bg-gray-50 border border-transparent text-gray-600 font-bold hover:bg-brand-green/10 hover:text-brand-green'
                      }`}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DIVIDER */}
            <div className="w-px bg-gray-100 rounded-full"></div>

            {/* MINUTES COLUMN */}
            <div className="flex-1">
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center mb-1.5">Minute</div>
              <div className="grid grid-cols-3 gap-1">
                {MINUTES.map((m) => {
                  const isSelected = value && currentMinute === m;
                  return (
                    <button
                      key={`m-${m}`}
                      type="button"
                      onClick={() => {
                        updateTime(currentHourStr, m, currentPeriod);
                        setIsOpen(false); // Auto-close when they pick the exact minute
                      }}
                      className={`py-1.5 rounded-lg text-[11px] transition-all ${
                        isSelected
                          ? 'bg-brand-green text-white font-black shadow-md shadow-brand-green/30 scale-105'
                          : 'bg-gray-50 border border-transparent text-gray-600 font-bold hover:bg-brand-green/10 hover:text-brand-green'
                      }`}
                    >
                      :{m}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
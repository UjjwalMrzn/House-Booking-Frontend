import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown, Check } from 'lucide-react';

interface TimePickerProps {
  label?: string;
  value: string; // Expects "HH:mm" (24h format)
  onChange: (value: string) => void;
  required?: boolean;
}

// Helper: Generates an array of times every 30 minutes
const generateTimeOptions = () => {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`; // "14:30"
      
      const period = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const label = `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`; // "02:30 PM"
      
      times.push({ value, label });
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

const TimePicker: React.FC<TimePickerProps> = ({ label, value, onChange, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Find the formatted label for the current value, or fallback
  const displayLabel = TIME_OPTIONS.find(t => t.value === value)?.label || 'Select time...';

  return (
    <div className="space-y-1.5 w-full relative" ref={dropdownRef}>
      {label && (
        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 flex gap-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 flex items-center justify-between bg-white border rounded-xl text-sm font-bold outline-none transition-all ${
          isOpen ? 'border-brand-green ring-2 ring-brand-green/10' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <Clock size={16} className={value ? 'text-brand-green' : 'text-gray-400'} />
          <span className={value ? 'text-brand-dark' : 'text-gray-400'}>
            {displayLabel}
          </span>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Custom Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] py-2 max-h-60 overflow-y-auto custom-scrollbar animate-fade-in">
          {TIME_OPTIONS.map((time) => (
            <button
              key={time.value}
              type="button"
              onClick={() => {
                onChange(time.value);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm font-bold flex items-center justify-between transition-colors hover:bg-brand-green/5 hover:text-brand-green"
            >
              <span className={value === time.value ? 'text-brand-green' : 'text-gray-600'}>
                {time.label}
              </span>
              {value === time.value && <Check size={16} className="text-brand-green" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimePicker;
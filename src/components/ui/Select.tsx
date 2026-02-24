import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  options: (Option | string)[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({ label, options, value, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedOptions = options.map(opt => 
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  const selectedLabel = normalizedOptions.find(opt => opt.value === value)?.label || '';

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
  // Height (pt-6 pb-2) and Rounding (rounded-xl) matched exactly to Input.tsx
  const boxBaseStyles = "peer block w-full px-4 pt-6 pb-2 text-sm font-normal text-gray-900 bg-white border border-gray-200 rounded-xl cursor-pointer flex items-center justify-between transition-all select-none outline-none";
  const boxActiveStyles = isOpen ? "border-brand-green ring-1 ring-brand-green/20" : "hover:border-gray-300";

  return (
    <div className={`relative w-full group ${className}`} ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`${boxBaseStyles} ${boxActiveStyles}`}
      >
        <span className={value ? 'text-gray-900' : 'text-transparent'}>
          {selectedLabel || 'Placeholder'} 
        </span>
        
        <ChevronDown 
          size={16} 
          strokeWidth={3}
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-green' : ''}`} 
        />
      </div>

      {/* RULE: Floating Label matched to Universal Input Logic */}
      <label className={`
        absolute text-sm duration-150 transform top-4 z-10 origin-[0] left-4 font-medium pointer-events-none transition-all
        ${value || isOpen ? 'scale-75 -translate-y-3 text-gray-400' : 'scale-100 translate-y-0 text-gray-400'}
      `}>
        {label}
      </label>

      {/* RULE: Dropdown designed once with Squad-standard shadows/rounding */}
      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 z-50 max-h-60 overflow-y-auto animate-entrance p-1">
          {normalizedOptions.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`
                px-4 py-3 text-sm font-bold rounded-lg cursor-pointer transition-colors flex items-center justify-between
                ${value === opt.value ? 'bg-brand-green/10 text-brand-green' : 'text-gray-700 hover:bg-gray-50 hover:text-brand-dark'}
              `}
            >
              {opt.label}
              {value === opt.value && <Check size={14} strokeWidth={3} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
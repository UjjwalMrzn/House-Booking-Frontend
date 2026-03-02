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
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizedOptions = options.map(opt => 
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  const selectedLabel = normalizedOptions.find(opt => opt.value === value)?.label || '';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(""); // Reset search when clicking away
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on user typing
  const filteredOptions = normalizedOptions.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const boxBaseStyles = "peer w-full px-4 pt-6 pb-2 text-sm font-normal text-gray-900 bg-white border border-gray-200 rounded-xl cursor-text flex items-center justify-between transition-all select-none outline-none";
  const boxActiveStyles = isOpen ? "border-brand-green ring-1 ring-brand-green/20" : "hover:border-gray-300";

  return (
    <div className={`relative w-full group ${className}`} ref={containerRef}>
      <div 
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        className={`${boxBaseStyles} ${boxActiveStyles} relative`}
      >
        {/* The clever part: Acts as display text when closed, and an active search input when open */}
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : selectedLabel}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-transparent outline-none text-gray-900 placeholder-transparent"
          placeholder={label}
          autoComplete="off"
        />
        
        <ChevronDown 
          size={16} 
          strokeWidth={3}
          className={`text-gray-400 shrink-0 transition-transform duration-200 cursor-pointer ${isOpen ? 'rotate-180 text-brand-green' : ''}`} 
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
            if (!isOpen) inputRef.current?.focus();
            else setSearchTerm("");
          }}
        />
      </div>

      <label className={`
        absolute text-sm duration-150 transform top-4 z-10 origin-[0] left-4 font-medium pointer-events-none transition-all
        ${(value || isOpen || searchTerm) ? 'scale-75 -translate-y-3 text-gray-400' : 'scale-100 translate-y-0 text-gray-400'}
      `}>
        {label}
      </label>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 z-50 max-h-60 overflow-y-auto animate-entrance p-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setSearchTerm("");
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
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">No matching countries</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Select;
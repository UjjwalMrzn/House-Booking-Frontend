import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
}

const Dropdown = ({ value, onChange, options, placeholder }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Dropdown Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full cursor-pointer flex justify-between items-center rounded-xl px-5 py-3.5 text-sm outline-none transition-all font-medium select-none ${
          isOpen 
            ? 'bg-white border-brand-green ring-4 ring-brand-green/10 border' 
            : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
        } ${selectedOption ? 'text-brand-dark' : 'text-gray-400'}`}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-green' : 'text-gray-400'}`} 
        />
      </div>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-2 z-[100001] animate-fade-in max-h-56 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`flex justify-between items-center px-4 py-3 mb-1 last:mb-0 rounded-xl text-sm font-bold cursor-pointer transition-colors ${
                value === option.value
                  ? 'bg-brand-green/10 text-brand-green'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-brand-dark'
              }`}
            >
              <span>{option.label}</span>
              {value === option.value && (
                <Check size={16} strokeWidth={3} className="text-brand-green" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
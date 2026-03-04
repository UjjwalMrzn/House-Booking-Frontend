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
  size?: 'sm' | 'md'; // NEW: Size control
  className?: string;
}

const Dropdown = ({ value, onChange, options, placeholder, size = 'md', className = "" }: DropdownProps) => {
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

  // Sizing Logic
  const headerSizeClass = size === 'sm' ? 'px-3 py-2 text-xs rounded-lg' : 'px-5 py-3.5 text-sm rounded-xl';
  const iconSize = size === 'sm' ? 14 : 16;
  const menuPaddingClass = size === 'sm' ? 'p-1.5' : 'p-2';
  const itemSizeClass = size === 'sm' ? 'px-3 py-2 text-xs rounded-lg mb-0.5' : 'px-4 py-3 text-sm rounded-xl mb-1';

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {/* Dropdown Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full cursor-pointer flex justify-between items-center outline-none transition-all font-medium select-none ${headerSizeClass} ${
          isOpen 
            ? 'bg-white border-brand-green ring-2 ring-brand-green/20 border' 
            : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
        } ${selectedOption ? 'text-brand-dark' : 'text-gray-400'}`}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown 
          size={iconSize} 
          strokeWidth={3}
          className={`transition-transform duration-200 ml-2 ${isOpen ? 'rotate-180 text-brand-green' : 'text-gray-400'}`} 
        />
      </div>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className={`absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] z-[100001] animate-fade-in max-h-56 overflow-y-auto custom-scrollbar ${menuPaddingClass}`}>
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`flex justify-between items-center cursor-pointer transition-colors last:mb-0 ${itemSizeClass} ${
                value === option.value
                  ? 'bg-brand-green/10 text-brand-green font-black'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-brand-dark font-bold'
              }`}
            >
              <span>{option.label}</span>
              {value === option.value && (
                <Check size={iconSize} strokeWidth={3} className="text-brand-green shrink-0 ml-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
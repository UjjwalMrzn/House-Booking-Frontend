import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder = "Search...", className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input 
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // FIXED: Reduced py-3 to py-2.5 to remove bulkiness
        className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-brand-dark outline-none focus:border-brand-green shadow-sm transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          // FIXED: Reduced p-1.5 to p-1 so the clear button isn't too big
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark hover:bg-gray-100 p-1 rounded-full transition-colors"
          title="Clear search"
        >
          <X size={14} strokeWidth={3} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
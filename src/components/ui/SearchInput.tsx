import React from 'react';

interface SearchInputProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const SearchInput = ({ label, children, className = "", onClick }: SearchInputProps) => {
  return (
    <div 
      onClick={onClick}
      className={`
        group relative flex flex-col justify-center px-6 py-3 
        cursor-pointer transition-all duration-300
        hover:bg-gray-50/80 rounded-2xl flex-1
        ${className}
      `}
    >
      <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-bold mb-1 transition-colors group-hover:text-brand-green">
        {label}
      </span>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );
};

export default SearchInput;
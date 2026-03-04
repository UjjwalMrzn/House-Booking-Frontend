import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, description }) => {
  return (
    <div 
      className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:border-gray-200 transition-colors" 
      onClick={() => onChange(!checked)}
    >
      <div className="flex flex-col">
        <span className="text-sm font-bold text-gray-700">{label}</span>
        {description && (
          <span className="text-[10px] font-bold text-gray-400 mt-0.5">{description}</span>
        )}
      </div>
      <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${checked ? 'bg-brand-green' : 'bg-gray-300'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </div>
    </div>
  );
};

export default Toggle;
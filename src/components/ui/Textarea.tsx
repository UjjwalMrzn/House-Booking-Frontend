import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  maxLength?: number;
}

const Textarea: React.FC<TextareaProps> = ({ label, maxLength, value, disabled, className = "", ...props }) => {
  const currentLength = String(value || '').length;

  return (
    <div className={`relative w-full group ${className}`}>
      <textarea
        value={value}
        disabled={disabled}
        maxLength={maxLength}
        placeholder=" "
        {...props}
        className="peer block w-full px-4 pt-6 pb-2 text-[14px] font-normal text-gray-900 bg-white border border-gray-200 rounded-xl appearance-none transition-all outline-none focus:ring-0 focus:border-brand-green resize-y min-h-[120px]"
      />
      <label className="absolute text-[12px] text-gray-400 duration-150 transform top-4 z-10 origin-[0] left-4 font-medium pointer-events-none scale-75 -translate-y-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">
        {label}
      </label>
      
      {/* Character Counter */}
      {maxLength && !disabled && (
        <div className="absolute -bottom-6 right-2 text-[10px] font-bold text-gray-400">
          <span className={currentLength >= maxLength ? 'text-red-500' : ''}>
            {currentLength}
          </span> / {maxLength}
        </div>
      )}
    </div>
  );
};

export default Textarea;
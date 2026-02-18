import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, className, value, ...props }) => {
  // RULE: Design CSS Once. 
  // Standardizing the height (pt-6 pb-2) and the focus ring logic for the whole squad.
  const inputBaseStyles = "peer block w-full px-4 pt-6 pb-2 text-sm font-bold text-gray-900 bg-white border border-gray-200 rounded-xl appearance-none transition-all outline-none focus:ring-0 focus:border-brand-green disabled:opacity-50 disabled:cursor-not-allowed";
  
  // Floating label logic designed once to be reused by Select and DatePicker
  const labelStyles = "absolute text-sm text-gray-400 duration-150 transform top-4 z-10 origin-[0] left-4 font-medium pointer-events-none scale-75 -translate-y-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3";

  return (
    <div className="relative w-full group">
      <input
        {...props}
        value={value}
        placeholder=" " 
        className={`${inputBaseStyles} ${className}`}
      />
      <label className={labelStyles}>
        {label}
      </label>
    </div>
  );
};

export default Input;
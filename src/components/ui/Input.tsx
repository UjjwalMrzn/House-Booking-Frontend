import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, className, value, ...props }) => {
  // FIXED: Changed 'font-bold' to 'font-normal' to remove boldness from typed text
  const inputBaseStyles = "peer block w-full h-[56px] px-4 pt-5 pb-1.5 text-[14px] font-normal text-gray-900 bg-white border border-gray-200 rounded-xl appearance-none transition-all outline-none focus:ring-0 focus:border-brand-green disabled:opacity-50 disabled:cursor-not-allowed";
  
  const labelStyles = "absolute text-[12px] text-gray-400 duration-150 transform top-3.5 z-10 origin-[0] left-4 font-medium pointer-events-none scale-75 -translate-y-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5";

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
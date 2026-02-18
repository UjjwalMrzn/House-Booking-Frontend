import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, className, ...props }) => {
  return (
    <div className="relative w-full">
      <input
        {...props}
        placeholder=" "
        className={`peer block w-full px-4 pt-6 pb-2 text-sm font-bold text-gray-900 bg-white border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-0 focus:border-brand-green transition-all ${className}`}
      />
      <label className="absolute text-sm text-gray-400 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 font-medium pointer-events-none">
        {label}
      </label>
    </div>
  );
};

export default Input;
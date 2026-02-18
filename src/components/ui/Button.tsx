import React from 'react';

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, children, ...props }) => {
  return (
    <button
      className={`bg-brand-green text-white font-bold text-sm rounded-xl px-6 py-4 shadow-lg hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
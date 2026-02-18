import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg'; // Added size prop
}

const Button: React.FC<ButtonProps> = ({ 
  className = "", 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  size = 'md',
  ...props 
}) => {
  const baseStyles = "relative font-bold uppercase tracking-widest rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 select-none";
  
  const sizes = {
    sm: "px-4 py-2 text-[10px]",
    md: "px-6 py-3 text-xs",
    lg: "px-10 py-4 text-sm" // This is for the Hero
  };

  const variants = {
    primary: "bg-brand-green text-white shadow-[0_10px_20px_-5px_rgba(74,222,128,0.3)] hover:bg-emerald-600 hover:shadow-[0_15px_25px_-5px_rgba(74,222,128,0.4)]",
    outline: "bg-transparent border-2 border-brand-green text-brand-green hover:bg-green-50",
    ghost: "bg-transparent text-gray-500 hover:text-brand-dark hover:bg-gray-50"
  };

  return (
    <button
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]}
        ${fullWidth ? 'w-full' : 'w-auto'} 
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
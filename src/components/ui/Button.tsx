import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ 
  className = "", 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  size = 'md',
  ...props 
}) => {
  // BASE: Increased font-black and tracking for brand impact.
  const baseStyles = "relative font-black uppercase tracking-[0.1em] rounded-xl transition-all duration-300 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 select-none whitespace-nowrap";
  
  // SIZES: Scaled down height while scaling UP text size for better balance.
  // md: 48px height (standard) | lg: 54px height (hero/action)
  const sizes = {
    sm: "h-9 px-4 text-[10px]",
    md: "h-[48px] px-8 text-[13px]", 
    lg: "h-[54px] px-10 text-[15px]" 
  };

  const variants = {
    primary: "bg-brand-green text-white shadow-[0_8px_20px_-6px_rgba(74,222,128,0.5)] hover:bg-emerald-600 hover:shadow-[0_12px_25px_-6px_rgba(74,222,128,0.6)]",
    outline: "bg-transparent border-2 border-brand-green text-brand-green hover:bg-green-50",
    ghost: "bg-transparent text-gray-500 hover:text-brand-dark hover:bg-gray-100/50"
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
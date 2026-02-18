import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'input' | 'button' | 'card' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "", variant }) => {
  // RULE: Design CSS Once.
  // Heights and rounding MUST match the real components exactly.
  const variants = {
    // Matches standard text lines
    text: "h-4 w-full rounded-md",
    
    // Matches Input, Select, DatePicker, GuestSelector (pt-6 + pb-2 + text height)
    input: "h-[58px] w-full rounded-xl", 
    
    // Matches our standardized Button height
    button: "h-[48px] w-full rounded-xl",
    
    // Matches FeatureCard and Summary Cards
    card: "rounded-[2rem] w-full",
    
    // For avatars or circular icons
    circle: "rounded-full"
  };

  return (
    <div 
      className={`
        animate-pulse bg-gray-200 
        ${variant ? variants[variant] : ''} 
        ${className}
      `} 
    />
  );
};
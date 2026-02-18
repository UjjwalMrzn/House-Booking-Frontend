import React from 'react';

interface SectionHeaderProps {
  subcite?: string;
  title: React.ReactNode;
  description?: string;
  className?: string;
  centered?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  subcite, 
  title, 
  description, 
  className = "", 
  centered = false 
}) => {
  // RULE: Design CSS Once. 
  // The hierarchy of sizes (4xl/5xl for titles, text-lg for descriptions) is locked here.
  const containerStyles = `space-y-6 ${centered ? 'text-center mx-auto max-w-3xl' : ''} ${className}`;
  
  const subciteStyles = "text-[10px] font-black tracking-[0.25em] text-gray-400 uppercase animate-fade-in block select-none";
  
  const titleStyles = "text-4xl md:text-5xl font-black text-brand-dark leading-[1.1] tracking-tight animate-slide-up";
  
  const descriptionStyles = "text-lg text-gray-500 font-medium leading-relaxed max-w-2xl animate-slide-up [animation-delay:100ms]";

  return (
    <div className={containerStyles}>
      {subcite && (
        <span className={subciteStyles}>
          {subcite}
        </span>
      )}
      
      <h2 className={titleStyles}>
        {title}
      </h2>
      
      {description && (
        <p className={descriptionStyles}>
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
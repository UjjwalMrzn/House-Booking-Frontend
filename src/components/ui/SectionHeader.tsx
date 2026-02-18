import React from 'react';

interface SectionHeaderProps {
  subcite?: string;
  title: React.ReactNode;
  description?: string;
  align?: 'left' | 'center';
}

const SectionHeader = ({ subcite, title, description, align = 'left' }: SectionHeaderProps) => {
  return (
    <div className={`space-y-4 animate-entrance ${align === 'center' ? 'text-center mx-auto' : ''}`}>
      {subcite && (
        <h2 className="text-sm uppercase tracking-[0.3em] text-brand-green font-bold">
          {subcite}
        </h2>
      )}
      <h3 className="text-4xl md:text-5xl font-serif font-medium leading-tight text-brand-dark">
        {title}
      </h3>
      {description && (
        <p className="text-lg text-slate-500 leading-relaxed max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
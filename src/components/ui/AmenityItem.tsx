import React from 'react';

interface AmenityItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
}

const AmenityItem = ({ icon, label, value }: AmenityItemProps) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
    <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green">
      {icon}
    </div>
    <div>
      <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">{label}</p>
      {value && <p className="text-sm font-semibold text-brand-dark mt-0.5">{value}</p>}
    </div>
  </div>
);

export default AmenityItem;
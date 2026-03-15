import React from 'react';

interface AdminPageContainerProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode; // For "Add New" buttons
  children: React.ReactNode;
}

const AdminPageContainer: React.FC<AdminPageContainerProps> = ({ 
  title, 
  subtitle, 
  icon, 
  headerAction, 
  children 
}) => {
  return (
    /* THE SINGLE SOURCE OF TRUTH FOR PAGE WIDTH */
    <div className="max-w-7xl mx-auto w-full animate-fade-in pb-10 px-2 md:px-0">
      
      {/* GLOBAL HEADER STYLE */}
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 px-2 md:px-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-dark tracking-tight flex items-center gap-3">
            {icon && <span className="text-brand-green">{icon}</span>}
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm font-bold text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        {headerAction && (
          <div className="w-full sm:w-auto">
            {headerAction}
          </div>
        )}
      </div>

      {/* THE MAIN WHITE BOX (The "Modal Box" you see outside) */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
        {children}
      </div>

    </div>
  );
};

export default AdminPageContainer;
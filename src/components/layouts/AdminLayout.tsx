import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  // Syncs the exact sidebar width to a global CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--admin-sidebar-width', isDesktopCollapsed ? '120px' : '320px');
  }, [isDesktopCollapsed]);

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans overflow-x-hidden">
      {/* This style perfectly offsets the modals so they center over the workspace,
        and adds a smooth transition so they glide if the sidebar is toggled while open!
      */}
      <style>{`
        @media (min-width: 1024px) {
          .admin-modal-overlay {
            padding-left: var(--admin-sidebar-width, 320px);
            transition: padding-left 0.3s ease-in-out;
          }
        }
      `}</style>

      <AdminSidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
        isCollapsed={isDesktopCollapsed}
        onToggleCollapse={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center text-white">
              <span className="font-black text-xs">A</span>
            </div>
            <h2 className="font-black text-sm tracking-tight text-brand-dark">Admin Portal</h2>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 bg-gray-50 text-gray-500 rounded-xl hover:text-brand-green transition-colors"
          >
            <Menu size={20} />
          </button>
        </header>

        <main className={`flex-1 p-6 lg:p-10 min-h-screen flex flex-col transition-[padding] duration-300 ease-in-out ${isDesktopCollapsed ? 'lg:pl-[120px]' : 'lg:pl-80'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
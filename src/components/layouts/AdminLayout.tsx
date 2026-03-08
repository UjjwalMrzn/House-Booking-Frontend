import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans overflow-x-hidden">
      {/* SURGICAL FIX: Pass state to Sidebar for mobile control */}
      <AdminSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* SURGICAL FIX: Mobile Header with Hamburger (Only visible below lg) */}
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

        <main className="flex-1 lg:pl-80 p-6 lg:p-10 min-h-screen flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
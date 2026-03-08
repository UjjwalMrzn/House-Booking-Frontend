import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { 
  LayoutDashboard, Home, CalendarCheck, Star, LogOut, 
  Hexagon, ListChecks, LayoutTemplate, CreditCard, 
  Settings, CalendarDays, Contact, X 
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // SURGICAL FIX: Auto-close sidebar on mobile when a link is clicked
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/admin/login');
  };

  const navStyles = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
      isActive 
        ? 'bg-brand-green text-white shadow-lg shadow-brand-green/30' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-brand-dark'
    }`;

  return (
    <>
      {/* SURGICAL FIX: Mobile Backdrop (Blur effect) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-brand-dark/20 backdrop-blur-sm z-[60] lg:hidden animate-fade-in" 
          onClick={onClose}
        />
      )}

      {/* SURGICAL FIX: Responsive Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] p-6 transition-transform duration-300 ease-in-out w-80
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:flex flex-col
      `}>
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_30px_80px_rgba(0,0,0,0.04)] h-full flex flex-col p-6 relative">
          
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="lg:hidden absolute top-8 right-8 text-gray-400 hover:text-brand-dark"
          >
            <X size={20} />
          </button>

          {/* Brand Header */}
          <div className="flex items-center gap-3 px-4 mb-10 mt-4">
            <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center text-white shadow-md shadow-brand-green/40">
              <Hexagon size={20} fill="currentColor" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="font-black text-xl tracking-tight text-brand-dark leading-tight">Admin</h2>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
            <NavLink to="/admin" end className={navStyles}>
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
            
            <NavLink to="/admin/properties" className={navStyles}>
              <Home size={20} /> Properties
            </NavLink>

            <NavLink to="/admin/amenities" className={navStyles}>
              <ListChecks size={20} /> Master Amenities
            </NavLink>

            <NavLink to="/admin/homesection" className={navStyles}>
              <LayoutTemplate size={20} /> Home Visuals
            </NavLink>

            <NavLink to="/admin/bookings" className={navStyles}>
              <CalendarCheck size={20} /> Bookings
            </NavLink>

            <NavLink to="/admin/payments" className={navStyles}>
              <CreditCard size={20} /> Payments
            </NavLink>
            
            <NavLink to="/admin/reviews" className={navStyles}>
              <Star size={20} /> Reviews
            </NavLink>

            <NavLink to="/admin/holidays" className={navStyles}>
              <CalendarDays size={20} /> Holidays
            </NavLink>

            <NavLink to="/admin/contacts" className={navStyles}>
              <Contact size={20} /> Contacts
            </NavLink>

            <NavLink to="/admin/settings" className={navStyles}>
              <Settings size={20} /> Settings
            </NavLink>
          </nav>

          {/* Footer Action */}
          <div className="pt-6 border-t border-gray-50 mt-6">
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { 
  LayoutDashboard, Home, CalendarCheck, Star, LogOut, 
  Hexagon, ListChecks, LayoutTemplate, CreditCard, 
  Settings, CalendarDays, Contact, X , Users, ChevronLeft, ChevronRight
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const AdminSidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-close mobile sidebar when a link is clicked
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/admin/login');
  };

  const navStyles = ({ isActive }: { isActive: boolean }) =>
    `flex items-center transition-all overflow-hidden ${
      isCollapsed 
        ? 'justify-center mx-auto w-12 h-12 rounded-2xl px-0' 
        : 'gap-4 px-6 py-4 rounded-2xl'
    } font-bold ${
      isActive 
        ? 'bg-brand-green text-white shadow-lg shadow-brand-green/30' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-brand-dark'
    }`;

  return (
    <>
      {/* Mobile Backdrop (Blur effect) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-brand-dark/20 backdrop-blur-sm z-[60] lg:hidden animate-fade-in" 
          onClick={onClose}
        />
      )}

      {/* Responsive Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] p-4 md:p-6 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 w-80' : '-translate-x-full w-80'}
        lg:translate-x-0 lg:flex flex-col
        ${isCollapsed ? 'lg:w-[120px]' : 'lg:w-80'}
      `}>
        <div className={`bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_30px_80px_rgba(0,0,0,0.04)] h-full flex flex-col relative transition-all duration-300 ${isCollapsed ? 'p-3' : 'p-6'}`}>
          
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="lg:hidden absolute top-8 right-8 text-gray-400 hover:text-brand-dark"
          >
            <X size={20} />
          </button>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex absolute -right-3 top-[76px] w-8 h-8 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-400 hover:text-brand-green hover:border-brand-green hover:shadow-md transition-all z-50"
          >
            {isCollapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
          </button>

          {/* Brand Header - Logo size locked, no morphing glitch */}
          <div className={`flex items-center mb-10 mt-2 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'}`}>
            <div className="bg-brand-green rounded-xl flex items-center justify-center text-white shadow-md shadow-brand-green/40 shrink-0 w-10 h-10">
              <Hexagon size={20} fill="currentColor" strokeWidth={2.5} />
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
              <h2 className="font-black text-xl tracking-tight text-brand-dark leading-tight whitespace-nowrap">Admin</h2>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 space-y-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isCollapsed ? 'px-0' : 'pr-1'}`}>
            <NavLink to="/admin" end className={navStyles} title={isCollapsed ? "Dashboard" : ""}>
              <LayoutDashboard size={20} className="shrink-0" /> 
              <span className={`transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>Dashboard</span>
            </NavLink>
            
            <NavLink to="/admin/properties" className={navStyles} title={isCollapsed ? "Properties" : ""}>
              <Home size={20} className="shrink-0" /> 
              <span className={`transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>Properties</span>
            </NavLink>

            <NavLink to="/admin/amenities" className={navStyles} title={isCollapsed ? "Master Amenities" : ""}>
              <ListChecks size={20} className="shrink-0" /> 
              <span className={`transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>Master Amenities</span>
            </NavLink>

            <NavLink to="/admin/homesection" className={navStyles} title={isCollapsed ? "Home Visuals" : ""}>
              <LayoutTemplate size={20} className="shrink-0" /> 
              <span className={`transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>Home Visuals</span>
            </NavLink>

            <NavLink to="/admin/bookings" className={navStyles} title={isCollapsed ? "Bookings" : ""}>
              <CalendarCheck size={20} className="shrink-0" /> 
              <span className={`transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>Bookings</span>
            </NavLink>

            <NavLink to="/admin/payments" className={navStyles} title={isCollapsed ? "Payments" : ""}>
              <CreditCard size={20} className="shrink-0" /> 
              <span className={`transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>Payments</span>
            </NavLink>
            
            <NavLink to="/admin/reviews" className={navStyles} title={isCollapsed ? "Reviews" : ""}>
              <Star size={20} className="shrink-0" /> 
              <span className={`transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>Reviews</span>
            </NavLink>

            <NavLink to="/admin/customers" className={navStyles} title={isCollapsed ? "Customers" : ""}>
              <Users size={20} className="shrink-0" /> 
              <span className={`transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>Customers</span>
            </NavLink>

            <NavLink to="/admin/holidays" className={navStyles} title={isCollapsed ? "Holidays" : ""}>
              <CalendarDays size={20} className="shrink-0" /> 
              <span className={`transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>Holidays</span>
            </NavLink>

            <NavLink to="/admin/contacts" className={navStyles} title={isCollapsed ? "Contacts" : ""}>
              <Contact size={20} className="shrink-0" /> 
              <span className={`transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>Contacts</span>
            </NavLink>

            <NavLink to="/admin/settings" className={navStyles} title={isCollapsed ? "Settings" : ""}>
              <Settings size={20} className="shrink-0" /> 
              <span className={`transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>Settings</span>
            </NavLink>
          </nav>

          {/* Footer Action */}
          <div className={`pt-4 border-t border-gray-50 mt-4 transition-all duration-300 ${isCollapsed ? 'flex justify-center' : ''}`}>
            <button 
              onClick={handleLogout} 
              className={`flex items-center font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all ${isCollapsed ? 'justify-center w-12 h-12 rounded-2xl p-0' : 'w-full gap-4 px-6 py-4 rounded-2xl'}`}
              title={isCollapsed ? "Logout" : ""}
            >
              <LogOut size={20} className="shrink-0" /> 
              <span className={`transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
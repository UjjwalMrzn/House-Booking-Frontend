import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Home, 
  CalendarCheck, 
  Star, 
  LogOut, 
  Hexagon, 
  ListChecks,
  LayoutTemplate, // FIXED: Imported icon for the Home Visuals link
  CreditCard,
  Settings
} from 'lucide-react';

const AdminSidebar = () => {
  const navigate = useNavigate();

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
    <aside className="w-80 fixed inset-y-0 left-0 p-6 hidden lg:flex flex-col z-50">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_30px_80px_rgba(0,0,0,0.04)] flex-1 p-6 flex flex-col">
        
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
        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
          <NavLink to="/admin" end className={navStyles}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          
          <NavLink to="/admin/properties" className={navStyles}>
            <Home size={20} /> Properties
          </NavLink>

          <NavLink to="/admin/amenities" className={navStyles}>
            <ListChecks size={20} /> Master Amenities
          </NavLink>

          {/* FIXED: The missing link added right here */}
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

          <NavLink to="/admin/settings" className={navStyles}>
            <Settings size={20} /> Settings
          </NavLink>
        </nav>

        {/* Footer Action */}
        <div className="pt-6 border-t border-gray-50 mt-auto">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
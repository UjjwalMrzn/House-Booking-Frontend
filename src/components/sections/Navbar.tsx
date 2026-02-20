import { NavLink, Link, useLocation } from 'react-router-dom';
import Button from '../ui/Button';
// FIXED: Integrated the Single Source of Truth constant
import { DEFAULT_PROPERTY_ID } from '../../utils/constants';

const Navbar = () => {
  const location = useLocation();

  // FIXED: Extracts the current property ID from the URL or defaults to the Global Constant
  const pathParts = location.pathname.split('/');
  const currentId = pathParts[2] || DEFAULT_PROPERTY_ID;

  // FIXED: Standard logic for active states maintained
  const navLinkStyles = (isActive: boolean) => 
    `text-sm font-bold transition-all duration-300 pb-1 border-b-2 ${
      isActive 
        ? 'text-brand-green border-brand-green' 
        : 'text-gray-500 border-transparent hover:text-brand-green'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center text-white font-black transition-transform group-hover:scale-110 shadow-lg shadow-green-100">
            H
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {/* Home stays exact */}
          <NavLink to="/" className={({ isActive }) => navLinkStyles(isActive)}>
            Home
          </NavLink>
          
          {/* FIXED: All property-related links now use the synchronized currentId */}
          <Link to={`/overview/${currentId}`} className={navLinkStyles(location.pathname.startsWith('/overview'))}>
            Overview
          </Link>
          
          <Link to={`/map/${currentId}`} className={navLinkStyles(location.pathname.startsWith('/map'))}>
            Map
          </Link>          

          <Link to={`/gallery/${currentId}`} className={navLinkStyles(location.pathname.startsWith('/gallery'))}>
            Gallery
          </Link>
          
          <Link to={`/reviews/${currentId}`} className={navLinkStyles(location.pathname.startsWith('/reviews'))}>
            Reviews
          </Link>          

          <Link to="/contact" className={navLinkStyles(location.pathname === '/contact')}>
            Contact
          </Link>
        </div>

        {/* FIXED: Redirect points to the current active property or global fallback */}
        <Link to={`/overview/${currentId}`}>
          <Button className="px-8 text-[10px]">
            Book Now
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
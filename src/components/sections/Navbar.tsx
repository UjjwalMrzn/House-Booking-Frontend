import { NavLink, Link } from 'react-router-dom';
import Button from '../ui/Button';

const Navbar = () => {
  // Styles for the active link (the green underline effect)
  const navLinkStyles = ({ isActive }: { isActive: boolean }) => 
    `text-sm font-bold transition-all duration-300 pb-1 border-b-2 ${
      isActive 
        ? 'text-brand-green border-brand-green' 
        : 'text-gray-500 border-transparent hover:text-brand-green'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo - Clickable to Home */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center text-white font-black transition-transform group-hover:scale-110 shadow-lg shadow-green-100">
            H
          </div>
        </Link>

        {/* Navigation - Using NavLink for automatic active states */}
        <div className="hidden md:flex items-center gap-10">
          <NavLink to="/" className={navLinkStyles}>Home</NavLink>
          <NavLink to="/overview" className={navLinkStyles}>Overview</NavLink>
          <button className="text-sm font-bold text-gray-300 cursor-not-allowed">Map</button>
          <button className="text-sm font-bold text-gray-300 cursor-not-allowed">Gallery</button>
          <button className="text-sm font-bold text-gray-300 cursor-not-allowed">Reviews</button>
          <button className="text-sm font-bold text-gray-300 cursor-not-allowed">Contact</button>
        </div>

        {/* Action Button */}
        <Link to="/overview">
          <Button className="bg-brand-green text-white px-8 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-200 hover:bg-emerald-500">
            Book Now
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
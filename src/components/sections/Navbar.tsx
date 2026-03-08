import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Button from '../ui/Button';

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // SURGICAL FIX: Automatically close the mobile menu if the screen resizes to desktop width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // SURGICAL FIX: Prevent body scrolling when the mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const navLinkStyles = (isActive: boolean) => 
    `text-sm font-bold transition-all duration-300 pb-1 border-b-2 ${
      isActive 
        ? 'text-brand-green border-brand-green' 
        : 'text-gray-500 border-transparent hover:text-brand-green'
    }`;

  const mobileLinkStyles = (isActive: boolean) =>
    `block text-xl font-black py-4 border-b border-gray-100/50 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] origin-left ${
      isActive 
        ? 'text-brand-green' 
        : 'text-brand-dark hover:text-brand-green hover:tracking-[0.1em]'
    }`;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-[101]">
          
          <Link to="/" className="flex items-center gap-2 group z-[101]" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center text-white font-black transition-transform group-hover:scale-110 shadow-lg shadow-green-100 tracking-tighter">
              JB
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <NavLink to="/" className={({ isActive }) => navLinkStyles(isActive)}>Home</NavLink>
            <Link to="/overview" className={navLinkStyles(location.pathname.startsWith('/overview'))}>Overview</Link>
            <Link to="/map" className={navLinkStyles(location.pathname.startsWith('/map'))}>Map</Link>          
            <Link to="/gallery" className={navLinkStyles(location.pathname.startsWith('/gallery'))}>Gallery</Link>
            <Link to="/reviews" className={navLinkStyles(location.pathname.startsWith('/reviews'))}>Reviews</Link>          
            <Link to="/contact" className={navLinkStyles(location.pathname === '/contact')}>Contact</Link>
          </div>

          <div className="flex items-center gap-3 z-[101]">
            <Link to="/overview" className="hidden sm:block">
              <Button className="px-5 md:px-8 text-[10px]">Book Now</Button>
            </Link>
            
            <button 
              className="md:hidden p-2 text-brand-dark hover:bg-gray-50 rounded-lg transition-transform duration-300 active:scale-90"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} className="animate-fade-in" /> : <Menu size={24} className="animate-fade-in" />}
            </button>
          </div>
        </div>

        {/* CSS-driven Drawer Animation */}
        <div 
          className={`absolute top-20 left-0 w-full bg-white/95 backdrop-blur-xl flex flex-col px-6 shadow-[0_20px_40px_rgba(0,0,0,0.1)] border-t border-gray-100 md:hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-[100] overflow-hidden ${
            isMobileMenuOpen 
              ? 'max-h-[600px] opacity-100 py-6 pointer-events-auto visible' 
              : 'max-h-0 opacity-0 py-0 pointer-events-none invisible'
          }`}
        >
          <div className={`transition-all duration-500 delay-100 flex flex-col ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}>
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkStyles(location.pathname === '/')}>Home</Link>
            <Link to="/overview" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkStyles(location.pathname.startsWith('/overview'))}>Overview</Link>
            <Link to="/map" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkStyles(location.pathname.startsWith('/map'))}>Map</Link>
            <Link to="/gallery" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkStyles(location.pathname.startsWith('/gallery'))}>Gallery</Link>
            <Link to="/reviews" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkStyles(location.pathname.startsWith('/reviews'))}>Reviews</Link>
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkStyles(location.pathname === '/contact')}>Contact</Link>
            
            <Link to="/overview" onClick={() => setIsMobileMenuOpen(false)} className="mt-8 block">
              <Button fullWidth className="h-14">Book Now</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* SURGICAL FIX: The Invisible Click-Away Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Navbar;
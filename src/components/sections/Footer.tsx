import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  // SURGICAL FIX: Changed text-gray-600 to text-gray-400. On a dark background (#1A1A1A), 600 is too dark and fails contrast.
  const legalStyles =
    "text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black";
    
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A1A1A] text-white py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          <div className="md:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-3 w-fit group">
              <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center text-white font-black tracking-tighter shadow-lg shadow-brand-green/20 group-hover:scale-110 transition-transform">
                JB
              </div>
              <span className="text-xl font-black tracking-tight text-white group-hover:text-brand-green transition-colors">
                Jervis Bay Retreats
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              An innovation first coastal retreat dedicated to building high performance relaxation and memorable holiday experiences.
            </p>
            <div className="flex items-center gap-4 pt-2">
              {/* SURGICAL FIX: Added aria-label to social links so screen readers know what they do */}
              <a href="#" aria-label="Visit our Facebook page" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-brand-green hover:text-white transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" aria-label="Visit our Instagram page" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-brand-green hover:text-white transition-all">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          <div>
            {/* SURGICAL FIX: Changed h4 to h3 to fix the Heading Hierarchy error */}
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white mb-6">Explore</h3>
            <div className="flex flex-col gap-4">
              <Link to="/" className="text-sm text-gray-400 hover:text-brand-green transition-colors w-fit">Home</Link>
              <Link to="/overview" className="text-sm text-gray-400 hover:text-brand-green transition-colors w-fit">Overview</Link>
              <Link to="/map" className="text-sm text-gray-400 hover:text-brand-green transition-colors w-fit">Map</Link>
              <Link to="/gallery" className="text-sm text-gray-400 hover:text-brand-green transition-colors w-fit">Gallery</Link>
              <Link to="/reviews" className="text-sm text-gray-400 hover:text-brand-green transition-colors w-fit">Reviews</Link>
              <Link to="/contact" className="text-sm text-gray-400 hover:text-brand-green transition-colors w-fit">Contact</Link>
            </div>
          </div>

          <div>
            {/* SURGICAL FIX: Changed h4 to h3 to fix the Heading Hierarchy error */}
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white mb-6">Contact</h3>
            <div className="flex flex-col gap-4">
              <Link to="/map" className="flex items-start gap-3 text-gray-400 hover:text-brand-green transition-colors group w-fit">
                <MapPin size={16} className="text-brand-green shrink-0 mt-0.5" />
                <span className="text-sm">Sanctuary Point,<br/>Jervis Bay, NSW 2540</span>
              </Link>
              <a href="tel:+977986553232" className="flex items-center gap-3 text-gray-400 hover:text-brand-green transition-colors group w-fit">
                <Phone size={16} className="text-brand-green shrink-0" />
                <span className="text-sm">+977 986553232</span>
              </a>
              <a href="mailto:support@jervisbayretreats.com" className="flex items-center gap-3 text-gray-400 hover:text-brand-green transition-colors group w-fit">
                <Mail size={16} className="text-brand-green shrink-0" />
                <span className="text-sm">support@jervisbayretreats.com</span>
              </a>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className={legalStyles}>
            <p>© {currentYear} Jervis Bay Retreats</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
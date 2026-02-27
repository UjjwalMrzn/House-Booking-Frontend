import { Globe, ChevronRight } from 'lucide-react';

const Footer = () => {
  const linkStyles = "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-brand-green cursor-pointer transition-colors";
  const legalStyles = "text-[10px] uppercase tracking-[0.2em] text-gray-600 font-black";

  return (
    <footer className="bg-[#1A1A1A] text-white py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex items-center gap-8 mb-12">
          <div className={linkStyles}>
            <Globe size={14} /> 
            <span>English</span> 
            <ChevronRight size={12} className="rotate-90 text-gray-600"/>
          </div>
          <div className={linkStyles}>
            <span>USD</span> 
            <ChevronRight size={12} className="rotate-90 text-gray-600"/>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className={legalStyles}>
            {/* FIXED: Brand Copyright */}
            <p>© 2026 Jervis Bay Retreats — Powered by Podamibe Nepal</p>
          </div>
          
          <div className="flex gap-8">
            <span className={`${legalStyles} hover:text-white cursor-pointer transition-colors`}>Privacy</span>
            <span className={`${legalStyles} hover:text-white cursor-pointer transition-colors`}>Terms</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
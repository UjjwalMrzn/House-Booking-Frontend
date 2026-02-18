import { Globe, ChevronRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#222] text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="flex items-center gap-2 text-xs font-bold hover:text-brand-green cursor-pointer">
            <Globe size={14} /> English <ChevronRight size={12} className="rotate-90"/>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold hover:text-brand-green cursor-pointer">
            USD <ChevronRight size={12} className="rotate-90"/>
          </div>
        </div>
        <div className="pt-6 border-t border-white/10 flex justify-between items-center text-[10px] uppercase tracking-widest text-gray-500 font-bold">
          <p>©2026 Hinsley Cottage All rights reserved - Powered by Podamibe</p>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer">Privacy</span>
            <span className="hover:text-white cursor-pointer">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
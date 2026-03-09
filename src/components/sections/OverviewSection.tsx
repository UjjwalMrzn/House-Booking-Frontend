import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import SectionHeader from '../ui/SectionHeader';
import FeatureCard from '../ui/FeatureCard';
import { useQuery } from '@tanstack/react-query';
import { propertyService } from '../../api/propertyService';
import { Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const OverviewSection = () => {
  const { data: property } = useQuery({
    queryKey: ['main-property'],
    queryFn: propertyService.getMainProperty,
  });

  const propertyImages = property?.images?.filter((img: any) => !img.is_main) || [];
  
  /* SURGICAL FIX: Downsized the fallback Unsplash images from w=1000 to w=800 to save bandwidth on mobile */
  const img1 = propertyImages[0]?.image || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop";
  const img2 = propertyImages[1]?.image || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop";

  const shortDescription = property?.overView || (property?.description 
    ? property.description.length > 200 
      ? property.description.substring(0, 200) + "..." 
      : property.description
    : "Experience the ultimate coastal getaway. Designed for comfort and style, this elegant residence offers a private sanctuary for families, professionals, and discerning travellers.");

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const viewerImages = [img1, img2];

  const showNext = useCallback(() => {
    setSelectedIndex((prev) => (prev !== null && prev < viewerImages.length - 1 ? prev + 1 : 0));
  }, [viewerImages.length]);

  const showPrev = useCallback(() => {
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : viewerImages.length - 1));
  }, [viewerImages.length]);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
      if ((window as any).Tawk_API?.hideWidget) {
        (window as any).Tawk_API.hideWidget();
      }
    } else {
      document.body.style.overflow = 'unset';
      if ((window as any).Tawk_API?.showWidget) {
        (window as any).Tawk_API.showWidget();
      }
    }
    return () => { 
      document.body.style.overflow = 'unset'; 
      if ((window as any).Tawk_API?.showWidget) {
        (window as any).Tawk_API.showWidget();
      }
    };
  }, [selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "Escape") handleClose(); 
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, showNext, showPrev, handleClose]);

  return (
    <>
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          
          <div className="space-y-10 animate-slide-up">
            <SectionHeader 
              subcite="The Haven Experience"
              title={
                <>
                  Welcome to <br />
                  {/* SURGICAL FIX: Contrast changed from text-slate-400 to text-slate-500 */}
                  <span className="italic text-slate-500 font-serif font-medium">{property?.title || "Your Coastal Retreat"}</span>
                </>
              }
              description={shortDescription}
            />
            
            <div className="pt-4">
              <Link to="/overview" className="group flex items-center gap-3 font-bold text-brand-dark hover:text-brand-green transition-all w-fit">
                <span className="border-b-2 border-brand-green/20 group-hover:border-brand-green pb-1 transition-all">
                  Explore the Property
                </span>
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-brand-green group-hover:text-white transition-all group-hover:translate-x-1 border border-gray-50">
                  →
                </div>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              <div onClick={() => setSelectedIndex(0)} className="cursor-pointer group">
                <FeatureCard 
                  image={img1} 
                  noZoom={true}
                  className="md:mt-12 shadow-2xl shadow-gray-200/50"
                />
              </div>
              <div onClick={() => setSelectedIndex(1)} className="cursor-pointer group">
                <FeatureCard 
                  image={img2} 
                  noZoom={true}
                  className="md:mb-12 shadow-2xl shadow-gray-200/50"
                />
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-green/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
          </div>

        </div>
      </section>

      {selectedIndex !== null && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={handleClose}></div>
          <button onClick={handleClose} className="absolute top-8 right-8 z-[100001] text-white/50 hover:text-white transition-colors">
            <X size={32} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); showPrev(); }} className="absolute left-6 z-[100001] p-3 text-white/30 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-full">
            <ChevronLeft size={36} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); showNext(); }} className="absolute right-6 z-[100001] p-3 text-white/30 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-full">
            <ChevronRight size={36} />
          </button>
          <div className="relative z-[100001] w-full max-w-5xl h-full max-h-[70vh] px-10 flex items-center justify-center pointer-events-none">
            <img src={viewerImages[selectedIndex]} alt="" className="max-w-full max-h-full object-contain pointer-events-auto select-none rounded-lg shadow-2xl animate-scale-up" />
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[100001] flex flex-col items-center gap-4 pointer-events-auto text-center w-full px-8">
            <div className="text-white/60 font-black text-sm uppercase tracking-[0.3em]">{selectedIndex + 1} / {viewerImages.length}</div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default OverviewSection;
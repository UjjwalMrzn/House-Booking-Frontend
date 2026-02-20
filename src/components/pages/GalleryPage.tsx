import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { propertyService } from "../../api/propertyService";
import { ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react";

const GalleryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    location.state?.imageIndex !== undefined ? location.state.imageIndex : null
  ); 
   
  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => propertyService.getPropertyDetails(id || "1"),
  });

  const images = property?.images || [];

  const showNext = useCallback(() => {
    setSelectedIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const showPrev = useCallback(() => {
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  // FIXED: Smart close logic. 
  // If user came from overview image click -> go back to overview.
  // If user is just browsing gallery -> close viewer, stay in gallery.
  const handleClose = useCallback(() => {
    if (location.state?.imageIndex !== undefined) {
      navigate(-1);
    } else {
      setSelectedIndex(null);
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "Escape") handleClose(); // FIXED: Uses smart close
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, showNext, showPrev, handleClose]);

  return (
    <main className="pt-24 bg-white min-h-screen px-6 max-w-6xl mx-auto pb-20 animate-fade-in">
      <button 
        onClick={() => navigate(-1)} 
        className="group flex items-center gap-2 text-gray-400 hover:text-brand-dark font-black text-[10px] uppercase tracking-widest mb-8 transition-all"
      >
        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" /> 
        Back to Overview
      </button>

      <h1 className="text-3xl font-black mb-12 tracking-tight text-brand-dark">
        {isLoading ? "Loading..." : `Photos of ${property?.title}`}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((img: any, index: number) => (
          <div 
            key={img.id} 
            className="cursor-pointer group space-y-3"
            onClick={() => setSelectedIndex(index)}
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-gray-100 shadow-sm aspect-[4/3]">
              <img 
                src={img.image} 
                alt="" 
                className="w-full h-full object-cover transition-all duration-500 group-hover:brightness-90"
              />
            </div>
            {img.caption && (
              <p className="text-[11px] font-bold text-gray-400 px-2 truncate">{img.caption}</p>
            )}
          </div>
        ))}
      </div>

      {/* IMAGE VIEWER */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center">
          {/* FIXED: Uses smart close on backdrop click */}
          <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={handleClose}></div>

          {/* FIXED: Uses smart close on X button */}
          <button 
            onClick={handleClose} 
            className="absolute top-8 right-8 z-[100001] text-white/50 hover:text-white transition-colors"
          >
            <X size={32} />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); showPrev(); }} 
            className="absolute left-6 z-[100001] p-3 text-white/30 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-full"
          >
            <ChevronLeft size={36} />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); showNext(); }} 
            className="absolute right-6 z-[100001] p-3 text-white/30 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-full"
          >
            <ChevronRight size={36} />
          </button>

          {/* Image Container */}
          <div className="relative z-[100001] w-full max-w-5xl h-full max-h-[70vh] px-10 flex items-center justify-center pointer-events-none">
            <img 
              src={images[selectedIndex].image} 
              alt="" 
              className="max-w-full max-h-full object-contain pointer-events-auto select-none rounded-lg shadow-2xl animate-scale-up"
            />
          </div>

          {/* Caption and Counter */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[100001] flex flex-col items-center gap-4 pointer-events-auto text-center w-full px-8">
              {images[selectedIndex].caption && (
                <h3 className="text-white text-xl font-bold tracking-wide">
                  {images[selectedIndex].caption}
                </h3>
              )}
              <div className="text-white/60 font-black text-sm uppercase tracking-[0.3em]">
                {selectedIndex + 1} / {images.length}
              </div>
            </div>
        </div>
      )}
    </main>
  );
};

export default GalleryPage;
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom'; // NEW IMPORT
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService } from '../../../../../api/propertyService';
import { useToast } from '../../../../ui/Toaster';
import { Image as ImageIcon, UploadCloud, X, Star, ChevronLeft, ChevronRight } from 'lucide-react'; // NEW IMPORTS
import Modal from '../../../../ui/Modal';

interface ImagesTabProps {
  propertyId: string;
  images: any[];
  isViewMode?: boolean;
}

const ImagesTab: React.FC<ImagesTabProps> = ({ propertyId, images = [], isViewMode }) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [imgDeleteModal, setImgDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
  
  // NEW: State for Fullscreen Image Viewer
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const uploadImageMutation = useMutation({
    mutationFn: (file: File) => propertyService.uploadPropertyImage(propertyId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      toast.success("Image uploaded successfully!");
    },
    onError: () => toast.error("Failed to upload image.")
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: number) => propertyService.deletePropertyImage(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      toast.success("Image removed.");
    },
    onError: () => toast.error("Failed to remove image.")
  });

  const setMainImageMutation = useMutation({
    mutationFn: (imageId: number) => propertyService.setMainImage(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast.success("Main thumbnail updated!");
    },
    onError: () => toast.error("Failed to update thumbnail.")
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImageMutation.mutate(file);
  };

  // --- NEW: FULLSCREEN VIEWER LOGIC ---
  const showNext = useCallback(() => {
    setSelectedIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const showPrev = useCallback(() => {
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  // Lock body scroll when viewing image
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedIndex]);

  // Keyboard navigation
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
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden animate-entrance">
        <div className="p-6 border-b border-gray-50 bg-white/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-green/10 text-brand-green rounded-lg flex items-center justify-center shadow-inner">
              <ImageIcon size={16} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-black text-brand-dark tracking-tight">Photo Gallery</h3>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
            {images.length} Photos
          </span>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {!isViewMode && (
            <label className="relative flex flex-col items-center justify-center w-full aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-brand-green transition-all cursor-pointer group">
              <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-brand-green transition-colors">
                {uploadImageMutation.isPending ? (
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-brand-green rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UploadCloud size={28} className="mb-2" />
                    <span className="text-xs font-bold">Upload Photo</span>
                  </>
                )}
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploadImageMutation.isPending} />
            </label>
            )}

            {/* FIXED: Passed index to map and updated onClick */}
            {images.map((img: any, index: number) => (
              <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm border border-gray-100 bg-gray-50">
                <img 
                  src={img.image} 
                  alt="Property" 
                  onClick={() => setSelectedIndex(index)} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                
                {!isViewMode && !img.is_main && (
                  <button type="button" onClick={() => setMainImageMutation.mutate(img.id)} className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-amber-500 text-[9px] font-black uppercase tracking-widest px-2 py-1.5 rounded-md flex items-center gap-1 shadow-sm opacity-0 group-hover:opacity-100 transition-all transform -translate-y-2 group-hover:translate-y-0 z-10">
                    <Star size={10} /> Set as Main
                  </button>
                )}
                {!isViewMode && (
                  <button type="button" onClick={() => setImgDeleteModal({ isOpen: true, id: img.id })} className="absolute top-2 right-2 w-8 h-8 bg-white text-red-500 rounded-lg flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all transform -translate-y-2 group-hover:translate-y-0 z-10">
                    <X size={14} strokeWidth={3} />
                  </button>
                )}
                
                {/* Main Badge remains visible even in view mode */}
                {img.is_main && (
                  <div className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1.5 rounded-md flex items-center gap-1 shadow-md z-10">
                    <Star size={10} fill="currentColor" /> Main
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal 
        isOpen={imgDeleteModal.isOpen}
        onClose={() => setImgDeleteModal({ isOpen: false, id: null })}
        onConfirm={() => {
          if (imgDeleteModal.id) deleteImageMutation.mutate(imgDeleteModal.id);
          setImgDeleteModal({ isOpen: false, id: null });
        }}
        title="Remove Photo"
        message="Are you sure you want to remove this photo from your gallery?"
        confirmText="Remove"
        variant="danger"
        loading={deleteImageMutation.isPending}
      />

      {/* NEW: INTERNAL FULLSCREEN IMAGE VIEWER */}
      {selectedIndex !== null && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={handleClose}></div>

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
              className="max-w-full max-h-full object-contain pointer-events-auto select-none rounded-lg shadow-2xl"
            />
          </div>

          {/* Caption and Counter */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[100001] flex flex-col items-center gap-4 pointer-events-auto text-center w-full px-8">
            <div className="text-white/60 font-black text-sm uppercase tracking-[0.3em]">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ImagesTab;
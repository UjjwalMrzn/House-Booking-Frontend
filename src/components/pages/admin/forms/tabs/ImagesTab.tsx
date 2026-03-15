import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom'; 
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService } from '../../../../../api/propertyService';
import { useToast } from '../../../../ui/Toaster';
import { Image as ImageIcon, UploadCloud, X, Star, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'; 
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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sortedImages = useMemo(() => {
    const list = [...(images || [])];
    return list.sort((a, b) => Number(a.id) - Number(b.id));
  }, [images]);

  const uploadImageMutation = useMutation({
    mutationFn: async (files: FileList | File[]) => {
      for (const file of Array.from(files)) {
         await propertyService.uploadPropertyImage(propertyId, file);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      toast.success("Images uploaded successfully!");
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: () => toast.error("Failed to upload some images.")
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
      toast.success("Active thumbnail updated!");
    },
    onError: () => toast.error("Failed to update thumbnail.")
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadImageMutation.mutate(e.target.files);
    }
  };

  /* SURGICAL FIX: Prevent browser from opening file on accidental drop outside the zone */
  const preventGlobalDragDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  /* Dropzone specific handlers */
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const imageFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        uploadImageMutation.mutate(imageFiles);
      } else {
        toast.error("Please drop valid image files only.");
      }
    }
  };

  const showNext = useCallback(() => {
    setSelectedIndex((prev) => (prev !== null && prev < sortedImages.length - 1 ? prev + 1 : 0));
  }, [sortedImages.length]);

  const showPrev = useCallback(() => {
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : sortedImages.length - 1));
  }, [sortedImages.length]);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

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
      if (e.key === "Escape") handleClose(); 
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, showNext, showPrev, handleClose]);

  return (
    <>
      {/* SURGICAL FIX: Added global drag blockers to the container */}
      <div 
        className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden animate-entrance"
        onDragOver={preventGlobalDragDrop}
        onDrop={preventGlobalDragDrop}
      >
        <div className="p-6 border-b border-gray-50 bg-white/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-green/10 text-brand-green rounded-lg flex items-center justify-center shadow-inner">
              <ImageIcon size={16} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-black text-brand-dark tracking-tight">Photo Gallery</h3>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
            {sortedImages.length} Photos
          </span>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {!isViewMode && (
            <label 
              className={`relative flex flex-col items-center justify-center w-full aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer group ${
                isDragging 
                  ? 'border-brand-green bg-brand-green/10 shadow-[0_0_15px_rgba(5,122,85,0.2)] scale-[1.02]' 
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-brand-green'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-brand-green transition-colors pointer-events-none">
                {uploadImageMutation.isPending ? (
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-brand-green rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UploadCloud size={28} className={`mb-2 ${isDragging ? 'text-brand-green' : ''}`} />
                    <span className={`text-xs font-bold text-center px-2 leading-tight ${isDragging ? 'text-brand-green' : ''}`}>
                      Upload<br/>Photo
                    </span>
                  </>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileUpload} disabled={uploadImageMutation.isPending} />
            </label>
            )}

            {sortedImages.map((img: any, index: number) => (
              <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm border border-gray-100 bg-gray-50">
                <img 
                  src={img.image} 
                  alt="Property" 
                  onClick={() => setSelectedIndex(index)} 
                  className="w-full h-full object-cover transition-transform duration-500 lg:group-hover:scale-105 cursor-pointer" 
                />
                
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30 pointer-events-none"></div>
                
                {!isViewMode && (
                  <div className="absolute top-2 right-2 z-10">
                    <button 
                      type="button" 
                      onClick={() => setImgDeleteModal({ isOpen: true, id: img.id })} 
                      className="w-7 h-7 bg-red-500/80 backdrop-blur-md text-white rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 lg:opacity-0 lg:group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
                
                <div className="absolute top-2 left-2 z-10">
                  {img.is_main ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-green/90 backdrop-blur-md text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                      <Star size={8} fill="currentColor" /> Active
                    </div>
                  ) : !isViewMode && (
                    <button 
                      type="button" 
                      onClick={() => setMainImageMutation.mutate(img.id)} 
                      className="w-7 h-7 bg-white/70 backdrop-blur-md text-gray-700 hover:text-brand-green rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 lg:opacity-0 lg:group-hover:opacity-100"
                      title="Set Active"
                    >
                      <Star size={12} />
                    </button>
                  )}
                </div>
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

      {selectedIndex !== null && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={handleClose}></div>
          <button onClick={handleClose} className="absolute top-8 right-8 z-[100001] text-white/50 hover:text-white transition-colors"><X size={32} /></button>
          <button onClick={(e) => { e.stopPropagation(); showPrev(); }} className="absolute left-6 z-[100001] p-3 text-white/30 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-full"><ChevronLeft size={36} /></button>
          <button onClick={(e) => { e.stopPropagation(); showNext(); }} className="absolute right-6 z-[100001] p-3 text-white/30 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-full"><ChevronRight size={36} /></button>
          <div className="relative z-[100001] w-full max-w-5xl h-full max-h-[70vh] px-10 flex items-center justify-center pointer-events-none">
            <img src={sortedImages[selectedIndex].image} alt="" className="max-w-full max-h-full object-contain pointer-events-auto select-none rounded-lg shadow-2xl" />
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[100001] flex flex-col items-center gap-4 pointer-events-auto text-center w-full px-8">
            <div className="text-white/60 font-black text-sm uppercase tracking-[0.3em]">{selectedIndex + 1} / {sortedImages.length}</div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ImagesTab;
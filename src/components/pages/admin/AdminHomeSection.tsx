import { useState, useEffect, useRef, useMemo } from 'react'; // Added useMemo
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { homeService } from '../../../api/homeService';
// SURGICAL FIX: Purged unused imports to clear TS6133 errors
import { Trash2, Star, UploadCloud, Save, Edit2 } from 'lucide-react'; 
import Button from '../../ui/Button';
import { useToast } from '../../ui/Toaster';

const AdminHomeSection = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingText, setIsEditingText] = useState(false);

  const { data: heroImagesData, isLoading: isLoadingImages } = useQuery({
    queryKey: ['home-page-images'],
    queryFn: homeService.getHomePageImages,
  });

  const { data: titlesData, isLoading: isLoadingTitles } = useQuery({
    queryKey: ['home-page-titles'],
    queryFn: homeService.getTitles,
  });

  // SURGICAL FIX: Stable sort by ID ensures images don't jump when toggling Active status
  const heroImages = useMemo(() => {
    const list = [...((heroImagesData as any[]) || [])];
    return list.sort((a, b) => Number(a.id) - Number(b.id));
  }, [heroImagesData]);

  const titles: any[] = (titlesData as any[]) || [];

  const activeBanner = heroImages.find((img: any) => img.is_main) || heroImages[0];
  const activeTitleObj = titles.find((t: any) => t.isMain) || titles[0];
  
  const [draftTitle, setDraftTitle] = useState("");

  useEffect(() => {
    if (activeTitleObj && !isEditingText) {
      setDraftTitle(activeTitleObj.title || "");
    }
  }, [activeTitleObj?.id, activeTitleObj?.title, isEditingText]);

  const handleCancelText = () => {
    setIsEditingText(false);
    setDraftTitle(activeTitleObj?.title || ""); 
  };

  const uploadImageMutation = useMutation({
    mutationFn: (file: File) => homeService.createHomePageImage(file, heroImages.length === 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-page-images'] });
      toast.success('Image uploaded successfully!');
    },
    onError: () => toast.error('Failed to upload image.')
  });

  const deleteImageMutation = useMutation({
    mutationFn: (id: number) => homeService.deleteHomePageImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-page-images'] });
      toast.success('Image removed.');
    }
  });

  const setMainImageMutation = useMutation({
    mutationFn: (id: number) => homeService.updateHomePageImage(id, { is_main: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-page-images'] });
      toast.success('Hero background updated!');
    }
  });

  const saveTitleMutation = useMutation({
    mutationFn: (titleText: string) => {
      if (activeTitleObj?.id) {
        return homeService.updateTitle(activeTitleObj.id, titleText, true);
      } else {
        return homeService.createTitle(titleText, true);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-page-titles'] });
      toast.success('Hero text saved!');
      setIsEditingText(false);
    },
    onError: () => toast.error('Failed to save text.')
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImageMutation.mutate(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveText = () => {
    if (!draftTitle.trim()) return toast.error("Text cannot be empty.");
    saveTitleMutation.mutate(draftTitle);
  };

  const previewImage = activeBanner?.image || "https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=2080&auto=format&fit=crop";
  const isLoading = isLoadingImages || isLoadingTitles;

  if (isLoading) return <div className="p-20 text-center text-gray-400 font-bold animate-pulse">Loading Hero Data...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-fade-in w-full relative px-2">
      
      {/* 1. LIVE HERO PREVIEW */}
      <div className="relative w-full h-[400px] md:h-[550px] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden group shadow-2xl bg-gray-900 border border-gray-100">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] lg:group-hover:scale-105"
          style={{ backgroundImage: `url('${previewImage}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        </div>
        
        <div className="absolute top-6 left-6 bg-brand-green/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 z-20">
          <Star size={12} fill="currentColor" /> Live Preview
        </div>

        <div className="absolute bottom-24 md:bottom-32 left-0 w-full text-center z-10 px-4">
          <h1 className="text-3xl md:text-7xl font-black text-white mb-6 tracking-tight drop-shadow-lg leading-tight">
            {draftTitle || 'Find your sanctuary.'}
          </h1>
        </div>
      </div>

      {/* 2. TEXT EDITOR (RE-ENGINEERED FOR WRAPPING) */}
      <div className="relative -mt-12 md:-mt-16 z-[50] flex justify-center px-4 md:px-6 mb-16">
        <div className="bg-white rounded-[2rem] shadow-xl p-3 flex flex-col md:flex-row items-center w-full max-w-4xl border border-gray-100 gap-3">
          
          <div className="flex-1 w-full relative">
            {/* SURGICAL FIX: Converted to textarea with line-wrapping and limit */}
            <textarea
              value={draftTitle}
              onChange={(e: any) => setDraftTitle(e.target.value)}
              disabled={!isEditingText}
              maxLength={60}
              rows={2}
              className={`peer block w-full px-4 pt-7 pb-2 text-base md:text-lg font-black bg-white border-none rounded-2xl appearance-none transition-all outline-none focus:ring-0 resize-none leading-tight ${
                isEditingText ? 'bg-gray-50/50 cursor-text' : 'bg-transparent text-gray-500 cursor-default'
              }`}
              placeholder=" "
            />
            <label className="absolute text-[10px] md:text-[11px] font-black uppercase tracking-widest text-gray-400 duration-150 transform top-4 z-10 origin-[0] left-4 pointer-events-none scale-75 -translate-y-3">
              Hero Overlay Text
            </label>
            {isEditingText && (
              <div className="absolute top-1 right-2 text-[8px] font-bold text-gray-300 uppercase tracking-widest">
                {draftTitle.length} / 60
              </div>
            )}
          </div>
          
          <div className="hidden md:block w-px h-10 bg-gray-100 shrink-0"></div>

          <div className="flex w-full md:w-auto items-center gap-2">
            {isEditingText && (
              <button 
                onClick={handleCancelText}
                className="px-6 h-[56px] text-sm font-bold text-gray-400 hover:text-brand-dark transition-colors shrink-0"
              >
                Cancel
              </button>
            )}
            
            <Button 
              onClick={isEditingText ? handleSaveText : () => setIsEditingText(true)}
              disabled={isEditingText && (saveTitleMutation.isPending || draftTitle === activeTitleObj?.title)}
              className="flex-1 md:flex-none h-[56px] px-8 rounded-2xl md:rounded-[1.25rem] shrink-0"
            >
              {isEditingText ? (
                saveTitleMutation.isPending ? "Saving..." : <><Save size={18} className="mr-2" /> Save</>
              ) : (
                <><Edit2 size={18} className="mr-2" /> Edit Text</>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 3. IMAGE GALLERY */}
      <div className="px-4 md:px-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-brand-dark tracking-tight">Image Gallery</h2>
            <p className="text-sm font-normal text-gray-400 mt-1">Upload images to set the active hero background.</p>
          </div>
          <span className="w-fit text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
            {heroImages.length} Images
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          
          <label className="relative flex flex-col items-center justify-center w-full aspect-video rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-brand-green/5 hover:border-brand-green transition-all cursor-pointer group shadow-sm">
            {uploadImageMutation.isPending ? (
              <div className="w-8 h-8 border-4 border-gray-200 border-t-brand-green rounded-full animate-spin"></div>
            ) : (
              <>
                <UploadCloud size={24} className="mb-2 text-gray-400 group-hover:text-brand-green transition-colors" />
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 group-hover:text-brand-green transition-colors">Upload</span>
              </>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploadImageMutation.isPending} />
          </label>

          {heroImages.map((img: any) => (
            <div key={img.id} className={`relative aspect-video rounded-2xl overflow-hidden group shadow-sm transition-all border-2 ${img.is_main ? 'border-brand-green ring-4 ring-brand-green/10' : 'border-gray-100'}`}>
              <img src={img.image} alt="Hero Banner" className="w-full h-full object-cover transition-transform duration-700 lg:group-hover:scale-105" />
              
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 pointer-events-none"></div>

              {!img.is_main && (
                <div className="absolute top-2 right-2 z-10">
                  <button 
                    onClick={() => deleteImageMutation.mutate(img.id)}
                    className="w-7 h-7 bg-red-500/80 backdrop-blur-md text-white rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 lg:opacity-0 lg:group-hover:opacity-100"
                    title="Delete Image"
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
                ) : (
                  <button 
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
  );
};

export default AdminHomeSection;
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { homeService } from '../../../api/homeService';
import { Trash2, Star, UploadCloud, CheckCircle, Save } from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { useToast } from '../../ui/Toaster';

const AdminHomeSection = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: heroImagesData, isLoading: isLoadingImages } = useQuery({
    queryKey: ['home-page-images'],
    queryFn: homeService.getHomePageImages,
  });

  const { data: titlesData, isLoading: isLoadingTitles } = useQuery({
    queryKey: ['home-page-titles'],
    queryFn: homeService.getTitles,
  });

  // FIXED: Explicitly cast to any[] to destroy all TypeScript 'unknown' errors
  const heroImages: any[] = (heroImagesData as any[]) || [];
  const titles: any[] = (titlesData as any[]) || [];

  const activeBanner = heroImages.find((img: any) => img.is_main) || heroImages[0];
  const activeTitleObj = titles.find((t: any) => t.isMain) || titles[0];
  
  const [draftTitle, setDraftTitle] = useState("");

  useEffect(() => {
    if (activeTitleObj) {
      setDraftTitle(activeTitleObj.title || "");
    }
  }, [activeTitleObj?.id, activeTitleObj?.title]);

  const uploadImageMutation = useMutation({
    mutationFn: (file: File) => homeService.createHomePageImage(file, heroImages.length === 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-page-images'] });
      toast.success('Image uploaded instantly!');
    },
    onError: () => toast.error('Failed to upload image.')
  });

  const deleteImageMutation = useMutation({
    mutationFn: (id: number) => homeService.deleteHomePageImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-page-images'] });
      toast.success('Image removed from gallery.');
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
      toast.success('Hero text saved successfully!');
    },
    onError: () => toast.error('Failed to save text.')
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImageMutation.mutate(file);
    }
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
    <div className="max-w-7xl mx-auto pb-20 animate-fade-in w-full relative">
      
      {/* 1. LIVE HERO PREVIEW */}
      <div className="relative w-full h-[450px] md:h-[550px] rounded-[3rem] overflow-hidden group shadow-2xl bg-gray-900 border border-gray-100">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] group-hover:scale-105"
          style={{ backgroundImage: `url('${previewImage}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        </div>
        
        <div className="absolute top-6 left-6 bg-brand-green/90 backdrop-blur-md text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 z-20">
          <Star size={14} fill="currentColor" /> Live Preview
        </div>

        <div className="absolute bottom-32 left-0 w-full text-center z-10 px-4">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight drop-shadow-lg">
            {draftTitle || 'Find your sanctuary.'}
          </h1>
        </div>
      </div>

      {/* 2. TEXT EDITOR */}
      <div className="relative -mt-16 z-[50] flex justify-center px-6 overflow-visible mb-16">
        <div className="bg-white rounded-[2rem] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] p-3 flex flex-col md:flex-row items-center w-full max-w-4xl border border-gray-100 gap-3">
          
          <div className="flex-1 w-full relative">
            <Input 
              label="Hero Overlay Text" 
              value={draftTitle} 
              onChange={(e: any) => setDraftTitle(e.target.value)} 
              className="h-[60px] border-none bg-gray-50/50 hover:bg-gray-50 focus:bg-white text-lg font-black"
              placeholder="e.g. Find your sanctuary."
            />
          </div>
          
          <div className="hidden md:block w-px h-10 bg-gray-100 shrink-0"></div>
          
          <Button 
            onClick={handleSaveText}
            disabled={saveTitleMutation.isPending || draftTitle === activeTitleObj?.title}
            className="h-[60px] px-10 rounded-[1.25rem] w-full md:w-auto shrink-0"
          >
            {saveTitleMutation.isPending ? "Saving..." : <><Save size={18} strokeWidth={2.5} /> Save Text</>}
          </Button>
        </div>
      </div>

      {/* 3. IMAGE GALLERY */}
      <div className="px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black text-brand-dark tracking-tight">Image Gallery</h2>
            <p className="text-sm font-bold text-gray-400 mt-1">Upload images and select one to set as the active background.</p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
            {heroImages.length} Images
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          
          <label className="relative flex flex-col items-center justify-center w-full aspect-video rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-brand-green/5 hover:border-brand-green hover:text-brand-green transition-all cursor-pointer group shadow-sm">
            {uploadImageMutation.isPending ? (
              <div className="w-8 h-8 border-4 border-gray-200 border-t-brand-green rounded-full animate-spin"></div>
            ) : (
              <>
                <UploadCloud size={28} strokeWidth={2} className="mb-2 text-gray-400 group-hover:text-brand-green transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-brand-green transition-colors">Upload Image</span>
              </>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploadImageMutation.isPending} />
          </label>

          {heroImages.map((img: any) => (
            <div key={img.id} className={`relative aspect-video rounded-2xl overflow-hidden group shadow-sm transition-all border-2 ${img.is_main ? 'border-brand-green ring-4 ring-brand-green/10' : 'border-gray-100 hover:border-gray-300'}`}>
              <img src={img.image} alt="Hero Banner" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-3 backdrop-blur-sm">
                {!img.is_main && (
                  <button 
                    onClick={() => setMainImageMutation.mutate(img.id)}
                    className="bg-brand-green text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300"
                  >
                    <CheckCircle size={14} strokeWidth={2.5} /> Set Active
                  </button>
                )}
                <button 
                  onClick={() => deleteImageMutation.mutate(img.id)}
                  className="bg-red-500/90 text-white text-[10px] font-black uppercase tracking-widest w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
                  title="Delete Image"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {img.is_main && (
                <div className="absolute top-2 left-2 bg-brand-green text-white px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-md flex items-center gap-1 z-10">
                  <Star size={10} fill="currentColor" /> Active
                </div>
              )}
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default AdminHomeSection;
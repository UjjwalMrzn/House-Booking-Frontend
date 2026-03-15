import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService } from '../../../../api/propertyService';
import { useToast } from '../../../ui/Toaster';
import { ArrowLeft, Home, Image as ImageIcon, ListChecks, FileText, Map as MapIcon, Lock, CheckCircle, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

import BasicTab from './tabs/BasicTab';
import ImagesTab from './tabs/ImagesTab';
import AmenitiesTab from './tabs/AmenitiesTab';
import PoliciesTab from './tabs/PoliciesTab';
import LocationTab from './tabs/LocationTab';
import BondTab from './tabs/BondTab'; // FIX: Imported the BondTab
import AdminPageContainer from '../../../layouts/AdminPageContainer';

const PropertyFormPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const isViewMode = location.pathname.includes('/view/');
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'basic' | 'images' | 'location' | 'bonds' | 'amenities' | 'policies'>('basic');

  const TABS = ['basic', 'images', 'location', 'bonds', 'amenities', 'policies'] as const;
  const currentIndex = TABS.indexOf(activeTab);

  const handleNext = () => {
    if (currentIndex < TABS.length - 1) setActiveTab(TABS[currentIndex + 1]);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setActiveTab(TABS[currentIndex - 1]);
  };

  const [formData, setFormData] = useState({
    title: '', description: '', highlight: '', overView: '', address: '', 
    base_price_per_night: '', weekend_price_per_night: '', holiday_price_per_night: '',
    max_guests: '', beds: '', bedrooms: '', bathroom: ''
  });

  const { data: existingProperty, isLoading: isFetching } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getProperty(id!),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (existingProperty) {
      setFormData({
        title: existingProperty.title || '', 
        description: existingProperty.description || '',
        highlight: existingProperty.highlight || '',
        overView: existingProperty.overView || '',
        address: existingProperty.address || '', 
        base_price_per_night: existingProperty.base_price_per_night || '',
        weekend_price_per_night: existingProperty.weekend_price_per_night || '',
        holiday_price_per_night: existingProperty.holiday_price_per_night || '',
        max_guests: existingProperty.max_guests || '', 
        beds: existingProperty.beds || '',
        bedrooms: existingProperty.bedrooms || '', 
        bathroom: existingProperty.bathroom || ''
      });
    }
  }, [existingProperty]);

  const basicMutation = useMutation({
    mutationFn: (data: any) => isEditMode ? propertyService.updateProperty({ id: id!, data }) : propertyService.createProperty(data),
    onSuccess: (responseData) => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast.success(`Property ${isEditMode ? 'updated' : 'created'} successfully!`);
      if (!isEditMode && responseData?.id) {
        navigate(`/admin/properties/edit/${responseData.id}`, { replace: true });
        setActiveTab('images');
      }
    },
    onError: () => toast.error(`Failed to save property details.`)
  });

  if (isEditMode && isFetching) return <div className="p-10 text-center text-gray-400 font-bold">Loading...</div>;

  const getTabClass = (tabName: string) => {
    const base = "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shrink-0 ";
    if (!isEditMode && tabName !== 'basic') return base + "text-gray-400 bg-gray-50/80 border border-gray-100 cursor-not-allowed select-none";
    if (activeTab === tabName) return base + "text-white bg-brand-dark shadow-[0_8px_15px_-5px_rgba(0,0,0,0.3)]";
    return base + "text-gray-500 bg-white border border-gray-100 hover:bg-gray-50 hover:text-brand-dark shadow-sm";
  };

  return (
    <AdminPageContainer
      title={isViewMode ? 'View Details' : isEditMode ? 'Manage Property' : 'Add New Property'}
      subtitle={isViewMode ? 'Read-only mode locked.' : isEditMode ? 'Update details and media.' : 'Enter basic details first.'}
      icon={
        <Link to="/admin/properties" className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-dark transition-all shadow-sm shrink-0">
          <ArrowLeft size={18} strokeWidth={2.5} />
        </Link>
      }
    >
      <div className="p-4 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8">
          
          {/* Scrollable Tab Navigation */}
          <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide pb-2 lg:pb-0 -mx-4 px-4 md:mx-0 md:px-0 flex-1">
            <button onClick={() => setActiveTab('basic')} className={getTabClass('basic')}><Home size={14} /> Basic</button>
            <button onClick={() => isEditMode && setActiveTab('images')} className={getTabClass('images')} disabled={!isEditMode}>{isEditMode ? <ImageIcon size={14} /> : <Lock size={12} />} Photos</button>
            <button onClick={() => isEditMode && setActiveTab('location')} className={getTabClass('location')} disabled={!isEditMode}>{isEditMode ? <MapIcon size={14} /> : <Lock size={12} />} Map</button>
            
            <button onClick={() => isEditMode && setActiveTab('bonds')} className={getTabClass('bonds')} disabled={!isEditMode}>{isEditMode ? <ShieldCheck size={14} /> : <Lock size={12} />} Bonds</button>

            <button onClick={() => isEditMode && setActiveTab('amenities')} className={getTabClass('amenities')} disabled={!isEditMode}>{isEditMode ? <ListChecks size={14} /> : <Lock size={12} />} Amenities</button>
            <button onClick={() => isEditMode && setActiveTab('policies')} className={getTabClass('policies')} disabled={!isEditMode}>{isEditMode ? <FileText size={14} /> : <Lock size={12} />} Policies</button>
          </div>

          {/* Controls */}
          {isEditMode && (
            <div className={`flex items-center justify-between lg:justify-end gap-3 shrink-0 transition-opacity duration-200 ${(!isViewMode && activeTab === 'basic') ? 'opacity-0 pointer-events-none hidden lg:flex' : 'opacity-100 flex'}`}>
              <div className="flex gap-2">
                <button onClick={handlePrev} className="w-11 h-11 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-brand-dark shadow-sm" title="Prev">
                  <ChevronLeft size={20} strokeWidth={2.5} />
                </button>
                <button onClick={handleNext} className="w-11 h-11 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-brand-dark shadow-sm" title="Next">
                  <ChevronRight size={20} strokeWidth={2.5} />
                </button>
              </div>
              <Link to="/admin/properties" className="flex-1 md:flex-none px-6 h-11 flex items-center justify-center gap-2 text-[13px] font-black tracking-wide bg-brand-green text-white rounded-xl hover:bg-emerald-600 shadow-md lg:ml-1">
                <CheckCircle size={18} strokeWidth={2.5} />
                <span className="hidden xs:inline">{isViewMode ? 'Done Viewing' : 'Done Editing'}</span>
                <span className="xs:hidden">Done</span>
              </Link>
            </div>
          )}
        </div>

        <div className="min-w-0">
          {activeTab === 'basic' && (
            <BasicTab
              formData={formData}
              handleChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
              handleSubmit={(e) => { 
                e.preventDefault(); 
                basicMutation.mutate({ 
                  ...formData, 
                  base_price_per_night: Number(formData.base_price_per_night),
                  weekend_price_per_night: formData.weekend_price_per_night ? Number(formData.weekend_price_per_night) : undefined,
                  holiday_price_per_night: formData.holiday_price_per_night ? Number(formData.holiday_price_per_night) : undefined,
                  max_guests: Number(formData.max_guests), 
                  beds: Number(formData.beds), 
                  bedrooms: Number(formData.bedrooms), 
                  bathroom: Number(formData.bathroom) 
                }); 
              }}
              isPending={basicMutation.isPending}
              isViewMode={isViewMode}
            />
          )}

          {activeTab === 'images' && <ImagesTab propertyId={id!} images={existingProperty?.images} isViewMode={isViewMode} />}
          {activeTab === 'location' && <LocationTab propertyId={Number(id)} isViewMode={isViewMode} />}
          
          {/* FIX: Render Bond Tab */}
          {activeTab === 'bonds' && <BondTab propertyId={Number(id)} isViewMode={isViewMode} />}

          {activeTab === 'amenities' && <AmenitiesTab propertyId={id!} assignedAmenities={existingProperty?.amenities} isViewMode={isViewMode} />}
          {activeTab === 'policies' && <PoliciesTab propertyId={id!} checkInOutRules={existingProperty?.checkInOutRules} policies={existingProperty?.policies} isViewMode={isViewMode} />}
        </div>
      </div>
    </AdminPageContainer>
  );
};

export default PropertyFormPage;
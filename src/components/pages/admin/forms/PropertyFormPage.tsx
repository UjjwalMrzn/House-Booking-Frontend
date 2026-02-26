import { useState, useEffect } from 'react';

import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { propertyService } from '../../../../api/propertyService';

import { useToast } from '../../../ui/Toaster';

import { ArrowLeft, Home, Image as ImageIcon, ListChecks, FileText, Lock, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';



// Import our beautiful new modular tabs!

import BasicTab from './tabs/BasicTab';

import ImagesTab from './tabs/ImagesTab';

import AmenitiesTab from './tabs/AmenitiesTab';

import PoliciesTab from './tabs/PoliciesTab';



const PropertyFormPage = () => {

const { id } = useParams();

const location = useLocation();

const isViewMode = location.pathname.includes('/view/');

const isEditMode = Boolean(id);

const navigate = useNavigate();

const toast = useToast();

const queryClient = useQueryClient();



const [activeTab, setActiveTab] = useState<'basic' | 'images' | 'amenities' | 'policies'>('basic');



// Simple tab navigation logic restored for the arrow buttons

const TABS = ['basic', 'images', 'amenities', 'policies'] as const;

const currentIndex = TABS.indexOf(activeTab);



const handleNext = () => {

if (currentIndex < TABS.length - 1) setActiveTab(TABS[currentIndex + 1]);

};



const handlePrev = () => {

if (currentIndex > 0) setActiveTab(TABS[currentIndex - 1]);

};



const [formData, setFormData] = useState({

title: '', description: '', address: '', base_price_per_night: '',

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

title: existingProperty.title || '', description: existingProperty.description || '',

address: existingProperty.address || '', base_price_per_night: existingProperty.base_price_per_night || '',

max_guests: existingProperty.max_guests || '', beds: existingProperty.beds || '',

bedrooms: existingProperty.bedrooms || '', bathroom: existingProperty.bathroom || ''

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

if (!isEditMode && tabName !== 'basic') return "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-gray-400 bg-gray-50/80 border border-gray-100 cursor-not-allowed select-none";

if (activeTab === tabName) return "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-brand-dark shadow-[0_8px_15px_-5px_rgba(0,0,0,0.3)] transition-all";

return "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-gray-500 bg-white border border-gray-100 hover:bg-gray-50 hover:text-brand-dark transition-all cursor-pointer shadow-sm";

};



return (

<div className="max-w-4xl mx-auto w-full animate-fade-in pb-10">


{/* STANDARD HEADER */}

<div className="mb-6 flex items-center gap-4">

<Link to="/admin/properties" className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-dark transition-all shadow-sm shrink-0">

<ArrowLeft size={18} strokeWidth={2.5} />

</Link>

<div>

<h1 className="text-2xl font-black text-brand-dark tracking-tight">

{isViewMode ? 'View Property Details' : isEditMode ? 'Manage Property' : 'Add New Property'}

</h1>

<p className="text-xs font-bold text-gray-400 mt-0.5">

{isViewMode ? 'Read-only mode. All fields are locked.' : isEditMode ? 'Update details, photos, and policies.' : 'Enter basic details first.'}

</p>

</div>

</div>



{/* TABS & CONTROLS ON THE SAME LINE */}

<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">


{/* Left Side: Tabs */}

<div className="flex flex-wrap gap-2.5">

<button onClick={() => setActiveTab('basic')} className={getTabClass('basic')}><Home size={14} /> Basic Info</button>

<button onClick={() => isEditMode && setActiveTab('images')} className={getTabClass('images')} disabled={!isEditMode}>{isEditMode ? <ImageIcon size={14} /> : <Lock size={12} />} Photos</button>

<button onClick={() => isEditMode && setActiveTab('amenities')} className={getTabClass('amenities')} disabled={!isEditMode}>{isEditMode ? <ListChecks size={14} /> : <Lock size={12} />} Amenities</button>

<button onClick={() => isEditMode && setActiveTab('policies')} className={getTabClass('policies')} disabled={!isEditMode}>{isEditMode ? <FileText size={14} /> : <Lock size={12} />} Policies</button>

</div>



{/* Right Side: Navigation & Done Button (FIXED: Visible on Basic Tab ONLY in View Mode) */}

{isEditMode && (isViewMode || activeTab !== 'basic') && (

<div className="flex items-center gap-2 shrink-0 animate-fade-in">


{/* Prev Tab Button (Hidden on the first tab) */}

{currentIndex > 0 && (

<button

onClick={handlePrev}

className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-brand-dark hover:bg-gray-50 transition-all shadow-sm"

title="Previous Tab"

>

<ChevronLeft size={18} strokeWidth={2.5} />

</button>

)}



{/* Next Tab Button (Hidden on the last tab) */}

{currentIndex < TABS.length - 1 && (

<button

onClick={handleNext}

className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-brand-dark hover:bg-gray-50 transition-all shadow-sm"

title="Next Tab"

>

<ChevronRight size={18} strokeWidth={2.5} />

</button>

)}



{/* Done Editing/Viewing Button */}

<Link

to="/admin/properties"

className="px-6 h-10 flex items-center justify-center gap-2 text-[13px] font-black tracking-wide bg-brand-green text-white rounded-xl hover:bg-emerald-600 shadow-[0_8px_15px_-5px_rgba(74,222,128,0.4)] transition-all ml-1"

title={isViewMode ? 'Done Viewing' : 'Done Editing'}

>

<CheckCircle size={16} strokeWidth={2.5} />

{isViewMode ? 'Done Viewing' : 'Done Editing'}

</Link>



</div>

)}

</div>



{/* CONTENT TABS */}

{activeTab === 'basic' && (

<BasicTab

formData={formData}

handleChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}

handleSubmit={(e) => { e.preventDefault(); basicMutation.mutate({ ...formData, base_price_per_night: Number(formData.base_price_per_night), max_guests: Number(formData.max_guests), beds: Number(formData.beds), bedrooms: Number(formData.bedrooms), bathroom: Number(formData.bathroom) }); }}

isPending={basicMutation.isPending}

isViewMode={isViewMode}

/>

)}


{activeTab === 'images' && <ImagesTab propertyId={id!} images={existingProperty?.images} isViewMode={isViewMode} />}

{activeTab === 'amenities' && <AmenitiesTab propertyId={id!} assignedAmenities={existingProperty?.amenities} isViewMode={isViewMode} />}


{activeTab === 'policies' && (

<PoliciesTab

propertyId={id!}

checkInOutRules={existingProperty?.checkInOutRules}

policies={existingProperty?.policies}

isViewMode={isViewMode}

/>

)}



</div>

);

};



export default PropertyFormPage;
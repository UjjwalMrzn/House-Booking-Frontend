import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService } from '../../../api/propertyService';
import { useToast } from '../../ui/Toaster';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Modal from '../../ui/Modal';
import DynamicIcon from '../../ui/DynamicIcon';
import { Plus, Edit, Trash2, X, Search } from 'lucide-react';

// MASSIVE Property & Lifestyle Icon Library (120+ Icons)
const ICON_LIBRARY = [
  // Tech & Entertainment
  'Wifi', 'Tv', 'Monitor', 'Speaker', 'Gamepad', 'Radio', 'Phone', 'Laptop', 'Plug', 'Battery', 'Video', 'Music', 'Projector', 'Cable',
  // Climate & HVAC
  'Wind', 'Snowflake', 'Flame', 'Sun', 'CloudRain', 'Thermometer', 'Fan', 'Umbrella',
  // Facilities & Outdoors
  'Waves', 'TreePine', 'Palmtree', 'Tent', 'Mountain', 'Dumbbell', 'Car', 'ParkingCircle', 'Bike', 'Bus', 'Train', 'Plane', 'MapPin', 'Compass', 'TreeDeciduous',
  // Food & Kitchen
  'Coffee', 'Utensils', 'CupSoda', 'Wine', 'ChefHat', 'Microwave', 'Refrigerator', 'Martini', 'Pizza', 'Soup',
  // Rooms & Furniture
  'Bed', 'BedDouble', 'BedSingle', 'Bath', 'Sofa', 'DoorClosed', 'DoorOpen', 'Toilet', 'ShowerHead', 'Armchair',
  // Security & Accessibility
  'Lock', 'Key', 'Shield', 'ShieldCheck', 'Eye', 'Bell', 'Accessibility', 'Wheelchair', 'Cctv',
  // Animals
  'Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'PawPrint',
  // Misc & Cleaning
  'Droplets', 'Sparkles', 'Trash', 'FirstAid', 'Briefcase', 'Shirt', 'WashingMachine', 'Iron', 'Home', 'Building', 'Star'
];

const AmenitiesManagementPage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [formModal, setFormModal] = useState({ isOpen: false, isEdit: false, id: '', name: '', icon: 'ListChecks' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', name: '' });
  
  // NEW: Search state for the icon picker
  const [iconSearch, setIconSearch] = useState('');

  // Fetch Master List
  const { data: amenities = [], isLoading } = useQuery({
    queryKey: ['amenities-master'],
    queryFn: propertyService.getAvailableAmenities,
  });

  const saveMutation = useMutation({
    mutationFn: (data: typeof formModal) => {
      if (data.isEdit && data.id) return propertyService.updateMasterAmenity(data.id, { name: data.name, icon: data.icon });
      return propertyService.createMasterAmenity({ name: data.name, icon: data.icon });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities-master'] });
      setFormModal({ isOpen: false, isEdit: false, id: '', name: '', icon: 'ListChecks' });
      setIconSearch(''); // Reset search on close
      toast.success(`Amenity successfully ${formModal.isEdit ? 'updated' : 'created'}!`);
    },
    onError: () => toast.error("Failed to save amenity.")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertyService.deleteMasterAmenity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities-master'] });
      setDeleteModal({ isOpen: false, id: '', name: '' });
      toast.success("Amenity deleted permanently.");
    },
    onError: () => toast.error("Failed to delete amenity. It might be in use.")
  });

  // NEW: Filter the icons based on search
  const filteredIcons = ICON_LIBRARY.filter(icon => 
    icon.toLowerCase().includes(iconSearch.toLowerCase())
  );

  if (isLoading) return <div className="p-10 text-center text-gray-400 font-bold">Loading amenities...</div>;

  return (
    <div className="max-w-5xl mx-auto w-full animate-fade-in">
      
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-brand-dark tracking-tight">Master Amenities</h1>
          <p className="text-sm font-bold text-gray-400 mt-1">Manage the global list of features available for properties.</p>
        </div>
        <Button 
          onClick={() => {
            setFormModal({ isOpen: true, isEdit: false, id: '', name: '', icon: 'ListChecks' });
            setIconSearch('');
          }}
          className="px-5 py-2.5 flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} strokeWidth={3} /> Create Amenity
        </Button>
      </div>

      {/* Amenities Grid */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {amenities.map((amenity: any) => (
            <div key={amenity.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-brand-green/30 transition-all group shadow-sm bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-brand-dark group-hover:text-brand-green group-hover:scale-110 transition-all">
                  <DynamicIcon name={amenity.icon || 'ListChecks'} size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-brand-dark">{amenity.name}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">ID: {amenity.id}</p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => {
                    setFormModal({ isOpen: true, isEdit: true, id: amenity.id, name: amenity.name, icon: amenity.icon || 'ListChecks' });
                    setIconSearch('');
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-brand-dark hover:border-gray-300 shadow-sm"
                >
                  <Edit size={14} />
                </button>
                <button 
                  onClick={() => setDeleteModal({ isOpen: true, id: amenity.id, name: amenity.name })}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-white hover:bg-red-500 hover:border-red-500 shadow-sm"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {amenities.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 font-bold">No master amenities found. Create one!</div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {formModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-black text-brand-dark tracking-tight">{formModal.isEdit ? 'Edit Master Amenity' : 'Create Master Amenity'}</h3>
              <button onClick={() => setFormModal({ ...formModal, isOpen: false })} className="text-gray-400 hover:text-brand-dark transition-colors"><X size={20} strokeWidth={3} /></button>
            </div>
            
            <div className="p-6 space-y-6">
              <Input 
                label="Amenity Name" 
                name="name" 
                value={formModal.name} 
                onChange={(e) => setFormModal({ ...formModal, name: e.target.value })} 
                placeholder="e.g., Fast WiFi, Pet Friendly..." 
                required 
              />

              <div className="space-y-3 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 flex justify-between items-center">
                  <span>Choose Icon</span>
                  <span className="text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-md">{formModal.icon}</span>
                </label>
                
                {/* NEW: Search Input for Icons */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text"
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    placeholder="Search icons (e.g., wifi, bed)..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-brand-dark outline-none focus:border-brand-green"
                  />
                </div>
                
                {/* Visual Icon Library Grid */}
                <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 pr-2 custom-scrollbar bg-white rounded-lg border border-gray-100">
                  {filteredIcons.length > 0 ? (
                    filteredIcons.map((iconName) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setFormModal({ ...formModal, icon: iconName })}
                        className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                          formModal.icon === iconName 
                            ? 'bg-brand-dark text-white shadow-md scale-110 z-10' 
                            : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-brand-green/10 hover:text-brand-green hover:border-brand-green/20'
                        }`}
                        title={iconName}
                      >
                        <DynamicIcon name={iconName} size={18} />
                      </button>
                    ))
                  ) : (
                    <div className="col-span-6 py-4 text-center text-xs font-bold text-gray-400">
                      No icons found.
                    </div>
                  )}
                </div>
              </div>

              <Button 
                onClick={() => saveMutation.mutate(formModal)} 
                disabled={!formModal.name || !formModal.icon || saveMutation.isPending} 
                className="w-full py-3"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save to Global List'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <Modal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
        onConfirm={() => deleteMutation.mutate(deleteModal.id)}
        title="Delete Master Amenity"
        message={`Are you sure you want to delete "${deleteModal.name}"? This will remove it from all properties using it.`}
        confirmText="Delete Permanently"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AmenitiesManagementPage;
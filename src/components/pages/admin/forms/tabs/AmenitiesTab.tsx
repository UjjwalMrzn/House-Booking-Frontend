import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom'; // <--- ADDED PORTAL
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService } from '../../../../../api/propertyService';
import { useToast } from '../../../../ui/Toaster';
import { ListChecks, Plus, Edit, Trash2, X, ChevronDown, Check } from 'lucide-react';
import Button from '../../../../ui/Button';
import DynamicIcon from '../../../../ui/DynamicIcon';

interface AmenitiesTabProps {
  propertyId: string;
  assignedAmenities: any[];
  isViewMode?: boolean;
}

const AmenitiesTab: React.FC<AmenitiesTabProps> = ({ propertyId, assignedAmenities = [], isViewMode }) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: availableAmenities = [] } = useQuery({
    queryKey: ['amenities-master'],
    queryFn: propertyService.getAvailableAmenities,
  });

  const [amenityForm, setAmenityForm] = useState({ 
    isOpen: false, 
    isEdit: false, 
    assignmentId: null as number | null, 
    amenityId: '', 
    description: '' 
  });

  // State to control our custom dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveAmenityMutation = useMutation({
    mutationFn: async (data: typeof amenityForm) => {
      if (data.isEdit && data.assignmentId) {
        return propertyService.updatePropertyAmenity(data.assignmentId, { description: data.description });
      }
      return propertyService.addPropertyAmenity({ property: propertyId, amenity: Number(data.amenityId), description: data.description });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      setAmenityForm({ isOpen: false, isEdit: false, assignmentId: null, amenityId: '', description: '' });
      toast.success(`Amenity ${amenityForm.isEdit ? 'updated' : 'added'} successfully!`);
    },
    onError: () => toast.error("Failed to save. Check console for details.")
  });

  const deleteAmenityMutation = useMutation({
    mutationFn: (assignmentId: number) => propertyService.deletePropertyAmenity(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      toast.success("Amenity removed successfully!");
    },
    onError: () => toast.error("Failed to remove amenity.")
  });

  // Helper to find the selected amenity name
  const selectedAmenityName = availableAmenities.find((a: any) => String(a.id) === amenityForm.amenityId)?.name || 'Select an amenity...';

  return (
    <>
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden animate-entrance">
        {/* Header */}
        <div className="p-6 border-b border-gray-50 bg-white/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-green/10 text-brand-green rounded-lg flex items-center justify-center shadow-inner">
              <ListChecks size={16} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-black text-brand-dark tracking-tight">Property Amenities</h3>
          </div>
          {!isViewMode && (
            <Button onClick={() => setAmenityForm({ isOpen: true, isEdit: false, assignmentId: null, amenityId: '', description: '' })} className="px-4 py-2 text-xs flex items-center gap-2">
              <Plus size={14} strokeWidth={3} /> Add Amenity
            </Button>
          )}
        </div>

        {/* List */}
        <div className="p-6">
          {assignedAmenities.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-sm font-bold text-gray-400">No amenities linked yet. Click above to assign one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignedAmenities.map((amenity: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 text-brand-dark rounded-lg flex items-center justify-center">
                       <DynamicIcon name={amenity.icon || 'ListChecks'} size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-brand-dark">{amenity.name}</h4>
                      <p className="text-xs font-bold text-gray-400 mt-0.5">{amenity.description}</p>
                    </div>
                  </div>
                  {!isViewMode && (
                  <div className="flex gap-2">
                   <button 
                      onClick={() => {
                        const assignmentId = amenity.property_amenity_id || amenity.id;
                        const masterAmenityId = amenity.amenity_id || amenity.amenity; 
                        setAmenityForm({ isOpen: true, isEdit: true, assignmentId, amenityId: String(masterAmenityId), description: amenity.description });
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-brand-green hover:text-white transition-colors"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => {
                        const assignmentId = amenity.property_amenity_id || amenity.id;
                        if (window.confirm(`Remove ${amenity.name} from this property?`)) deleteAmenityMutation.mutate(assignmentId);
                      }} 
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Teleported to document.body */}
      {amenityForm.isOpen && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-fade-in"
          onMouseDown={() => {
            // Closes everything if you click the dark background
            setAmenityForm({ ...amenityForm, isOpen: false });
            setIsDropdownOpen(false); 
          }}
        >
          <div 
            className="bg-white w-full max-w-md rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden animate-slide-up"
            onMouseDown={(e) => e.stopPropagation()} // Prevents the background click from triggering if you click inside the white box
          >
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-black text-brand-dark tracking-tight">
                {amenityForm.isEdit ? 'Edit Description' : 'Assign Amenity'}
              </h3>
              <button 
                onClick={() => {
                  setAmenityForm({ ...amenityForm, isOpen: false });
                  setIsDropdownOpen(false);
                }} 
                className="text-gray-400 hover:text-brand-dark transition-colors"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>
            
            <div className="p-6 space-y-5 overflow-visible">
              
              {/* THE CUSTOM DROPDOWN */}
              <div className="space-y-1.5 relative" ref={dropdownRef}>
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Select Feature</label>
                
                <button
                  type="button"
                  disabled={amenityForm.isEdit}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full px-4 py-3 flex items-center justify-between bg-white border rounded-xl text-sm font-bold outline-none transition-all ${
                    isDropdownOpen ? 'border-brand-green ring-2 ring-brand-green/10' : 'border-gray-200 hover:border-gray-300'
                  } ${amenityForm.isEdit ? 'bg-gray-50 cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                >
                  <span className={amenityForm.amenityId ? 'text-brand-dark' : 'text-gray-400'}>
                    {selectedAmenityName}
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Options Box */}
                {isDropdownOpen && (
                  <div className="absolute z-50 top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] py-2 max-h-60 overflow-y-auto custom-scrollbar animate-fade-in">
                    {availableAmenities.map((a: any) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          setAmenityForm({ ...amenityForm, amenityId: String(a.id) });
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-bold flex items-center justify-between transition-colors hover:bg-brand-green/5 hover:text-brand-green"
                      >
                        <span className={amenityForm.amenityId === String(a.id) ? 'text-brand-green' : 'text-gray-600'}>
                          {a.name}
                        </span>
                        {amenityForm.amenityId === String(a.id) && <Check size={16} className="text-brand-green" />}
                      </button>
                    ))}
                    {availableAmenities.length === 0 && (
                      <div className="px-4 py-3 text-xs text-gray-400 font-bold text-center">No master amenities available.</div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1.5 relative group pb-4">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Custom Description</label>
                <textarea 
                  value={amenityForm.description} 
                  onChange={(e) => setAmenityForm({ ...amenityForm, description: e.target.value })} 
                  placeholder="e.g., Fast 500Mbps WiFi, Pets welcome..." 
                  maxLength={150} 
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-brand-dark outline-none focus:border-brand-green resize-none"
                />
                {!isViewMode && (
                  <div className="absolute bottom-0 right-2 text-[10px] font-bold text-gray-400">
                    <span className={amenityForm.description?.length >= 150 ? 'text-red-500' : ''}>
                      {amenityForm.description?.length || 0}
                    </span> / 150
                  </div>
                )}
              </div>

              <Button 
                onClick={() => saveAmenityMutation.mutate(amenityForm)} 
                disabled={!amenityForm.amenityId || !amenityForm.description || saveAmenityMutation.isPending} 
                className="w-full py-3"
              >
                {saveAmenityMutation.isPending ? 'Saving...' : 'Save Amenity'}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default AmenitiesTab;
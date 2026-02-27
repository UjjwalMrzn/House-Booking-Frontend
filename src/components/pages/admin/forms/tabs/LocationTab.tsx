import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Map as MapIcon, Save, MapPin, Search, ExternalLink, Navigation, Edit2 } from 'lucide-react';
import { mapService } from '../../../../../api/mapService';
import { useToast } from '../../../../ui/Toaster';
import Input from '../../../../ui/Input';
import Button from '../../../../ui/Button';

interface LocationTabProps {
  propertyId: number | null;
  isViewMode?: boolean;
}

const LocationTab: React.FC<LocationTabProps> = ({ propertyId, isViewMode }) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [formData, setFormData] = useState({ latitude: '', longitude: '' });
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  const { data: mapData, isLoading } = useQuery({
    queryKey: ['admin-map', propertyId],
    queryFn: () => mapService.getMapByPropertyId(propertyId!),
    enabled: !!propertyId,
  });

  const hasExistingData = Boolean(mapData?.latitude && mapData?.longitude);

  useEffect(() => {
    if (mapData) {
      setFormData({ latitude: mapData.latitude || '', longitude: mapData.longitude || '' });
    }
  }, [mapData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearchMap = () => {
    if(searchQuery) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`, '_blank');
    } else {
      toast.error("Please enter an address to search first.");
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (data: { property: number; latitude: string; longitude: string }) => {
      if (hasExistingData) {
        const targetId = mapData?.id || propertyId;
        return mapService.updateMap(targetId!, data);
      } else {
        return mapService.createMap(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-map', propertyId] });
      toast.success(`Map coordinates ${hasExistingData ? 'updated' : 'saved'} successfully!`);
      setIsEditingLocation(false); 
    },
    onError: () => toast.error('Failed to save map coordinates.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) return;

    const formattedLat = parseFloat(formData.latitude).toFixed(6);
    const formattedLng = parseFloat(formData.longitude).toFixed(6);

    saveMutation.mutate({
      property: propertyId,
      latitude: formattedLat,
      longitude: formattedLng,
    });
  };

  if (!propertyId) {
    return (
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-12 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
          <MapIcon size={24} />
        </div>
        <h3 className="text-lg font-black text-brand-dark mb-2">Save Property First</h3>
        <p className="text-sm font-bold text-gray-400">You must save the basic property details before adding map coordinates.</p>
      </div>
    );
  }

  const hasValidPreview = formData.latitude && formData.longitude && !isNaN(Number(formData.latitude)) && !isNaN(Number(formData.longitude));
  
  const isInputDisabled = isViewMode || isLoading || (hasExistingData && !isEditingLocation);

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] flex flex-col animate-entrance">
      <div className="p-6 border-b border-gray-50 bg-white flex items-center gap-3 shrink-0 rounded-t-[2rem]">
        <div className="w-8 h-8 bg-brand-green/10 text-brand-green rounded-lg flex items-center justify-center">
          <Navigation size={16} strokeWidth={2.5} />
        </div>
        <h3 className="text-lg font-black text-brand-dark tracking-tight">Location & Coordinates</h3>
      </div>

      <div className="p-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            <div className="bg-white border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] p-6 rounded-[1.5rem]">
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-brand-dark flex items-center gap-2">
                  <MapPin size={14} className="text-brand-green" /> Exact Coordinates
                </h4>
                
                {/* NEW: Sleek Edit Pencil Icon directly in the box header */}
                {hasExistingData && !isEditingLocation && !isViewMode && (
                  <button 
                    type="button"
                    onClick={() => setIsEditingLocation(true)}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-brand-dark transition-colors"
                    title="Edit Coordinates"
                  >
                    <Edit2 size={14} strokeWidth={2.5} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Edit</span>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <Input 
                  label="Latitude (e.g., 27.695)" 
                  name="latitude" 
                  value={formData.latitude} 
                  onChange={handleChange} 
                  required 
                  disabled={isInputDisabled} 
                />
                <Input 
                  label="Longitude (e.g., 85.315)" 
                  name="longitude" 
                  value={formData.longitude} 
                  onChange={handleChange} 
                  required 
                  disabled={isInputDisabled} 
                />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 p-6 rounded-[1.5rem]">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                <Search size={14} /> Find Coordinates
              </h4>
              <Input 
                label="Search Area"
                placeholder="City, landmark, or address..." 
                value={searchQuery} 
                onChange={(e: any) => setSearchQuery(e.target.value)} 
              />
              <button 
                type="button" 
                onClick={handleSearchMap} 
                className="mt-4 w-full h-11 bg-white border border-gray-200 text-brand-dark hover:bg-brand-dark hover:text-white hover:border-brand-dark font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                Open Google Maps <ExternalLink size={14} />
              </button>
            </div>

          </div>

          <div className="lg:col-span-8">
            <div className="bg-[#F9F9F7] rounded-[2rem] border border-gray-200 overflow-hidden relative h-full min-h-[400px] flex items-center justify-center w-full shadow-inner">
              {hasValidPreview ? (
                <iframe 
                  width="100%" 
                  height="100%" 
                  className="absolute inset-0 pointer-events-none" 
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${formData.latitude},${formData.longitude}&z=15&output=embed`} 
                  allowFullScreen 
                  loading="lazy"
                />
              ) : (
                <div className="text-center p-8 max-w-xs">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4 shadow-sm border border-gray-100">
                    <MapIcon size={24} />
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest text-gray-400">Map Preview</p>
                  <p className="text-xs font-bold text-gray-400 mt-2 leading-relaxed">
                    Paste valid latitude and longitude coordinates to generate the live map preview.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* NEW: Footer only shows when creating new data OR when actively editing */}
      {!isViewMode && (!hasExistingData || isEditingLocation) && (
        <div className="px-8 py-5 border-t border-gray-50 bg-gray-50/50 flex justify-end gap-3 shrink-0 rounded-b-[2rem]">
          {isEditingLocation && (
            <button 
              type="button" 
              onClick={() => { 
                setIsEditingLocation(false); 
                setFormData({ latitude: mapData.latitude || '', longitude: mapData.longitude || '' }); 
              }} 
              className="px-6 font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
          )}
          <Button type="submit" className="px-8 py-2.5 text-sm flex items-center gap-2 shadow-[0_8px_15px_-5px_rgba(74,222,128,0.4)]" disabled={saveMutation.isPending || isLoading}>
            <Save size={16} strokeWidth={2.5} />
            {saveMutation.isPending ? 'Saving...' : hasExistingData ? 'Update Location' : 'Save Location'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default LocationTab;
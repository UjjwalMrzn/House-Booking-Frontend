import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService } from '../../../api/propertyService';
import { useToast } from '../../ui/Toaster';
import { Plus, Home, MapPin, Edit, Trash2, Users, BedDouble, Star, Search, Eye, X, CheckCircle } from 'lucide-react';
import { Skeleton } from '../../ui/Skeleton';
import { Link } from 'react-router-dom';
import Modal from '../../ui/Modal';

const PropertyManagementPage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; title: string }>({
    isOpen: false, id: null, title: ""
  });

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: propertyService.getAllProperties,
  });

  const deleteMutation = useMutation({
    mutationFn: propertyService.deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast.success("Property deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete property");
    }
  });

  const setMainMutation = useMutation({
    mutationFn: propertyService.setMainProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['main-property'] });
      toast.success("Active listing updated!");
    },
    onError: () => toast.error("Failed to update active listing")
  });

  const filteredProperties = properties.filter((property: any) => 
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto w-full animate-fade-in">
      
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-dark tracking-tight mb-1">Properties</h1>
          <p className="text-sm font-bold text-gray-400">Manage your listings, pricing, and details.</p>
        </div>
        
        <Link 
          to="/admin/properties/new" 
          className="bg-brand-green text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-600 hover:shadow-[0_8px_15px_-5px_rgba(74,222,128,0.4)] transition-all"
        >
          <Plus size={16} strokeWidth={3} />
          Add New Property
        </Link>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
        
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white/50">
          <h3 className="text-lg font-black text-brand-dark tracking-tight flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center shadow-inner">
              <Home size={16} strokeWidth={2.5} />
            </div>
            Active Listings
            <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
              {filteredProperties.length} Total
            </span>
          </h3>

          <div className="relative w-full sm:w-64 group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-green transition-colors">
              <Search size={14} strokeWidth={3} />
            </div>
            <input 
              type="text" 
              placeholder="Search properties..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-brand-dark outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green focus:bg-white transition-all placeholder:text-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark hover:bg-gray-200 p-1 rounded-full transition-colors flex items-center justify-center"
                title="Clear search"
              >
                <X size={14} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="space-y-3 p-2">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} variant="button" className="h-16" />)}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-5">
                 {searchTerm ? <Search size={28} strokeWidth={2} /> : <Home size={28} strokeWidth={1.5} />}
              </div>
              <h4 className="text-base font-black text-brand-dark mb-1 tracking-tight">
                {searchTerm ? "No results found" : "No properties found"}
              </h4>
              <p className="text-xs font-bold text-gray-400 max-w-sm mx-auto">
                {searchTerm 
                  ? `We couldn't find any properties matching "${searchTerm}".`
                  : "You haven't added any properties yet. Click the 'Add New Property' button to get started."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr>
                    <th className="px-5 pb-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Listing</th>
                    <th className="px-5 pb-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Capacity</th>
                    <th className="px-5 pb-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Rating</th>
                    <th className="px-5 pb-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Price / Night</th>
                    <th className="px-5 pb-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-bold text-brand-dark">
                  {filteredProperties.map((property: any) => {
                    const mainImage = property.images?.find((img: any) => img.is_main)?.image || property.images?.[0]?.image;                    
                    const rating = typeof property.average_rating === 'number' 
                      ? property.average_rating.toFixed(1) 
                      : (property.average_rating ? Number(property.average_rating).toFixed(1) : 'New');

                    return (
                      <tr key={property.id} className="group transition-colors hover:bg-gray-50/80 cursor-default">
                        
                        <td className="py-3 px-5 rounded-l-2xl">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                              {mainImage ? (
                                <img src={mainImage} alt={property.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <Home size={16} />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="text-sm font-black tracking-tight text-brand-dark flex items-center gap-2">
                                {property.title}
                                {property.isMain && (
                                  <span className="bg-brand-green/10 text-brand-green border border-brand-green/20 text-[8px] px-2 py-0.5 rounded-md uppercase tracking-widest font-black flex items-center gap-1">
                                    <Star size={10} fill="currentColor" /> Active
                                  </span>
                                )}
                              </span>
                              <span className="text-[9px] text-gray-400 uppercase tracking-wider font-bold flex items-center gap-1 mt-0.5">
                                <MapPin size={9} /> {property.address}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-5">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                              <Users size={11} className="text-indigo-400" /> {property.max_guests} Guests
                            </span>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                              <BedDouble size={11} className="text-amber-400" /> {property.bedrooms} Beds
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-5">
                          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-500 w-fit px-2 py-1 rounded-md border border-amber-100">
                            <Star size={10} fill="currentColor" />
                            <span className="text-[10px] font-black mt-0.5">{rating}</span>
                          </div>
                        </td>

                        <td className="py-3 px-5">
                          <span className="text-base font-black tracking-tight text-brand-green">
                            ${Number(property.base_price_per_night).toLocaleString()}
                          </span>
                        </td>

                        <td className="py-3 px-5 text-right rounded-r-2xl">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* THE FIX: Show a disabled 'Active' block instead of empty space */}
                            {property.isMain ? (
                              <div className="mr-2 h-8 px-3 flex items-center justify-center rounded-lg bg-brand-green/10 border border-brand-green/20 text-brand-green text-[9px] font-black uppercase tracking-widest select-none cursor-default" title="This is the active public listing">
                                <CheckCircle size={12} className="mr-1" /> Active
                              </div>
                            ) : (
                              <button 
                                onClick={() => setMainMutation.mutate(property.id)}
                                className="mr-2 h-8 px-3 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-200 text-gray-500 hover:bg-brand-green hover:border-brand-green hover:text-white transition-all shadow-sm text-[9px] font-black uppercase tracking-widest"
                                title="Set as public active listing"
                              >
                                <CheckCircle size={12} className="mr-1" /> Set Active
                              </button>
                            )}

                            <Link 
                              to={`/admin/properties/view/${property.id}`} 
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-500 transition-all shadow-sm"
                              title="View Property Details"
                            >
                              <Eye size={14} />
                            </Link>

                            <Link 
                              to={`/admin/properties/edit/${property.id}`}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-brand-green hover:border-brand-green hover:text-white transition-all shadow-sm"
                              title="Edit Property"
                            >
                              <Edit size={14} />
                            </Link>
                            
                            <button 
                              onClick={() => setDeleteModal({ isOpen: true, id: property.id, title: property.title })}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all shadow-sm"
                              title="Delete Property"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={() => {
          if (deleteModal.id) deleteMutation.mutate(deleteModal.id);
          setDeleteModal({ ...deleteModal, isOpen: false });
        }}
        title="Delete Property"
        message={`Are you sure you want to delete "${deleteModal.title}"? All bookings and photos for this cottage will be lost.`}
        confirmText="Delete Now"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default PropertyManagementPage;
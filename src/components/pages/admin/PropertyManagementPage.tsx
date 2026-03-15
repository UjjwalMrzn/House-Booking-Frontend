import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService } from '../../../api/propertyService';
import { useToast } from '../../ui/Toaster';
import { Plus, Home, MapPin, Edit, Trash2, Users, BedDouble, Star, Eye, CheckCircle } from 'lucide-react';
import { Skeleton } from '../../ui/Skeleton';
import { Link } from 'react-router-dom';
import Modal from '../../ui/Modal';
import TableToolbar from '../../ui/TableToolbar';
import AdminPageContainer from '../../layouts/AdminPageContainer';

const PropertyManagementPage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; title: string }>({ isOpen: false, id: null, title: "" });

  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ['admin-properties', page, Number(pageSize)],
    queryFn: () => propertyService.getAllProperties(page, Number(pageSize)),
  });

  const properties = useMemo(() => {
    if (!paginatedData) return [];
    return Array.isArray(paginatedData) ? paginatedData : (paginatedData.results || []);
  }, [paginatedData]);

  const totalCount = paginatedData?.count || properties.length;

  const deleteMutation = useMutation({
    mutationFn: propertyService.deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast.success("Property deleted successfully");
    },
    onError: () => toast.error("Failed to delete property")
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
    <>
      <AdminPageContainer
        title="Properties"
        subtitle="Manage your listings, pricing, and details."
        icon={<Home size={32} />}
        headerAction={
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white shadow-sm px-2.5 py-1 rounded-md border border-gray-100">
              {totalCount} Total
            </span>
            <Link to="/admin/properties/new" className="w-full md:w-auto bg-brand-green text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 hover:shadow-[0_8px_15px_-5px_rgba(74,222,128,0.4)] transition-all">
              <Plus size={16} strokeWidth={3} /> Add New Property
            </Link>
          </div>
        }
      >
        <TableToolbar 
          searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchPlaceholder="Search properties..."
          page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize} hasNextPage={!!paginatedData?.next}
        />
        
        <div className="p-2 md:p-4">
          {isLoading ? (
            <div className="space-y-3 p-2">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} variant="button" className="h-16" />)}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-5">
                 <Home size={28} strokeWidth={1.5} />
              </div>
              <h4 className="text-base font-black text-brand-dark mb-1 tracking-tight">No properties found</h4>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-separate border-spacing-y-2 min-w-[700px] md:min-w-[850px]">
                <thead>
                  <tr>
                    {/* SURGICAL FIX: Added S.N. Column Header */}
                    <th className="px-5 pb-2 text-[9px] font-black uppercase tracking-widest text-gray-400 w-12">S.N.</th>
                    
                    <th className="px-5 pb-2 text-[9px] font-black uppercase tracking-widest text-gray-400">Listing</th>
                    <th className="hidden sm:table-cell px-5 pb-2 text-[9px] font-black uppercase tracking-widest text-gray-400">Capacity</th>
                    <th className="hidden md:table-cell px-5 pb-2 text-[9px] font-black uppercase tracking-widest text-gray-400">Rating</th>
                    <th className="px-5 pb-2 text-[9px] font-black uppercase tracking-widest text-gray-400">Price</th>
                    <th className="px-5 pb-2 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-bold text-brand-dark">
                  {filteredProperties.map((property: any, index: number) => {
                    const mainImage = property.images?.find((img: any) => img.is_main)?.image || property.images?.[0]?.image;                    
                    const rating = typeof property.average_rating === 'number' ? property.average_rating.toFixed(1) : (property.average_rating ? Number(property.average_rating).toFixed(1) : 'New');
                    
                    /* SURGICAL FIX: Calculate continuous serial number */
                    const serialNumber = (page - 1) * Number(pageSize) + index + 1;

                    return (
                      <tr key={property.id} className="group bg-white transition-colors hover:bg-gray-50/80 cursor-default">
                        {/* SURGICAL FIX: Added S.N. Cell and shifted rounded-l-2xl here */}
                        <td className="py-3 px-5 rounded-l-2xl text-sm font-bold text-gray-500">{serialNumber}</td>
                        
                        {/* SURGICAL FIX: Removed rounded-l-2xl from this column since it's no longer the leftmost */}
                        <td className="py-3 px-5 md:rounded-none whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                              {mainImage ? <img src={mainImage} alt={property.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Home size={16} /></div>}
                            </div>
                            <div className="flex flex-col items-start min-w-0">
                              <span className="text-sm font-black tracking-tight text-brand-dark flex items-center gap-2 truncate max-w-[150px] md:max-w-full">
                                {property.title}
                                {property.isMain && <Star size={10} className="text-brand-green" fill="currentColor" />}
                              </span>
                              <span className="text-[9px] text-gray-400 uppercase tracking-wider font-bold flex items-center gap-1 mt-0.5 truncate max-w-[150px] md:max-w-full"><MapPin size={9} /> {property.address}</span>
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell py-3 px-5 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><Users size={11} className="text-indigo-400" /> {property.max_guests} Guests</span>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><BedDouble size={11} className="text-amber-400" /> {property.bedrooms} Beds</span>
                          </div>
                        </td>
                        <td className="hidden md:table-cell py-3 px-5">
                          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-500 w-fit px-2 py-1 rounded-md border border-amber-100">
                            <Star size={10} fill="currentColor" /><span className="text-[10px] font-black mt-0.5">{rating}</span>
                          </div>
                        </td>
                        <td className="py-3 px-5 whitespace-nowrap">
                          <span className="text-base font-black tracking-tight text-brand-green">${Number(property.base_price_per_night).toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-5 text-right rounded-r-2xl">
                          <div className="flex items-center justify-end gap-1.5">
                            {property.isMain ? (
                              <div className="h-8 px-3 flex items-center justify-center rounded-lg bg-brand-green/10 border border-brand-green/20 text-brand-green text-[9px] font-black uppercase tracking-widest select-none cursor-default"><CheckCircle size={12} className="mr-1" /> Active</div>
                            ) : (
                              <button onClick={() => setMainMutation.mutate(property.id)} className="h-8 px-3 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-200 text-gray-400 hover:bg-brand-green hover:border-brand-green hover:text-white transition-all text-[9px] font-black uppercase tracking-widest">Set Active</button>
                            )}
                            <Link to={`/admin/properties/view/${property.id}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition-all"><Eye size={14} /></Link>
                            <Link to={`/admin/properties/edit/${property.id}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:bg-brand-green hover:text-white transition-all"><Edit size={14} /></Link>
                            <button onClick={() => setDeleteModal({ isOpen: true, id: property.id, title: property.title })} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
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
      </AdminPageContainer>

      <Modal 
        isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={() => { if (deleteModal.id) deleteMutation.mutate(deleteModal.id); setDeleteModal({ ...deleteModal, isOpen: false }); }}
        title="Delete Property" message={`Are you sure you want to delete "${deleteModal.title}"?`} confirmText="Delete Now" variant="danger" loading={deleteMutation.isPending}
      />
    </>
  );
};

export default PropertyManagementPage;
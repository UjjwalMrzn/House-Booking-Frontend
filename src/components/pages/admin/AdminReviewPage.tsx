import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../../../api/reviewService'; 
import { propertyService } from '../../../api/propertyService';
import { useToast } from '../../ui/Toaster';
import { MessageSquare, Star, Trash2, Eye, ArrowUpDown, ChevronUp, ChevronDown, User, MapPin, Calendar } from 'lucide-react';
import Modal from '../../ui/Modal';
import FormModal from '../../ui/FormModal';
import TableToolbar from '../../ui/TableToolbar';
import AdminPageContainer from '../../layouts/AdminPageContainer';

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;

const RATING_OPTIONS = [
  { value: 'all', label: 'All Ratings' },
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '2', label: '2 Stars' },
  { value: '1', label: '1 Star' },
];

const AdminReviewsPage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");

  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; title: string }>({ isOpen: false, id: null, title: "" });
  const [viewModal, setViewModal] = useState<{ isOpen: boolean, review: any | null }>({ isOpen: false, review: null });

  const { data: reviewsData, isLoading: isReviewsLoading } = useQuery({
    queryKey: ['admin-reviews', page, Number(pageSize)],
    queryFn: () => reviewService.getAllReviews(page, Number(pageSize)), 
  });

  const { data: propertiesData, isLoading: isPropertiesLoading } = useQuery({
    queryKey: ['admin-properties-mapping'],
    queryFn: () => propertyService.getAllProperties(1, 500), 
  });

  const isLoading = isReviewsLoading || isPropertiesLoading;

  const propertyMap = useMemo(() => {
    const map: Record<string, string> = {};
    const propsArray = Array.isArray(propertiesData) ? propertiesData : ((propertiesData as any)?.results || []);
    propsArray.forEach((p: any) => { if (p?.id) { map[String(p.id)] = p.title; } });
    return map;
  }, [propertiesData]);

  const reviewsArray = useMemo(() => {
    if (!reviewsData) return [];
    return Array.isArray(reviewsData) ? reviewsData : ((reviewsData as any).results || []);
  }, [reviewsData]);

  const totalCount = (reviewsData as any)?.count || reviewsArray.length;

  const deleteMutation = useMutation({
    mutationFn: (id: number) => reviewService.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success("Review deleted successfully.");
      setDeleteModal({ isOpen: false, id: null, title: "" });
    },
    onError: () => toast.error("Failed to delete review.")
  });

  const processedReviews = useMemo(() => {
    let result = reviewsArray.map((review: any) => ({ ...review, property_title: propertyMap[String(review.property)] || `Property #${review.property}` }));

    if (ratingFilter !== 'all') result = result.filter((review: any) => String(review.rating) === ratingFilter);

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((review: any) => 
        (review.customer_name || '').toLowerCase().includes(lowerSearch) ||
        (review.title || '').toLowerCase().includes(lowerSearch) ||
        (review.comment || '').toLowerCase().includes(lowerSearch) ||
        (review.property_title || '').toLowerCase().includes(lowerSearch) ||
        String(review.customer).includes(lowerSearch)
      );
    }

    if (sortConfig !== null) {
      result.sort((a: any, b: any) => {
        let aValue = a[sortConfig.key]; let bValue = b[sortConfig.key];
        if (sortConfig.key === 'rating') { aValue = Number(aValue); bValue = Number(bValue); } 
        else { aValue = String(aValue || '').toLowerCase(); bValue = String(bValue || '').toLowerCase(); }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [reviewsArray, propertyMap, searchTerm, ratingFilter, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const renderSortIcon = (key: string) => {
    if (sortConfig?.key !== key) return <ArrowUpDown size={12} className="opacity-40" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={12} className="text-brand-green" /> : <ChevronDown size={12} className="text-brand-green" />;
  };

  return (
    <>
      <AdminPageContainer
        title="Reviews"
        subtitle="Manage customer feedback and property ratings."
        icon={<MessageSquare size={32} />}
        headerAction={
          <span className="hidden xs:inline-block text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white shadow-sm px-2.5 py-1 rounded-md border border-gray-100">
            {totalCount} Total
          </span>
        }
      >
        <TableToolbar 
          searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchPlaceholder="Search customer, review, or ID..."
          filterOptions={RATING_OPTIONS} activeFilter={ratingFilter} setActiveFilter={setRatingFilter}
          page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize} hasNextPage={!!(reviewsData as any)?.next}
        />

        {isLoading ? (
          <div className="py-16 text-center text-sm font-bold text-gray-400">Loading reviews...</div>
        ) : processedReviews.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center w-full">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-3 text-gray-300">
              <MessageSquare size={24} />
            </div>
            <p className="text-sm font-bold text-gray-400">No reviews found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-hide rounded-b-[2.5rem]">
            <table className="w-full text-left border-separate border-spacing-y-2 min-w-[600px] md:min-w-[850px] px-2 md:px-4">
              <thead>
                <tr>
                  <th className="py-2 px-4 w-1/3"><button onClick={() => handleSort('title')} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">Review {renderSortIcon('title')}</button></th>
                  <th className="py-2 px-4"><button onClick={() => handleSort('rating')} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">Rating {renderSortIcon('rating')}</button></th>
                  <th className="py-2 px-4"><button onClick={() => handleSort('customer_name')} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">Customer {renderSortIcon('customer_name')}</button></th>
                  <th className="hidden sm:table-cell py-2 px-4"><button onClick={() => handleSort('property_title')} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">Property {renderSortIcon('property_title')}</button></th>
                  <th className="hidden md:table-cell py-2 px-4"><button onClick={() => handleSort('createdAt')} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">Date {renderSortIcon('createdAt')}</button></th>
                  <th className="py-2 px-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-bold text-brand-dark">
                {processedReviews.map((review: any) => (
                  <tr key={review.id} className="bg-white hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-4 rounded-l-2xl">
                      <div className="font-black text-brand-dark text-sm line-clamp-1">{review.title}</div>
                      <div className="text-xs font-medium text-gray-500 mt-1 line-clamp-1">{review.comment}</div>
                    </td>
                    <td className="py-4 px-4"><div className="flex items-center gap-1.5 bg-amber-50 text-amber-500 w-fit px-2.5 py-1.5 rounded-lg border border-amber-100"><Star size={12} fill="currentColor" /><span className="text-[11px] font-black mt-0.5">{review.rating}.0</span></div></td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-brand-dark text-sm flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0"><User size={12} /></div>
                        <span className="truncate max-w-[120px]">
                          {review.customer_name || 'Unknown Customer'}
                          {review.customer && <span className="text-[11px] font-bold text-brand-green ml-1.5">• ID #{review.customer}</span>}
                        </span>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell py-4 px-4"><div className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5 truncate max-w-[150px]" title={review.property_title}><MapPin size={11} className="text-indigo-400 shrink-0" /> {review.property_title}</div></td>
                    <td className="hidden md:table-cell py-4 px-4 whitespace-nowrap"><div className="font-bold text-brand-dark text-sm">{review.createdAt ? review.createdAt.split('T')[0] : 'N/A'}</div></td>
                    <td className="py-4 px-4 text-right rounded-r-2xl">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewModal({ isOpen: true, review })} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-brand-dark hover:border-gray-300 shadow-sm transition-colors" title="Read Full Review"><Eye size={14} /></button>
                        <button onClick={() => setDeleteModal({ isOpen: true, id: review.id, title: review.title })} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all shadow-sm" title="Delete Review"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPageContainer>

      <Modal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, id: null, title: "" })} onConfirm={() => { if (deleteModal.id) deleteMutation.mutate(deleteModal.id); }} title="Delete Review" message={`Are you sure you want to delete the review "${deleteModal.title}"? This action cannot be undone.`} confirmText="Delete Permanently" variant="danger" loading={deleteMutation.isPending} />

      <FormModal isOpen={viewModal.isOpen} onClose={() => setViewModal({ isOpen: false, review: null })} title="Review Details">
        {viewModal.review && (
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-3"><h3 className="text-xl font-black text-brand-dark leading-tight">{viewModal.review.title}</h3><div className="flex items-center gap-1 text-amber-400 shrink-0 mt-1">{[...Array(5)].map((_, i) => (<Star key={i} size={16} fill={i < viewModal.review.rating ? "currentColor" : "none"} className={i >= viewModal.review.rating ? "text-gray-200" : ""} />))}</div></div>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500"><User size={10} /> {viewModal.review.customer_name || 'Guest'}</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500"><Calendar size={10} /> {viewModal.review.createdAt ? viewModal.review.createdAt.split('T')[0] : 'N/A'}</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-[10px] font-black uppercase tracking-widest text-indigo-500 max-w-full"><MapPin size={10} className="shrink-0" /> <span className="truncate">{viewModal.review.property_title}</span></span>
              </div>
            </div>
            <hr className="border-gray-50" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Guest Feedback</p>
              <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-100"><p className="text-sm font-medium text-brand-dark leading-relaxed whitespace-pre-wrap">"{viewModal.review.comment}"</p></div>
            </div>
            <div className="pt-2 flex justify-end">
              <button onClick={() => { setViewModal(prev => ({ ...prev, isOpen: false })); setTimeout(() => setDeleteModal({ isOpen: true, id: viewModal.review.id, title: viewModal.review.title }), 200); }} className="px-6 py-2.5 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 text-sm"><Trash2 size={16} /> Delete Review</button>
            </div>
          </div>
        )}
      </FormModal>
    </>
  );
};

export default AdminReviewsPage;
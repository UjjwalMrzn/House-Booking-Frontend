import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../../../api/reviewService'; 
import { useToast } from '../../ui/Toaster';
import { MessageSquare, Star, Trash2, Eye, ArrowUpDown, ChevronUp, ChevronDown, Filter, User, MapPin, Calendar, Check } from 'lucide-react';
import Modal from '../../ui/Modal';
import FormModal from '../../ui/FormModal';
import SearchInput from '../../ui/SearchInput';

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;

const AdminReviewsPage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  
  // Custom Dropdown State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Sorting State
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Modal States
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; title: string }>({ isOpen: false, id: null, title: "" });
  const [viewModal, setViewModal] = useState<{ isOpen: boolean, review: any | null }>({ isOpen: false, review: null });

  // Close custom filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch all reviews
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: reviewService.getAllReviews,
  });

  // Mutation to delete review
  const deleteMutation = useMutation({
    mutationFn: (id: number) => reviewService.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success("Review deleted successfully.");
      setDeleteModal({ isOpen: false, id: null, title: "" });
    },
    onError: () => toast.error("Failed to delete review.")
  });

  // Data Processing Pipeline: Filter -> Search -> Sort
  const processedReviews = useMemo(() => {
    let result = [...reviews];

    // 1. Filter by Rating
    if (ratingFilter !== 'all') {
      result = result.filter(review => String(review.rating) === ratingFilter);
    }

    // 2. Filter by Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((review: any) => 
        review.customer_name?.toLowerCase().includes(lowerSearch) ||
        review.title?.toLowerCase().includes(lowerSearch) ||
        review.comment?.toLowerCase().includes(lowerSearch)
      );
    }

    // 3. Sort
    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Numeric sorting for ratings and property IDs
        if (sortConfig.key === 'rating' || sortConfig.key === 'property') {
          aValue = Number(aValue);
          bValue = Number(bValue);
        } else {
          aValue = String(aValue || '').toLowerCase();
          bValue = String(bValue || '').toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [reviews, searchTerm, ratingFilter, sortConfig]);

  // Handle Sort Click
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Render Sort Icon
  const renderSortIcon = (key: string) => {
    if (sortConfig?.key !== key) return <ArrowUpDown size={12} className="opacity-40" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={12} className="text-brand-green" /> : <ChevronDown size={12} className="text-brand-green" />;
  };

  const RATING_OPTIONS = [
    { value: 'all', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full animate-fade-in">
      
      {/* Page Header & Search */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-dark tracking-tight flex items-center gap-3">
            <MessageSquare className="text-brand-green" size={32} />
            Reviews
          </h1>
          <p className="text-sm font-bold text-gray-400 mt-1">Manage customer feedback and property ratings.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          
          {/* CUSTOM Rating Filter Dropdown */}
          <div className="relative w-full sm:w-40" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`w-full pl-10 pr-4 py-2.5 flex items-center justify-between bg-white border rounded-xl text-sm font-bold outline-none transition-all ${
                isFilterOpen ? 'border-brand-green ring-2 ring-brand-green/10' : 'border-gray-200 hover:border-gray-300 shadow-sm'
              }`}
            >
              <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <span className="text-brand-dark">
                {RATING_OPTIONS.find(opt => opt.value === ratingFilter)?.label}
              </span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <div className="absolute z-50 top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] py-2 animate-fade-in">
                {RATING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setRatingFilter(opt.value);
                      setIsFilterOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold flex items-center justify-between transition-colors hover:bg-brand-green/5 hover:text-brand-green"
                  >
                    <span className={ratingFilter === opt.value ? 'text-brand-green' : 'text-gray-600'}>
                      {opt.label}
                    </span>
                    {ratingFilter === opt.value && <Check size={16} className="text-brand-green" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <SearchInput 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Search reviews..." 
            className="w-full sm:w-60" 
          />
        </div>
      </div>

      {/* Reviews Table Card */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-5 px-6 w-1/3">
                  <button onClick={() => handleSort('title')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">
                    Review {renderSortIcon('title')}
                  </button>
                </th>
                <th className="py-5 px-6">
                  <button onClick={() => handleSort('rating')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">
                    Rating {renderSortIcon('rating')}
                  </button>
                </th>
                <th className="py-5 px-6">
                  <button onClick={() => handleSort('customer_name')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">
                    Guest {renderSortIcon('customer_name')}
                  </button>
                </th>
                <th className="py-5 px-6">
                  <button onClick={() => handleSort('property')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">
                    Property {renderSortIcon('property')}
                  </button>
                </th>
                <th className="py-5 px-6">
                  <button onClick={() => handleSort('createdAt')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">
                    Date {renderSortIcon('createdAt')}
                  </button>
                </th>
                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm font-bold text-gray-400">
                    Loading reviews...
                  </td>
                </tr>
              ) : processedReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-3 text-gray-300">
                      <MessageSquare size={24} />
                    </div>
                    <p className="text-sm font-bold text-gray-400">No reviews found.</p>
                  </td>
                </tr>
              ) : (
                processedReviews.map((review: any) => (
                  <tr key={review.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors group">
                    
                    {/* REVIEW CONTENT */}
                    <td className="py-4 px-6">
                      <div className="font-black text-brand-dark text-sm line-clamp-1">{review.title}</div>
                      <div className="text-xs font-medium text-gray-500 mt-1 line-clamp-1">{review.comment}</div>
                    </td>

                    {/* RATING BADGE */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 bg-amber-50 text-amber-500 w-fit px-2.5 py-1.5 rounded-lg border border-amber-100">
                        <Star size={12} fill="currentColor" />
                        <span className="text-[11px] font-black mt-0.5">{review.rating}.0</span>
                      </div>
                    </td>

                    {/* GUEST INFO */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-brand-dark text-sm flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0">
                          <User size={12} />
                        </div>
                        <span className="truncate max-w-[120px]">{review.customer_name || 'Guest User'}</span>
                      </div>
                    </td>

                    {/* PROPERTY INFO */}
                    <td className="py-4 px-6">
                      <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                        <MapPin size={11} className="text-indigo-400" /> Property #{review.property}
                      </div>
                    </td>

                    {/* DATE */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="font-bold text-brand-dark text-sm">
                        {review.createdAt ? review.createdAt.split('T')[0] : 'N/A'}
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setViewModal({ isOpen: true, review })}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-brand-dark hover:border-gray-300 shadow-sm transition-colors"
                          title="Read Full Review"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          onClick={() => setDeleteModal({ isOpen: true, id: review.id, title: review.title })}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all shadow-sm"
                          title="Delete Review"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <Modal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, title: "" })}
        onConfirm={() => { if (deleteModal.id) deleteMutation.mutate(deleteModal.id); }}
        title="Delete Review"
        message={`Are you sure you want to delete the review "${deleteModal.title}"? This action cannot be undone.`}
        confirmText="Delete Permanently"
        variant="danger"
        loading={deleteMutation.isPending}
      />

      {/* --- VIEW FULL REVIEW MODAL --- */}
      <FormModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, review: null })}
        title="Review Details"
      >
        {viewModal.review && (
          <div className="space-y-6">
            
            {/* Header: Title & Stars */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-xl font-black text-brand-dark leading-tight">{viewModal.review.title}</h3>
                <div className="flex items-center gap-1 text-amber-400 shrink-0 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < viewModal.review.rating ? "currentColor" : "none"} className={i >= viewModal.review.rating ? "text-gray-200" : ""} />
                  ))}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <User size={10} /> {viewModal.review.customer_name || 'Guest'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <Calendar size={10} /> {viewModal.review.createdAt ? viewModal.review.createdAt.split('T')[0] : 'N/A'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-[10px] font-black uppercase tracking-widest text-indigo-500">
                  <MapPin size={10} /> Property #{viewModal.review.property}
                </span>
              </div>
            </div>

            <hr className="border-gray-50" />

            {/* The Actual Comment */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Guest Feedback</p>
              <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-100">
                <p className="text-sm font-medium text-brand-dark leading-relaxed whitespace-pre-wrap">
                  "{viewModal.review.comment}"
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => {
                  setViewModal(prev => ({ ...prev, isOpen: false }));
                  setTimeout(() => setDeleteModal({ isOpen: true, id: viewModal.review.id, title: viewModal.review.title }), 200);
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 text-sm"
              >
                <Trash2 size={16} /> Delete Review
              </button>
            </div>
          </div>
        )}
      </FormModal>

    </div>
  );
};

export default AdminReviewsPage;
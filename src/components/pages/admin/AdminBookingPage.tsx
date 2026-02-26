import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService } from '../../../api/propertyService'; 
import { useToast } from '../../ui/Toaster';
import { Search, CalendarCheck, CheckCircle, XCircle, Eye, Clock, ArrowUpDown, ChevronUp, ChevronDown, Filter, User, MapPin, Calendar, DollarSign } from 'lucide-react';
import Modal from '../../ui/Modal';
import FormModal from '../../ui/FormModal';

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;

const AdminBookingsPage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Modal States
  const [actionModal, setActionModal] = useState<{ isOpen: boolean, type: 'confirm' | 'cancel', bookingId: number | null }>({ isOpen: false, type: 'confirm', bookingId: null });
  const [viewModal, setViewModal] = useState<{ isOpen: boolean, booking: any | null }>({ isOpen: false, booking: null });

  // Fetch all bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: propertyService.getAllBookings,
  });

  // Mutation to update status (Approve / Reject) - CLEANED OF HACKS
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => propertyService.updateBookingStatus(id, status as any),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success(`Booking marked as ${variables.status}.`);
      setActionModal({ isOpen: false, type: 'confirm', bookingId: null });
      if (viewModal.isOpen && viewModal.booking?.id === variables.id) {
        setViewModal(prev => ({ ...prev, booking: { ...prev.booking, status: variables.status } }));
      }
    },
    onError: () => toast.error("Failed to update booking status.")
  });

  // Data Processing Pipeline: Filter -> Search -> Sort
  const processedBookings = useMemo(() => {
    let result = [...bookings];

    // 1. Filter by Status
    if (statusFilter !== 'all') {
      result = result.filter(booking => booking.status?.toLowerCase() === statusFilter);
    }

    // 2. Filter by Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((booking: any) => 
        booking.customer_name?.toLowerCase().includes(lowerSearch) ||
        booking.property_title?.toLowerCase().includes(lowerSearch) ||
        String(booking.id).includes(lowerSearch)
      );
    }

    // 3. Sort
    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle numeric sorting for price
        if (sortConfig.key === 'total_price') {
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
  }, [bookings, searchTerm, statusFilter, sortConfig]);

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

  // Render beautiful status badges
  const renderStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-green/10 text-brand-green text-[11px] font-black uppercase tracking-widest">
            <CheckCircle size={12} strokeWidth={3} /> Confirmed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/10 text-red-500 text-[11px] font-black uppercase tracking-widest">
            <XCircle size={12} strokeWidth={3} /> Cancelled
          </span>
        );
      default: // pending
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-[11px] font-black uppercase tracking-widest">
            <Clock size={12} strokeWidth={3} /> Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full animate-fade-in">
      
      {/* Page Header & Search */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-dark tracking-tight flex items-center gap-3">
            <CalendarCheck className="text-brand-green" size={32} />
            Bookings
          </h1>
          <p className="text-sm font-bold text-gray-400 mt-1">Manage all customer reservations and statuses.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Status Filter Dropdown */}
          <div className="relative w-full sm:w-48">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-brand-dark outline-none focus:border-brand-green shadow-sm transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search guest or property..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-brand-dark outline-none focus:border-brand-green shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* Bookings Table Card */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-5 px-6">
                  <button onClick={() => handleSort('customer_name')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">
                    Guest {renderSortIcon('customer_name')}
                  </button>
                </th>
                <th className="py-5 px-6">
                  <button onClick={() => handleSort('property_title')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">
                    Property {renderSortIcon('property_title')}
                  </button>
                </th>
                <th className="py-5 px-6">
                  <button onClick={() => handleSort('check_in')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">
                    Dates {renderSortIcon('check_in')}
                  </button>
                </th>
                <th className="py-5 px-6">
                  <button onClick={() => handleSort('total_price')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">
                    Amount {renderSortIcon('total_price')}
                  </button>
                </th>
                <th className="py-5 px-6">
                  <button onClick={() => handleSort('status')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">
                    Status {renderSortIcon('status')}
                  </button>
                </th>
                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm font-bold text-gray-400">
                    Loading bookings...
                  </td>
                </tr>
              ) : processedBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-3 text-gray-300">
                      <CalendarCheck size={24} />
                    </div>
                    <p className="text-sm font-bold text-gray-400">No bookings found.</p>
                  </td>
                </tr>
              ) : (
                processedBookings.map((booking: any) => (
                  <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors group">
                    
                    {/* GUEST INFO */}
                    <td className="py-4 px-6">
                      <div className="font-black text-brand-dark text-sm">{booking.customer_name || 'Guest User'}</div>
                      <div className="text-[11px] font-bold text-gray-400 mt-0.5">ID: {booking.customer}</div>
                    </td>

                    {/* PROPERTY INFO */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-brand-dark text-sm line-clamp-1">{booking.property_title || `Property #${booking.property}`}</div>
                      <div className="text-[11px] font-bold text-gray-400 mt-0.5">Booking ID: {booking.id}</div>
                    </td>

                    {/* DATES */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="font-bold text-brand-dark text-sm">{booking.check_in}</div>
                      <div className="text-[11px] font-bold text-gray-400 mt-0.5">to {booking.check_out}</div>
                    </td>

                    {/* AMOUNT */}
                    <td className="py-4 px-6">
                      <div className="font-black text-brand-green text-sm">${Number(booking.total_price).toLocaleString()}</div>
                    </td>

                    {/* STATUS */}
                    <td className="py-4 px-6">
                      {renderStatusBadge(booking.status)}
                    </td>

                    {/* ACTIONS */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* Only show Approve/Reject if it's Pending */}
                        {booking.status?.toLowerCase() === 'pending' && (
                          <>
                            <button 
                              onClick={() => setActionModal({ isOpen: true, type: 'confirm', bookingId: booking.id })}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white transition-colors"
                              title="Confirm Booking"
                            >
                              <CheckCircle size={14} />
                            </button>
                            
                            <button 
                              onClick={() => setActionModal({ isOpen: true, type: 'cancel', bookingId: booking.id })}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                              title="Cancel Booking"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}

                        <button 
                          onClick={() => setViewModal({ isOpen: true, booking })}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-brand-dark hover:border-gray-300 shadow-sm transition-colors"
                          title="View Full Details"
                        >
                          <Eye size={14} />
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

      {/* --- CONFIRM/CANCEL ACTION MODAL --- */}
      <Modal 
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, type: 'confirm', bookingId: null })}
        onConfirm={() => {
          if (actionModal.bookingId) {
            statusMutation.mutate({ 
              id: actionModal.bookingId, 
              status: actionModal.type === 'confirm' ? 'confirmed' : 'cancelled' 
            });
          }
        }}
        title={actionModal.type === 'confirm' ? "Confirm Booking" : "Cancel Booking"}
        message={actionModal.type === 'confirm' 
          ? "Are you sure you want to confirm this booking? The guest will be notified." 
          : "Are you sure you want to cancel this booking? This action cannot be easily undone."}
        confirmText={actionModal.type === 'confirm' ? "Yes, Confirm" : "Yes, Cancel"}
        variant={actionModal.type === 'confirm' ? "primary" : "danger"}
        loading={statusMutation.isPending}
      />

      {/* --- VIEW BOOKING DETAILS MODAL --- */}
      <FormModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, booking: null })}
        title="Booking Details"
      >
        {viewModal.booking && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Booking ID</p>
                <p className="text-lg font-black text-brand-dark">#{viewModal.booking.id}</p>
              </div>
              <div>{renderStatusBadge(viewModal.booking.status)}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <User size={16} className="text-gray-400 mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Guest Name</p>
                <p className="text-sm font-bold text-brand-dark truncate">{viewModal.booking.customer_name || `User ID: ${viewModal.booking.customer}`}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <MapPin size={16} className="text-gray-400 mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Property</p>
                <p className="text-sm font-bold text-brand-dark truncate" title={viewModal.booking.property_title}>{viewModal.booking.property_title || `Prop ID: ${viewModal.booking.property}`}</p>
              </div>
            </div>

            <div className="p-4 bg-brand-green/5 rounded-xl border border-brand-green/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-brand-green" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-green">Check-in</p>
                  <p className="text-sm font-black text-brand-dark">{viewModal.booking.check_in}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-brand-green/20"></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-green text-right">Check-out</p>
                <p className="text-sm font-black text-brand-dark text-right">{viewModal.booking.check_out}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2 text-gray-400">
                <DollarSign size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Total Amount</span>
              </div>
              <span className="text-2xl font-black text-brand-green">${Number(viewModal.booking.total_price).toLocaleString()}</span>
            </div>

            {/* Quick Actions inside View Mode */}
            {viewModal.booking.status?.toLowerCase() === 'pending' && (
              <div className="pt-2 flex gap-3">
                <button 
                  onClick={() => {
                    setViewModal(prev => ({ ...prev, isOpen: false }));
                    setTimeout(() => setActionModal({ isOpen: true, type: 'cancel', bookingId: viewModal.booking.id }), 200);
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-500 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                >
                  Reject
                </button>
                <button 
                  onClick={() => {
                    setViewModal(prev => ({ ...prev, isOpen: false }));
                    setTimeout(() => setActionModal({ isOpen: true, type: 'confirm', bookingId: viewModal.booking.id }), 200);
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-brand-green hover:bg-emerald-600 shadow-sm transition-colors"
                >
                  Approve Booking
                </button>
              </div>
            )}
          </div>
        )}
      </FormModal>

    </div>
  );
};

export default AdminBookingsPage;
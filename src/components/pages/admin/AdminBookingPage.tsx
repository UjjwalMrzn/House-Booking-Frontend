import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService } from '../../../api/propertyService'; 
import { bookingService } from '../../../api/bookingApi';
import { useToast } from '../../ui/Toaster';
import { CalendarCheck, CheckCircle, XCircle, Eye, Clock, ArrowUpDown, ChevronUp, ChevronDown, User, Users, MapPin, Calendar, DollarSign } from 'lucide-react';
import Modal from '../../ui/Modal';
import FormModal from '../../ui/FormModal';
import TableToolbar from '../../ui/TableToolbar';

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const AdminBookingsPage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");

  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'status', direction: 'asc' });
  const [actionModal, setActionModal] = useState<{ isOpen: boolean, type: 'confirm' | 'cancel', bookingId: number | null }>({ isOpen: false, type: 'confirm', bookingId: null });
  const [viewModal, setViewModal] = useState<{ isOpen: boolean, booking: any | null }>({ isOpen: false, booking: null });

  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ['admin-bookings', page, Number(pageSize)],
    queryFn: () => bookingService.getAllBookings(page, Number(pageSize)),
  });

  const bookings = useMemo(() => {
    if (!paginatedData) return [];
    return Array.isArray(paginatedData) ? paginatedData : (paginatedData.results || []);
  }, [paginatedData]);

  const totalCount = paginatedData?.count || bookings.length;

  const { data: customerData, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['customer', viewModal.booking?.customer],
    queryFn: () => propertyService.getCustomerById(viewModal.booking!.customer),
    enabled: !!viewModal.isOpen && !!viewModal.booking?.customer,
  });

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

  const processedBookings = useMemo(() => {
    let result = [...bookings];
    if (statusFilter !== 'all') result = result.filter(b => b.status?.toLowerCase() === statusFilter);
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((b: any) => b.customer_name?.toLowerCase().includes(lowerSearch) || b.property_title?.toLowerCase().includes(lowerSearch) || String(b.id).includes(lowerSearch));
    }
    if (sortConfig !== null) {
      result.sort((a, b) => {
        if (sortConfig.key === 'status') {
          const priority: Record<string, number> = { 'pending': 1, 'confirmed': 2, 'cancelled': 3 };
          return sortConfig.direction === 'asc' ? (priority[a.status?.toLowerCase() || ''] || 99) - (priority[b.status?.toLowerCase() || ''] || 99) : (priority[b.status?.toLowerCase() || ''] || 99) - (priority[a.status?.toLowerCase() || ''] || 99);
        }
        let aValue = a[sortConfig.key]; let bValue = b[sortConfig.key];
        if (sortConfig.key === 'total_price' || sortConfig.key === 'guests') { aValue = Number(aValue); bValue = Number(bValue); } 
        else { aValue = String(aValue || '').toLowerCase(); bValue = String(bValue || '').toLowerCase(); }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [bookings, searchTerm, statusFilter, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const renderSortIcon = (key: string) => {
    if (sortConfig?.key !== key) return <ArrowUpDown size={12} className="opacity-40" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={12} className="text-brand-green" /> : <ChevronDown size={12} className="text-brand-green" />;
  };

  const renderStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-green/10 text-brand-green text-[11px] font-black uppercase tracking-widest"><CheckCircle size={12} strokeWidth={3} /> Confirmed</span>;
      case 'cancelled': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/10 text-red-500 text-[11px] font-black uppercase tracking-widest"><XCircle size={12} strokeWidth={3} /> Cancelled</span>;
      default: return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-[11px] font-black uppercase tracking-widest"><Clock size={12} strokeWidth={3} /> Pending</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full animate-fade-in pb-10">
      
      <div className="mb-8">
        <h1 className="text-3xl font-black text-brand-dark tracking-tight flex items-center gap-3">
          <CalendarCheck className="text-brand-green" size={32} />
          Bookings
          <span className="ml-2 mt-1 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white shadow-sm px-2.5 py-1 rounded-md border border-gray-100">
            {totalCount} Total
          </span>
        </h1>
        <p className="text-sm font-bold text-gray-400 mt-1">Manage all customer reservations and statuses.</p>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
        
        <TableToolbar 
          searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchPlaceholder="Search guest or property..."
          filterOptions={STATUS_OPTIONS} activeFilter={statusFilter} setActiveFilter={setStatusFilter}
          page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize} hasNextPage={!!paginatedData?.next}
        />

        <div className="overflow-x-auto custom-scrollbar rounded-b-[2rem]">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-5 px-6"><button onClick={() => handleSort('customer_name')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">Guest {renderSortIcon('customer_name')}</button></th>
                <th className="py-5 px-6"><button onClick={() => handleSort('property_title')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">Property {renderSortIcon('property_title')}</button></th>
                <th className="py-5 px-6"><button onClick={() => handleSort('guests')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">Guests {renderSortIcon('guests')}</button></th>
                <th className="py-5 px-6"><button onClick={() => handleSort('check_in')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">Dates {renderSortIcon('check_in')}</button></th>
                <th className="py-5 px-6"><button onClick={() => handleSort('total_price')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">Amount {renderSortIcon('total_price')}</button></th>
                <th className="py-5 px-6"><button onClick={() => handleSort('status')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">Status {renderSortIcon('status')}</button></th>
                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="py-12 text-center text-sm font-bold text-gray-400">Loading bookings...</td></tr>
              ) : processedBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-3 text-gray-300"><CalendarCheck size={24} /></div>
                    <p className="text-sm font-bold text-gray-400">No bookings found.</p>
                  </td>
                </tr>
              ) : (
                processedBookings.map((booking: any) => (
                  <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="font-black text-brand-dark text-sm">{booking.customer_name || 'Guest User'}</div>
                      <div className="text-[11px] font-bold text-gray-400 mt-0.5">ID: {booking.customer}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-brand-dark text-sm line-clamp-1">{booking.property_title || `Property #${booking.property}`}</div>
                      <div className="text-[11px] font-bold text-gray-400 mt-0.5">Booking ID: {booking.id}</div>
                    </td>
                    <td className="py-4 px-6"><div className="font-bold text-brand-dark text-sm flex items-center gap-1.5"><Users size={14} className="text-gray-400" /> {booking.guests}</div></td>
                    <td className="py-4 px-6 whitespace-nowrap"><div className="font-bold text-brand-dark text-sm">{booking.check_in}</div><div className="text-[11px] font-bold text-gray-400 mt-0.5">to {booking.check_out}</div></td>
                    <td className="py-4 px-6"><div className="font-black text-brand-green text-sm">${Number(booking.total_price).toLocaleString()}</div></td>
                    <td className="py-4 px-6">{renderStatusBadge(booking.status)}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {booking.status?.toLowerCase() === 'pending' && (
                          <>
                            <button onClick={() => setActionModal({ isOpen: true, type: 'confirm', bookingId: booking.id })} className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white transition-colors" title="Confirm Booking"><CheckCircle size={14} /></button>
                            <button onClick={() => setActionModal({ isOpen: true, type: 'cancel', bookingId: booking.id })} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-50 hover:text-white transition-colors" title="Cancel Booking"><XCircle size={14} /></button>
                          </>
                        )}
                        <button onClick={() => setViewModal({ isOpen: true, booking })} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-brand-dark hover:border-gray-300 shadow-sm transition-colors" title="View Full Details"><Eye size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={actionModal.isOpen} onClose={() => setActionModal({ isOpen: false, type: 'confirm', bookingId: null })}
        onConfirm={() => { if (actionModal.bookingId) statusMutation.mutate({ id: actionModal.bookingId, status: actionModal.type === 'confirm' ? 'confirmed' : 'cancelled' }); }}
        title={actionModal.type === 'confirm' ? "Confirm Booking" : "Cancel Booking"}
        message={actionModal.type === 'confirm' ? "Are you sure you want to confirm this booking?" : "Are you sure you want to cancel this booking?"}
        confirmText={actionModal.type === 'confirm' ? "Yes, Confirm" : "Yes, Cancel"} variant={actionModal.type === 'confirm' ? "primary" : "danger"} loading={statusMutation.isPending}
      />

      <FormModal isOpen={viewModal.isOpen} onClose={() => setViewModal({ isOpen: false, booking: null })} title="Booking Details" maxWidth="max-w-2xl">
        {/* Strictly leaving your View Modal content identical! */}
        {viewModal.booking && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Booking ID</p><p className="text-lg font-black text-brand-dark">#{viewModal.booking.id}</p></div>
              <div>{renderStatusBadge(viewModal.booking.status)}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100"><User size={16} className="text-gray-400 mb-2" /><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Booking Name</p><p className="text-sm font-bold text-brand-dark truncate">{viewModal.booking.customer_name || `User ID: ${viewModal.booking.customer}`}</p></div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100"><MapPin size={16} className="text-gray-400 mb-2" /><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Property</p><p className="text-sm font-bold text-brand-dark truncate" title={viewModal.booking.property_title}>{viewModal.booking.property_title || `Prop ID: ${viewModal.booking.property}`}</p></div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100"><Users size={16} className="text-gray-400 mb-2" /><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Guests</p><p className="text-sm font-bold text-brand-dark truncate">{viewModal.booking.guests} {viewModal.booking.guests === 1 ? 'Person' : 'People'}</p></div>
            </div>
            <div className="p-4 bg-brand-green/5 rounded-xl border border-brand-green/10 flex items-center justify-between">
              <div className="flex items-center gap-3"><Calendar size={20} className="text-brand-green" /><div><p className="text-[10px] font-black uppercase tracking-widest text-brand-green">Check-in</p><p className="text-sm font-black text-brand-dark">{viewModal.booking.check_in}</p></div></div>
              <div className="w-px h-8 bg-brand-green/20"></div>
              <div><p className="text-[10px] font-black uppercase tracking-widest text-brand-green text-right">Check-out</p><p className="text-sm font-black text-brand-dark text-right">{viewModal.booking.check_out}</p></div>
            </div>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100"><p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Guest Contact Information</p></div>
              <div className="p-4 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Full Name</p><p className="text-sm font-medium text-brand-dark truncate">{isLoadingCustomer ? 'Loading...' : (customerData ? `${customerData.firstName || ''} ${customerData.lastName || ''}`.trim() : 'Not provided')}</p></div>
                <div><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Email Address</p><p className="text-sm font-medium text-brand-dark truncate">{isLoadingCustomer ? 'Loading...' : (customerData?.email || 'Not provided')}</p></div>
                <div><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Phone Number</p><p className="text-sm font-medium text-brand-dark truncate">{isLoadingCustomer ? 'Loading...' : (customerData?.phoneNumber || 'Not provided')}</p></div>
                <div><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Country</p><p className="text-sm font-medium text-brand-dark truncate">{isLoadingCustomer ? 'Loading...' : (customerData?.country || 'Not provided')}</p></div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2 text-gray-400"><DollarSign size={16} /><span className="text-xs font-bold uppercase tracking-widest">Total Amount</span></div>
              <span className="text-2xl font-black text-brand-green">${Number(viewModal.booking.total_price).toLocaleString()}</span>
            </div>
            {viewModal.booking.status?.toLowerCase() === 'pending' && (
              <div className="pt-2 flex gap-3">
                <button onClick={() => { setViewModal(prev => ({ ...prev, isOpen: false })); setTimeout(() => setActionModal({ isOpen: true, type: 'cancel', bookingId: viewModal.booking.id }), 200); }} className="flex-1 py-3 rounded-xl font-bold text-gray-500 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">Reject</button>
                <button onClick={() => { setViewModal(prev => ({ ...prev, isOpen: false })); setTimeout(() => setActionModal({ isOpen: true, type: 'confirm', bookingId: viewModal.booking.id }), 200); }} className="flex-1 py-3 rounded-xl font-bold text-white bg-brand-green hover:bg-emerald-600 shadow-sm transition-colors">Approve Booking</button>
              </div>
            )}
          </div>
        )}
      </FormModal>
    </div>
  );
};

export default AdminBookingsPage;
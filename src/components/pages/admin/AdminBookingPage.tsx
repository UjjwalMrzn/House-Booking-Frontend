import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService } from '../../../api/propertyService'; 
import { useToast } from '../../ui/Toaster';
import { Search, CalendarCheck, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';

const AdminBookingsPage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: propertyService.getAllBookings,
  });

  // Mutation to update status (Approve / Reject)
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => 
      propertyService.updateBookingStatus(id, status as any),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success(`Booking marked as ${variables.status}.`);
    },
    onError: () => toast.error("Failed to update booking status.")
  });

  // Filter bookings based on search
  const filteredBookings = bookings.filter((booking: any) => 
    booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.property_title?.toLowerCase().includes(searchTerm.toLowerCase()) 
  );

  // Helper to render beautiful status badges
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
        
        <div className="relative w-full md:w-72">
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

      {/* Bookings Table Card */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Guest</th>
                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Property</th>
                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Dates</th>
                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</th>
                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
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
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-3 text-gray-300">
                      <CalendarCheck size={24} />
                    </div>
                    <p className="text-sm font-bold text-gray-400">No bookings found.</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking: any) => (
                  <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors group">
                    
                    {/* GUEST INFO */}
                    <td className="py-4 px-6">
                      <div className="font-black text-brand-dark text-sm">{booking.customer_name || 'Guest User'}</div>
                      <div className="text-[11px] font-bold text-gray-400 mt-0.5">ID: {booking.customer}</div>
                    </td>

                    {/* PROPERTY INFO */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-brand-dark text-sm">{booking.property_title || `Property #${booking.property}`}</div>
                      <div className="text-[11px] font-bold text-gray-400 mt-0.5">Booking ID: {booking.id}</div>
                    </td>

                    {/* DATES */}
                    <td className="py-4 px-6">
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
                      {/* FIXED: Removed opacity-0 and group-hover classes so buttons are always visible */}
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* Only show Approve/Reject if it's Pending */}
                        {booking.status?.toLowerCase() === 'pending' && (
                          <>
                            <button 
                              onClick={() => statusMutation.mutate({ id: booking.id, status: 'confirmed' })}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white transition-colors"
                              title="Confirm Booking"
                            >
                              <CheckCircle size={14} />
                            </button>
                            
                            <button 
                              onClick={() => {
                                if(window.confirm('Are you sure you want to cancel this booking?')) {
                                  statusMutation.mutate({ id: booking.id, status: 'cancelled' });
                                }
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                              title="Cancel Booking"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}

                        <button 
                          onClick={() => toast.info('View details modal coming soon!')}
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
    </div>
  );
};

export default AdminBookingsPage;
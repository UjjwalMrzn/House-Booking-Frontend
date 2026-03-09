import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '../../../api/paymentService';
import { bookingService } from '../../../api/bookingApi'; 
import { propertyService } from '../../../api/propertyService'; 
import { CreditCard, Eye, ArrowUpDown, ChevronUp, ChevronDown, User, Users, MapPin, Calendar, DollarSign, Hash, Mail, Phone, Activity } from 'lucide-react';
import FormModal from '../../ui/FormModal';
import TableToolbar from '../../ui/TableToolbar';

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;

const AdminPaymentPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");

  const [viewModal, setViewModal] = useState<{ isOpen: boolean, payment: any | null }>({ isOpen: false, payment: null });

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['admin-payments', page, Number(pageSize)],
    queryFn: () => paymentService.getAllPayments(page, Number(pageSize)),
  });

  const { data: bookingDetails, isLoading: isBookingLoading } = useQuery({
    queryKey: ['admin-booking-details', viewModal.payment?.booking],
    queryFn: () => bookingService.getBookingById(viewModal.payment.booking),
    enabled: !!viewModal.payment?.booking,
  });

  const { data: customerData, isLoading: isCustomerLoading } = useQuery({
    queryKey: ['admin-customer-details', bookingDetails?.customer],
    queryFn: () => propertyService.getCustomerById(bookingDetails.customer),
    enabled: !!bookingDetails?.customer,
  });

  const payments = useMemo(() => {
    if (!paymentsData) return [];
    return Array.isArray(paymentsData) ? paymentsData : (paymentsData.results || []);
  }, [paymentsData]);

  const totalCount = paymentsData?.count || payments.length;

  const processedPayments = useMemo(() => {
    let result = [...payments];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((payment: any) => 
        (payment.name || '').toLowerCase().includes(lowerSearch) ||
        (payment.email || '').toLowerCase().includes(lowerSearch) ||
        (payment.paypalOrderId || '').toLowerCase().includes(lowerSearch) ||
        (payment.property_title || '').toLowerCase().includes(lowerSearch) ||
        (payment.status || '').toLowerCase().includes(lowerSearch) ||
        String(payment.booking || '').includes(lowerSearch) 
      );
    }
    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (sortConfig.key === 'amount' || sortConfig.key === 'booking') { 
          aValue = Number(aValue); bValue = Number(bValue); 
        } else { 
          aValue = String(aValue || '').toLowerCase(); bValue = String(bValue || '').toLowerCase(); 
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [payments, searchTerm, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const renderSortIcon = (key: string) => {
    if (sortConfig?.key !== key) return <ArrowUpDown size={12} className="opacity-40" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={12} className="text-brand-green" /> : <ChevronDown size={12} className="text-brand-green" />;
  };

  const getStatusStyle = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'success') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (s === 'failed') return 'bg-red-50 text-red-500 border-red-100';
    if (s === 'pending') return 'bg-amber-50 text-amber-500 border-amber-100';
    return 'bg-gray-50 text-gray-500 border-gray-200';
  };

  return (
    <div className="max-w-7xl mx-auto w-full animate-fade-in pb-10 px-2 md:px-0">
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-dark tracking-tight mb-1 flex items-center gap-3">
            <CreditCard className="text-brand-green" size={32} />
            Payments
            <span className="hidden xs:inline-block ml-2 mt-1 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white shadow-sm px-2.5 py-1 rounded-md border border-gray-100">
              {totalCount} Total
            </span>
          </h1>
          <p className="text-sm font-bold text-gray-400 mt-1">Track PayPal transactions and revenue.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
        <TableToolbar 
          searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchPlaceholder="Search Order ID, Booking ID..."
          page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize} hasNextPage={!!paymentsData?.next}
        />

        {/* SURGICAL FIX: Restored use of isLoading to resolve TS Error 6133 */}
        {isLoading ? (
          <div className="py-16 text-center text-sm font-bold text-gray-400">Loading payments...</div>
        ) : processedPayments.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center w-full">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-3 text-gray-300">
              <CreditCard size={24} />
            </div>
            <p className="text-sm font-bold text-gray-400">No payment records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-hide rounded-b-[2rem]">
            <table className="w-full text-left border-separate border-spacing-y-2 min-w-full lg:min-w-[950px] px-2 md:px-4">
              <thead>
                <tr>
                  <th className="hidden md:table-cell py-2 px-4"><button onClick={() => handleSort('paypalOrderId')} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400">Order ID {renderSortIcon('paypalOrderId')}</button></th>
                  <th className="py-2 px-4"><button onClick={() => handleSort('booking')} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400">Booking ID {renderSortIcon('booking')}</button></th>
                  <th className="py-2 px-4"><button onClick={() => handleSort('name')} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400">Guest {renderSortIcon('name')}</button></th>
                  <th className="py-2 px-4"><button onClick={() => handleSort('property_title')} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400">Property {renderSortIcon('property_title')}</button></th>
                  <th className="hidden sm:table-cell py-2 px-4"><button onClick={() => handleSort('createdAt')} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400">Date {renderSortIcon('createdAt')}</button></th>
                  <th className="py-2 px-4"><button onClick={() => handleSort('status')} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400">Status {renderSortIcon('status')}</button></th>
                  <th className="py-2 px-4"><button onClick={() => handleSort('amount')} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400">Amount {renderSortIcon('amount')}</button></th>
                  <th className="py-2 px-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-bold text-brand-dark">
                {processedPayments.map((payment: any) => (
                  <tr key={payment.id} className="bg-white hover:bg-gray-50/50 transition-colors group">
                    <td className="hidden md:table-cell py-4 px-4 rounded-l-2xl"><div className="font-mono text-[10px] md:text-xs font-bold text-brand-dark bg-gray-100 px-2 py-1 rounded-md w-fit truncate max-w-[120px]">{payment.paypalOrderId}</div></td>
                    <td className="py-4 px-4 whitespace-nowrap md:rounded-none rounded-l-2xl"><div className="font-mono text-[10px] md:text-xs font-bold text-brand-dark bg-gray-100 px-2 py-1 rounded-md w-fit">#{payment.booking}</div></td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-black text-brand-dark text-sm truncate max-w-[120px] md:max-w-[150px]">{payment.name || 'Guest'}</div>
                      <div className="text-[10px] md:text-[11px] font-medium text-gray-500 truncate max-w-[120px] md:max-w-[150px] mt-0.5">{payment.email}</div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap"><div className="font-bold text-brand-dark text-sm truncate max-w-[120px] md:max-w-[150px]">{payment.property_title || `Prop ID: ${payment.property}`}</div></td>
                    <td className="hidden sm:table-cell py-4 px-4 whitespace-nowrap"><div className="font-bold text-brand-dark text-sm">{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</div></td>
                    <td className="py-4 px-4"><span className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1 ${getStatusStyle(payment.status)}`}>{payment.status || 'Unknown'}</span></td>
                    <td className="py-4 px-4 whitespace-nowrap"><div className="font-black text-brand-green text-sm flex items-center gap-1"><DollarSign size={14} className="opacity-50" />{Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></td>
                    <td className="py-4 px-4 text-right rounded-r-2xl"><div className="flex items-center justify-end gap-2"><button onClick={() => setViewModal({ isOpen: true, payment })} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-brand-dark hover:border-gray-300 shadow-sm transition-colors" title="View Full Details"><Eye size={14} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FormModal isOpen={viewModal.isOpen} onClose={() => setViewModal({ isOpen: false, payment: null })} title="Transaction Details" maxWidth="max-w-2xl">
        <div className="max-h-[80vh] overflow-y-auto pr-2 scrollbar-hide">
          {viewModal.payment && (
            <div className="space-y-6">
              {/* SURGICAL FIX: Header stacked for mobile and added break-all */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">PAYPAL ORDER ID</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <p className="text-lg md:text-2xl font-black text-brand-dark break-all">{viewModal.payment.paypalOrderId}</p>
                    <span className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 shrink-0 ${getStatusStyle(viewModal.payment.status)}`}><Activity size={12} /> {viewModal.payment.status || 'Unknown'}</span>
                  </div>
                </div>
                <div className="sm:text-right shrink-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Paid</p>
                  <p className="text-2xl md:text-3xl font-black text-brand-green">${Number(viewModal.payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-2 text-gray-400"><User size={14} /><p className="text-[10px] font-black uppercase tracking-widest">Guest Name</p></div>
                  <p className="text-sm font-bold text-brand-dark truncate">{viewModal.payment.name || customerData?.firstName || (isCustomerLoading ? 'Loading...' : 'N/A')}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-2 text-gray-400"><MapPin size={14} /><p className="text-[10px] font-black uppercase tracking-widest">Property</p></div>
                  <p className="text-sm font-bold text-brand-dark truncate">{viewModal.payment.property_title || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-2 text-gray-400"><Hash size={14} /><p className="text-[10px] font-black uppercase tracking-widest">Linked Booking</p></div>
                  <p className="text-sm font-bold text-brand-dark">ID: {viewModal.payment.booking}</p>
                </div>
              </div>

              {/* SURGICAL FIX: Green bar stacked for mobile and restored icons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center border border-brand-green/20 bg-brand-green/5 rounded-xl gap-6 p-4">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 mb-1 text-brand-green"><Calendar size={14} /><p className="text-[10px] font-black uppercase tracking-widest">Check-In</p></div>
                  <p className="text-sm font-bold text-brand-dark sm:ml-6">{bookingDetails?.check_in ? bookingDetails.check_in : (isBookingLoading ? 'Fetching...' : 'N/A')}</p>
                </div>
                <div className="hidden sm:block w-px h-8 bg-brand-green/20"></div>
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 mb-1 text-brand-green"><Calendar size={14} /><p className="text-[10px] font-black uppercase tracking-widest">Check-Out</p></div>
                  <p className="text-sm font-bold text-brand-dark sm:ml-6">{bookingDetails?.check_out ? bookingDetails.check_out : (isBookingLoading ? 'Fetching...' : 'N/A')}</p>
                </div>
                <div className="hidden sm:block w-px h-8 bg-brand-green/20"></div>
                <div className="flex-1 w-full sm:text-right">
                  <div className="flex items-center sm:justify-end gap-2 mb-1 text-brand-green"><Users size={14} /><p className="text-[10px] font-black uppercase tracking-widest">Guests</p></div>
                  <p className="text-sm font-bold text-brand-dark">{isBookingLoading ? 'Fetching...' : bookingDetails ? `${bookingDetails.adults || 0} Adults, ${bookingDetails.kids || 0} Kids` : 'N/A'}</p>
                </div>
              </div>

              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100"><p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Contact Details</p></div>
                <div className="p-5 bg-white grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                  <div><div className="flex items-center gap-2 mb-1"><User size={12} className="text-brand-green" /><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Full Name</p></div><p className="text-sm font-medium text-brand-dark truncate">{viewModal.payment.name || `${customerData?.firstName || ''} ${customerData?.lastName || ''}`.trim() || 'N/A'}</p></div>
                  <div><div className="flex items-center gap-2 mb-1"><Mail size={12} className="text-brand-green" /><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email Address</p></div><p className="text-sm font-medium text-brand-dark truncate">{viewModal.payment.email || customerData?.email || 'N/A'}</p></div>
                  <div><div className="flex items-center gap-2 mb-1"><Phone size={12} className="text-brand-green" /><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Phone Number</p></div><p className="text-sm font-medium text-brand-dark truncate">{viewModal.payment.phone || customerData?.phoneNumber || 'N/A'}</p></div>
                  <div><div className="flex items-center gap-2 mb-1"><MapPin size={12} className="text-brand-green" /><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Country</p></div><p className="text-sm font-medium text-brand-dark">{isCustomerLoading ? 'Loading...' : customerData?.country || 'N/A'}</p></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </FormModal>
    </div>
  );
};

export default AdminPaymentPage;
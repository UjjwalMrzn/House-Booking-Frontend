import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '../../../api/paymentService';
import { CreditCard, Eye, ArrowUpDown, ChevronUp, ChevronDown, User, MapPin, Calendar, DollarSign, Hash, Mail, Phone, Activity } from 'lucide-react';
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
        (payment.status || '').toLowerCase().includes(lowerSearch) 
      );
    }

    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (sortConfig.key === 'amount') { aValue = Number(aValue); bValue = Number(bValue); } 
        else { aValue = String(aValue || '').toLowerCase(); bValue = String(bValue || '').toLowerCase(); }
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
          searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchPlaceholder="Search ID, name, status..."
          page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize} hasNextPage={!!paymentsData?.next}
        />

        {/* SURGICAL FIX: Loading and Empty states moved OUTSIDE the table to ensure dead-center alignment on mobile */}
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
            <table className="w-full text-left border-separate border-spacing-y-2 min-w-[600px] md:min-w-[850px] px-2 md:px-4">
              <thead>
                <tr>
                  <th className="hidden md:table-cell py-2 px-4"><button onClick={() => handleSort('paypalOrderId')} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400">Order ID {renderSortIcon('paypalOrderId')}</button></th>
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
                    <td className="py-4 px-4 whitespace-nowrap rounded-l-2xl md:rounded-none">
                      <div className="font-black text-brand-dark text-sm truncate max-w-[120px] md:max-w-[150px]">{payment.name || 'Guest'}</div>
                      <div className="text-[10px] md:text-[11px] font-medium text-gray-500 truncate max-w-[120px] md:max-w-[150px] mt-0.5">{payment.email}</div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-bold text-brand-dark text-sm truncate max-w-[120px] md:max-w-[150px]">{payment.property_title || `Prop ID: ${payment.property}`}</div>
                      <div className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">Book ID: {payment.booking}</div>
                    </td>
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
        {viewModal.payment && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">PayPal Order ID</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-1">
                  <p className="text-sm md:text-lg font-mono font-black text-brand-dark bg-gray-50 px-3 py-1 rounded-lg inline-block border border-gray-100 break-all">{viewModal.payment.paypalOrderId}</p>
                  <span className={`w-fit px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1 ${getStatusStyle(viewModal.payment.status)}`}><Activity size={12} /> {viewModal.payment.status || 'Unknown'}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Paid</p>
                <p className="text-xl md:text-3xl font-black text-brand-green tracking-tight">${Number(viewModal.payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400 shrink-0"><MapPin size={18} /></div><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Property</p><p className="text-sm font-bold text-brand-dark truncate" title={viewModal.payment.property_title}>{viewModal.payment.property_title || `ID: ${viewModal.payment.property}`}</p></div></div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400 shrink-0"><Hash size={18} /></div><div><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Linked Booking</p><p className="text-sm font-bold text-brand-dark">ID: {viewModal.payment.booking}</p></div></div>
            </div>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex justify-between items-center"><p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Payer Information</p><div className="flex items-center gap-1.5 text-gray-400"><Calendar size={12} /><span className="text-[10px] font-bold uppercase tracking-widest">{new Date(viewModal.payment.createdAt).toLocaleString()}</span></div></div>
              <div className="p-5 bg-white grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                <div><div className="flex items-center gap-2 mb-1"><User size={12} className="text-brand-green" /><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Full Name</p></div><p className="text-sm font-medium text-brand-dark truncate">{viewModal.payment.name || 'Not provided'}</p></div>
                <div><div className="flex items-center gap-2 mb-1"><Mail size={12} className="text-brand-green" /><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email Address</p></div><p className="text-sm font-medium text-brand-dark truncate">{viewModal.payment.email || 'Not provided'}</p></div>
                <div><div className="flex items-center gap-2 mb-1"><Phone size={12} className="text-brand-green" /><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Phone Number</p></div><p className="text-sm font-medium text-brand-dark truncate">{viewModal.payment.phone || 'Not provided'}</p></div>
              </div>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
};

export default AdminPaymentPage;
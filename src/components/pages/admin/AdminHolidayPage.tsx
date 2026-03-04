import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { holidayService } from '../../../api/holidayService';
import { useToast } from '../../ui/Toaster';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import FormModal from '../../ui/FormModal';
import Modal from '../../ui/Modal';
import Toggle from '../../ui/Toggle'; 
import SingleDatePicker from '../../ui/SingleDatePicker'; 
import TableToolbar from '../../ui/TableToolbar';
import { DayPicker } from 'react-day-picker';
import { format, parseISO } from 'date-fns';
import { CalendarDays, Plus, Edit2, Trash2, CheckCircle, XCircle, Calendar as CalendarIcon } from 'lucide-react';
import 'react-day-picker/dist/style.css';

const AdminHolidaysPage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState("10"); 

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null as number | null, name: '', date: '', is_active: true });
  const [isEdit, setIsEdit] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; name: string }>({ isOpen: false, id: null, name: '' });

  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ['admin-holidays', 'paginated', page, Number(pageSize)],
    queryFn: () => holidayService.getAllHolidays(page, Number(pageSize)),
  });

  const { data: allHolidaysData } = useQuery({
    queryKey: ['admin-holidays', 'all'],
    queryFn: () => holidayService.getAllHolidays(1, 500),
  });

  const tableHolidays = useMemo(() => {
    if (!paginatedData) return [];
    return Array.isArray(paginatedData) ? paginatedData : (paginatedData.results || []);
  }, [paginatedData]);

  const totalCount = paginatedData?.count || tableHolidays.length;

  const holidayDates = useMemo(() => {
    if (!allHolidaysData) return [];
    const allHolidaysList = Array.isArray(allHolidaysData) ? allHolidaysData : (allHolidaysData.results || []);
    return allHolidaysList.filter((h: any) => h.is_active).map((h: any) => parseISO(h.date));
  }, [allHolidaysData]);

  const saveMutation = useMutation({
    mutationFn: (payloadData: typeof formData) => {
      const payload = { name: payloadData.name, date: payloadData.date, is_active: payloadData.is_active };
      return isEdit && payloadData.id ? holidayService.updateHoliday(payloadData.id, payload) : holidayService.createHoliday(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-holidays'] }); 
      closeForm();
      toast.success(`Holiday ${isEdit ? 'updated' : 'added'} successfully!`);
    },
    onError: () => toast.error("Failed to save holiday.")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => holidayService.deleteHoliday(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-holidays'] });
      setDeleteModal({ isOpen: false, id: null, name: '' });
      toast.success("Holiday deleted permanently.");
    }
  });

  const openAdd = () => {
    setFormData({ id: null, name: '', date: format(new Date(), 'yyyy-MM-dd'), is_active: true });
    setIsEdit(false);
    setIsFormOpen(true);
  };

  const openEdit = (h: any) => {
    setFormData({ id: h.id, name: h.name, date: h.date, is_active: h.is_active });
    setIsEdit(true);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormData({ id: null, name: '', date: '', is_active: true });
  };

  return (
    <div className="max-w-[1400px] mx-auto w-full animate-fade-in space-y-8 pb-10">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-brand-dark tracking-tight flex items-center gap-3">
            <CalendarDays className="text-brand-green" size={32} />
            Australian Public Holidays
          </h1>
          <p className="text-sm font-bold text-gray-400 mt-1">Manage dates that affect booking availability and pricing.</p>
        </div>
        <Button onClick={openAdd} className="px-6 py-3 flex items-center gap-2 shadow-lg shadow-brand-green/20">
          <Plus size={18} strokeWidth={3} /> Add Holiday
        </Button>
      </div>

      {/* TOP: Live Preview Calendar */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-10 overflow-hidden">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
            <CalendarIcon size={20} strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-black text-brand-dark tracking-tight">Live Calendar Preview</h3>
        </div>
        
        <div className="flex justify-center items-center">
          <style>{`
            .holiday-preview .rdp-day_holiday { 
              color: #8b5cf6 !important; 
              background-color: transparent !important; 
              font-weight: 900 !important;
            }
            .holiday-preview .rdp-months { justify-content: center !important; }
            .holiday-preview .rdp-table { pointer-events: none; }
          `}</style>
          <div className="holiday-preview select-none scale-110">
            <DayPicker 
              numberOfMonths={window.innerWidth > 1024 ? 2 : 1}
              modifiers={{ holiday: holidayDates }}
              modifiersClassNames={{ holiday: "rdp-day_holiday" }}
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3 border-t border-gray-50 pt-6">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Active Public Holiday</span>
        </div>
      </div>

      {/* BOTTOM: Managed Holidays List */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
        
        <TableToolbar 
          title={
            <h3 className="text-lg font-black text-brand-dark flex items-center gap-2">
              Managed Holidays
              <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                {totalCount} Total
              </span>
            </h3>
          }
          page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize} hasNextPage={!!paginatedData?.next}
        />
        
        <div className="overflow-x-auto custom-scrollbar rounded-b-[2.5rem]">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-gray-50/30 border-b border-gray-100">
                <th className="py-4 px-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                <th className="py-4 px-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Name</th>
                <th className="py-4 px-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="py-4 px-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold text-brand-dark">
              {isLoading ? (
                <tr><td colSpan={4} className="py-20 text-center text-gray-400 font-black uppercase tracking-widest animate-pulse">Synchronizing...</td></tr>
              ) : tableHolidays.length === 0 ? (
                <tr><td colSpan={4} className="py-20 text-center text-gray-400">No holidays found for this page.</td></tr>
              ) : (
                tableHolidays.map((holiday: any) => (
                  <tr key={holiday.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors group cursor-default">
                    <td className="py-5 px-8 font-black text-brand-dark flex items-center gap-2">
                      <CalendarIcon size={14} className="text-purple-400" />
                      {format(parseISO(holiday.date), 'dd MMM yyyy')}
                    </td>
                    <td className="py-5 px-8">{holiday.name}</td>
                    <td className="py-5 px-8">
                      {holiday.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 text-brand-green text-[10px] font-black uppercase border border-green-100">
                          <CheckCircle size={12} strokeWidth={3} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 text-[10px] font-black uppercase border border-gray-200">
                          <XCircle size={12} strokeWidth={3} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-5 px-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(holiday)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-brand-dark transition-colors shadow-sm">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => setDeleteModal({ isOpen: true, id: holiday.id, name: holiday.name })} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                          <Trash2 size={16} />
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

      <FormModal isOpen={isFormOpen} onClose={closeForm} title={isEdit ? 'Edit Holiday' : 'Add Holiday'}>
        <div className="space-y-6">
          <Input 
            label="Holiday Name" 
            value={formData.name} 
            onChange={(e: any) => setFormData({...formData, name: e.target.value})} 
            placeholder="e.g., Australia Day"
          />
          <SingleDatePicker label="Holiday Date" value={formData.date} onChange={(dateStr) => setFormData({...formData, date: dateStr})} />
          <Toggle label="Active Holiday" description="Toggle off to hide this date from the live public calendar." checked={formData.is_active} onChange={(checked) => setFormData({...formData, is_active: checked})} />
          <Button onClick={() => saveMutation.mutate(formData)} disabled={!formData.name || !formData.date || saveMutation.isPending} fullWidth className="h-14 mt-4">
            {saveMutation.isPending ? 'Processing...' : (isEdit ? 'Update Details' : 'Add to Calendar')}
          </Button>
        </div>
      </FormModal>

      <Modal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })} onConfirm={() => { if (deleteModal.id) deleteMutation.mutate(deleteModal.id); }} title="Remove Holiday" message={`Are you sure you want to remove "${deleteModal.name}"? This action cannot be undone.`} confirmText="Remove Permanently" variant="danger" loading={deleteMutation.isPending} />
    </div>
  );
};

export default AdminHolidaysPage;
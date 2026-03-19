import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolHolidayService } from '../../../api/schoolHolidayService';
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
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Calendar as CalendarIcon, BookOpen } from 'lucide-react';
import 'react-day-picker/dist/style.css';
import AdminPageContainer from '../../layouts/AdminPageContainer';

const AdminSchoolHolidaysPage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState("10"); 

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isRangeMode, setIsRangeMode] = useState(false);
  
  const [formData, setFormData] = useState({ id: null as number | null, name: '', date: '', endDate: '', is_active: true });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; name: string }>({ isOpen: false, id: null, name: '' });

  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ['admin-school-holidays', 'paginated', page, Number(pageSize)],
    queryFn: () => schoolHolidayService.getSchoolHolidays(page, Number(pageSize)),
  });

  const { data: allHolidaysData } = useQuery({
    queryKey: ['admin-school-holidays', 'all'],
    queryFn: () => schoolHolidayService.getSchoolHolidays(1, 500),
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
      if (isEdit && payloadData.id) {
        return schoolHolidayService.updateHoliday(payloadData.id, { name: payloadData.name, date: payloadData.date, is_active: payloadData.is_active });
      } else if (isRangeMode) {
        // We pass is_active just in case the backend accepts it, otherwise it defaults to true
        return schoolHolidayService.createHolidayRange({ name: payloadData.name, start_date: payloadData.date, end_date: payloadData.endDate });
      } else {
        return schoolHolidayService.createHoliday({ name: payloadData.name, date: payloadData.date, is_active: payloadData.is_active });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-school-holidays'] }); 
      closeForm();
      toast.success(`School Holiday ${isEdit ? 'updated' : 'added'} successfully!`);
    },
    onError: () => toast.error("Failed to save holiday.")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => schoolHolidayService.deleteHoliday(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-school-holidays'] });
      setDeleteModal({ isOpen: false, id: null, name: '' });
      toast.success("School Holiday deleted permanently.");
    }
  });

  const openAdd = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setFormData({ id: null, name: '', date: today, endDate: today, is_active: true });
    setIsEdit(false);
    setIsRangeMode(false);
    setIsFormOpen(true);
  };

  const openEdit = (h: any) => {
    setFormData({ id: h.id, name: h.name, date: h.date, endDate: '', is_active: h.is_active });
    setIsEdit(true);
    setIsRangeMode(false);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormData({ id: null, name: '', date: '', endDate: '', is_active: true });
  };

  return (
    <>
      <AdminPageContainer
        title="School Holidays"
        subtitle="Manage school term breaks that affect booking availability and pricing."
        icon={<BookOpen size={32} />}
        headerAction={
          <Button onClick={openAdd} className="w-full sm:w-auto px-6 py-3 flex items-center justify-center gap-2 shadow-lg shadow-brand-green/20">
            <Plus size={18} strokeWidth={3} /> Add Holiday
          </Button>
        }
      >
        <div className="p-6 m-4 md:m-8 bg-gray-50/50 rounded-[2rem] border border-gray-100">
          <div className="flex items-center gap-3 mb-4 md:mb-8">
            <div className="w-10 h-10 bg-white text-teal-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
              <CalendarIcon size={20} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg md:text-xl font-black text-brand-dark tracking-tight">Live Calendar Preview</h3>
          </div>
          
          <div className="w-full flex justify-center py-4 max-w-full overflow-x-auto scrollbar-hide">
            <style>{`
              .holiday-preview .rdp-day_holiday { 
                color: #14b8a6 !important; 
                background-color: transparent !important; 
                font-weight: 900 !important;
              }
              .holiday-preview .rdp-day_weekend {
                color: #3b82f6 !important;
                font-weight: 900 !important;
              }
              .holiday-preview .rdp-months { justify-content: center !important; gap: 2rem; }
              .holiday-preview .rdp-table { pointer-events: none; }
            `}</style>
            
            <div className="holiday-preview select-none">
              <DayPicker 
                numberOfMonths={window.innerWidth > 1024 ? 2 : 1}
                defaultMonth={new Date()}
                modifiers={{ holiday: holidayDates, weekend: { dayOfWeek: [0, 6] } }}
                modifiersClassNames={{ holiday: "rdp-day_holiday", weekend: "rdp-day_weekend" }}
              />
            </div>
          </div>

          <div className="mt-4 md:mt-6 flex flex-wrap items-center justify-center gap-6 border-t border-gray-200/60 pt-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-50"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Weekend</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-teal-50"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-500">Active School Holiday</span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden">
          <TableToolbar 
            title={
              <h3 className="text-base md:text-lg font-black text-brand-dark flex items-center gap-2">
                Managed Holidays
                <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                  {totalCount} Total
                </span>
              </h3>
            }
            page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize} hasNextPage={!!paginatedData?.next}
          />
          
          {isLoading ? (
            <div className="py-20 text-center text-gray-400 font-black uppercase tracking-widest animate-pulse">Synchronizing...</div>
          ) : tableHolidays.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center w-full">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-3 text-gray-300">
                <BookOpen size={24} />
              </div>
              <p className="text-sm font-bold text-gray-400">No school holidays found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-hide rounded-b-[2.5rem]">
              <table className="w-full text-left border-collapse min-w-[600px] md:min-w-[850px]">
                <thead>
                  <tr className="bg-gray-50/30 border-b border-gray-100">
                    <th className="py-4 px-4 md:px-8 text-[10px] font-black uppercase tracking-widest text-gray-400 w-12">S.N.</th>
                    <th className="py-4 px-4 md:px-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                    <th className="py-4 px-4 md:px-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Name</th>
                    <th className="py-4 px-4 md:px-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                    <th className="py-4 px-4 md:px-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-bold text-brand-dark">
                  {tableHolidays.map((holiday: any, index: number) => {
                    const serialNumber = (page - 1) * Number(pageSize) + index + 1;
                    return (
                      <tr key={holiday.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors group cursor-default">
                        <td className="py-4 px-4 md:px-8 text-sm font-bold text-gray-500">{serialNumber}</td>
                        <td className="py-4 px-4 md:px-8 font-black text-brand-dark flex items-center gap-2 whitespace-nowrap">
                          <CalendarIcon size={14} className="text-teal-400" />
                          {format(parseISO(holiday.date), 'dd MMM yyyy')}
                        </td>
                        <td className="py-4 px-4 md:px-8 font-bold truncate max-w-[150px] md:max-w-full">{holiday.name}</td>
                        <td className="py-4 px-4 md:px-8">
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
                        <td className="py-4 px-4 md:px-8 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEdit(holiday)} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-brand-dark transition-colors shadow-sm">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => setDeleteModal({ isOpen: true, id: holiday.id, name: holiday.name })} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">
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
      </AdminPageContainer>

      <FormModal isOpen={isFormOpen} onClose={closeForm} title={isEdit ? 'Edit Holiday' : 'Add Holiday'}>
        <div className="space-y-6">
          {!isEdit && (
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                className={`flex-1 py-2 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${!isRangeMode ? 'bg-white shadow text-brand-dark' : 'text-gray-400 hover:text-gray-600'}`}
                onClick={() => setIsRangeMode(false)}
              >
                Single Date
              </button>
              <button 
                className={`flex-1 py-2 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${isRangeMode ? 'bg-white shadow text-brand-dark' : 'text-gray-400 hover:text-gray-600'}`}
                onClick={() => setIsRangeMode(true)}
              >
                Date Range
              </button>
            </div>
          )}

          <Input 
            label="Holiday Name" 
            value={formData.name} 
            onChange={(e: any) => setFormData({...formData, name: e.target.value})} 
            placeholder="e.g., Easter Break"
          />

          {!isRangeMode ? (
            <SingleDatePicker label="Holiday Date" value={formData.date} onChange={(dateStr) => setFormData({...formData, date: dateStr})} />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <SingleDatePicker label="Start Date" value={formData.date} onChange={(dateStr) => setFormData({...formData, date: dateStr})} />
              <SingleDatePicker label="End Date" value={formData.endDate} onChange={(dateStr) => setFormData({...formData, endDate: dateStr})} />
            </div>
          )}
          
          {/* SURGICAL FIX: Removed the condition hiding this so it shows in both Range and Single mode */}
          <Toggle label="Active Holiday" description="Toggle off to hide this date from the live calendar." checked={formData.is_active} onChange={(checked) => setFormData({...formData, is_active: checked})} />

          <Button 
            onClick={() => saveMutation.mutate(formData)} 
            disabled={!formData.name || !formData.date || (isRangeMode && !formData.endDate) || saveMutation.isPending} 
            fullWidth 
            className="h-14 mt-4 shadow-[0_8px_15px_-5px_rgba(74,222,128,0.4)]"
          >
            {saveMutation.isPending ? 'Processing...' : (isEdit ? 'Update Details' : 'Add to Calendar')}
          </Button>
        </div>
      </FormModal>

      <Modal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })} onConfirm={() => { if (deleteModal.id) deleteMutation.mutate(deleteModal.id); }} title="Remove Holiday" message={`Are you sure you want to remove "${deleteModal.name}"? This action cannot be undone.`} confirmText="Remove Permanently" variant="danger" loading={deleteMutation.isPending} />
    </>
  );
};

export default AdminSchoolHolidaysPage;
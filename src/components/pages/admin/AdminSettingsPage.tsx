import { useState, useEffect } from 'react';
import { Settings, Save, Target, ShieldCheck } from 'lucide-react';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { useToast } from '../../ui/Toaster';
import AdminPageContainer from '../../layouts/AdminPageContainer';

const AdminSettingsPage = () => {
  const toast = useToast();
  const [monthlyGoal, setMonthlyGoal] = useState('300000');

  useEffect(() => {
    const savedGoal = localStorage.getItem('admin_revenue_goal');
    if (savedGoal) setMonthlyGoal(savedGoal);
  }, []);

  const handleSave = () => {
    localStorage.setItem('admin_revenue_goal', monthlyGoal);
    toast.success("Platform settings updated successfully!");
  };

  return (
    <AdminPageContainer
      title="Platform Settings"
      subtitle="Manage global configurations and business targets."
      icon={<Settings size={32} />}
    >
      {/* SURGICAL FIX: Responsive inner padding */}
      <div className="p-5 md:p-8 space-y-8">
        <section className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
            <Target className="text-brand-green" size={20} />
            <h3 className="font-black text-brand-dark uppercase text-[10px] tracking-widest">Business Intelligence</h3>
          </div>
          
          <div className="max-w-md">
            <Input 
              label="Monthly Revenue Target ($)" 
              type="number"
              value={monthlyGoal}
              onChange={(e: any) => setMonthlyGoal(e.target.value)}
              placeholder="e.g. 300000"
            />
            {/* SURGICAL FIX: Unbolded helper text for standardization */}
            <p className="text-[10px] font-normal text-gray-400 mt-2 ml-1">
              This value determines the progress bar percentage on your main dashboard.
            </p>
          </div>
        </section>

        <section className="space-y-6 pt-4">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
            <ShieldCheck className="text-indigo-500" size={20} />
            <h3 className="font-black text-brand-dark uppercase text-[10px] tracking-widest">Security & Access</h3>
          </div>
          {/* SURGICAL FIX: Allows wrapping on extremely narrow screens */}
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <span className="text-xs font-bold text-indigo-700">Administrator Token Status</span>
            <span className="w-fit text-[10px] font-black uppercase tracking-widest text-white bg-indigo-500 px-3 py-1 rounded-full shadow-sm">Active</span>
          </div>
        </section>

        {/* SURGICAL FIX: Full width button on mobile */}
        <div className="pt-6 flex flex-col sm:flex-row sm:justify-end border-t border-gray-50">
          <Button onClick={handleSave} className="w-full sm:w-auto px-10 py-3 md:py-3.5 shadow-md flex items-center justify-center gap-2">
            <Save size={18} strokeWidth={2.5} /> Save Settings
          </Button>
        </div>
      </div>
    </AdminPageContainer>
  );
};

export default AdminSettingsPage;
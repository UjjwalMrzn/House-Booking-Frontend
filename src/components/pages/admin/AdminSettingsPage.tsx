import { useState, useEffect } from 'react';
import { Settings, Save, Target, ShieldCheck } from 'lucide-react';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { useToast } from '../../ui/Toaster';

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
    <div className="max-w-4xl mx-auto w-full animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-brand-dark tracking-tight flex items-center gap-3">
          <Settings className="text-brand-green" size={32} />
          Platform Settings
        </h1>
        <p className="text-sm font-bold text-gray-400 mt-1">Manage global configurations and business targets.</p>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] p-8 space-y-8">
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
            <p className="text-[10px] font-bold text-gray-400 mt-2 ml-1 italic">
              This value determines the progress bar percentage on your main dashboard.
            </p>
          </div>
        </section>

        <section className="space-y-6 pt-4">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
            <ShieldCheck className="text-indigo-500" size={20} />
            <h3 className="font-black text-brand-dark uppercase text-[10px] tracking-widest">Security & Access</h3>
          </div>
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex justify-between items-center">
            <span className="text-xs font-bold text-indigo-700">Administrator Token Status</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-white bg-indigo-500 px-3 py-1 rounded-full shadow-sm">Active</span>
          </div>
        </section>

        <div className="pt-6 flex justify-end">
          <Button onClick={handleSave} className="px-10">
            <Save size={18} /> Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
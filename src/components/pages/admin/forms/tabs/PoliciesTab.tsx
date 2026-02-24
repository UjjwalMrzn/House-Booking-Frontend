import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService } from '../../../../../api/propertyService';
import { useToast } from '../../../../ui/Toaster';
import { FileText, Clock, Plus, Edit, Trash2, X, ShieldAlert } from 'lucide-react';
import Button from '../../../../ui/Button';
import Input from '../../../../ui/Input';
import TimePicker from '../../../../ui/TimePicker'; // Check the import path

interface PoliciesTabProps {
  propertyId: string;
  checkInOutRules: any[];
  policies: any[];
}

const PoliciesTab: React.FC<PoliciesTabProps> = ({ propertyId, checkInOutRules = [], policies = [] }) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  // State for Check-in/out Modal
  const [ruleForm, setRuleForm] = useState({ isOpen: false, isEdit: false, id: null as number | null, check_in: '', check_out: '' });
  
  // State for General Policies Modal
  const [policyForm, setPolicyForm] = useState({ isOpen: false, isEdit: false, id: null as number | null, name: '', description: '' });

  // --- MUTATIONS: CHECK-IN / OUT ---
  const saveRuleMutation = useMutation({
    mutationFn: async (data: typeof ruleForm) => {
      if (data.isEdit && data.id) return propertyService.updateCheckInOutRule(data.id, { check_in: data.check_in, check_out: data.check_out });
      return propertyService.addCheckInOutRule({ property: propertyId, check_in: data.check_in, check_out: data.check_out });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      setRuleForm({ isOpen: false, isEdit: false, id: null, check_in: '', check_out: '' });
      toast.success("Times saved successfully!");
    },
    onError: () => toast.error("Failed to save times.")
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id: number) => propertyService.deleteCheckInOutRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      toast.success("Times removed.");
    }
  });

  // --- MUTATIONS: POLICIES ---
  const savePolicyMutation = useMutation({
    mutationFn: async (data: typeof policyForm) => {
      if (data.isEdit && data.id) return propertyService.updatePropertyPolicy(data.id, { name: data.name, description: data.description });
      return propertyService.addPropertyPolicy({ property: propertyId, name: data.name, description: data.description });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      setPolicyForm({ isOpen: false, isEdit: false, id: null, name: '', description: '' });
      toast.success("Policy saved successfully!");
    },
    onError: () => toast.error("Failed to save policy.")
  });

  const deletePolicyMutation = useMutation({
    mutationFn: (id: number) => propertyService.deletePropertyPolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      toast.success("Policy removed.");
    }
  });

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: CHECK-IN & CHECK-OUT */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden animate-entrance">
        <div className="p-6 border-b border-gray-50 bg-white/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center shadow-inner">
              <Clock size={16} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-black text-brand-dark tracking-tight">Check-in & Check-out</h3>
          </div>
          {/* Only allow adding if there isn't one already (usually properties only have 1 schedule) */}
          {checkInOutRules.length === 0 && (
            <Button onClick={() => setRuleForm({ isOpen: true, isEdit: false, id: null, check_in: '14:00', check_out: '11:00' })} className="px-4 py-2 text-xs flex items-center gap-2 bg-amber-500 hover:bg-amber-600 shadow-amber-500/30">
              <Plus size={14} strokeWidth={3} /> Add Times
            </Button>
          )}
        </div>

        <div className="p-6">
          {checkInOutRules.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 font-bold text-sm">
              No arrival/departure times set.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {checkInOutRules.map((rule: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-5 rounded-xl border border-amber-100 bg-amber-50/30">
                  <div className="flex gap-10">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Check-in After</p>
                      <p className="text-lg font-black text-brand-dark">{rule.check_in}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Check-out Before</p>
                      <p className="text-lg font-black text-brand-dark">{rule.check_out}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setRuleForm({ isOpen: true, isEdit: true, id: rule.id, check_in: rule.check_in, check_out: rule.check_out })} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-gray-500 hover:text-amber-500 transition-colors">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => window.confirm("Remove these times?") && deleteRuleMutation.mutate(rule.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-gray-500 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: POLICIES */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden animate-entrance" style={{ animationDelay: '0.1s' }}>
        <div className="p-6 border-b border-gray-50 bg-white/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-green/10 text-brand-green rounded-lg flex items-center justify-center shadow-inner">
              <ShieldAlert size={16} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-black text-brand-dark tracking-tight">House Rules & Policies</h3>
          </div>
          <Button onClick={() => setPolicyForm({ isOpen: true, isEdit: false, id: null, name: '', description: '' })} className="px-4 py-2 text-xs flex items-center gap-2">
            <Plus size={14} strokeWidth={3} /> Add Policy
          </Button>
        </div>

        <div className="p-6">
          {policies.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 font-bold text-sm">
              No policies added yet. Click above to add one.
            </div>
          ) : (
            <div className="space-y-3">
              {policies.map((policy: any, index: number) => (
                <div key={index} className="flex items-start justify-between p-5 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-all shadow-sm">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 mt-1 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-brand-dark">{policy.name}</h4>
                      <p className="text-xs font-bold text-gray-400 mt-1 leading-relaxed">{policy.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-4">
                    <button onClick={() => setPolicyForm({ isOpen: true, isEdit: true, id: policy.id, name: policy.name, description: policy.description })} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-brand-green hover:text-white transition-colors">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => window.confirm(`Delete ${policy.name}?`) && deletePolicyMutation.mutate(policy.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-red-500 hover:text-white transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL: CHECK-IN / OUT TIMES --- */}
      {ruleForm.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-fade-in" onMouseDown={() => setRuleForm({ ...ruleForm, isOpen: false })}>
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden animate-slide-up" onMouseDown={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-black text-brand-dark tracking-tight">Set Property Times</h3>
              <button onClick={() => setRuleForm({ ...ruleForm, isOpen: false })} className="text-gray-400 hover:text-brand-dark transition-colors"><X size={20} strokeWidth={3} /></button>
            </div>
            <div className="p-6 space-y-5">
             <div className="grid grid-cols-2 gap-4">
                <TimePicker 
                  label="Check-in Time" 
                  value={ruleForm.check_in} 
                  onChange={(newTime) => setRuleForm({ ...ruleForm, check_in: newTime })} 
                  required 
                />
                <TimePicker 
                  label="Check-out Time" 
                  value={ruleForm.check_out} 
                  onChange={(newTime) => setRuleForm({ ...ruleForm, check_out: newTime })} 
                  required 
                />
              </div>
              <Button onClick={() => saveRuleMutation.mutate(ruleForm)} disabled={!ruleForm.check_in || !ruleForm.check_out || saveRuleMutation.isPending} className="w-full py-3 bg-amber-500 hover:bg-amber-600 shadow-amber-500/30 text-white border-none">
                {saveRuleMutation.isPending ? 'Saving...' : 'Save Times'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: POLICIES --- */}
      {policyForm.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-fade-in" onMouseDown={() => setPolicyForm({ ...policyForm, isOpen: false })}>
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden animate-slide-up" onMouseDown={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-black text-brand-dark tracking-tight">{policyForm.isEdit ? 'Edit Policy' : 'Add Policy'}</h3>
              <button onClick={() => setPolicyForm({ ...policyForm, isOpen: false })} className="text-gray-400 hover:text-brand-dark transition-colors"><X size={20} strokeWidth={3} /></button>
            </div>
            <div className="p-6 space-y-5">
              <Input label="Policy Name" name="name" value={policyForm.name} onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })} placeholder="e.g., Cancellation Policy, Smoking..." required />
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Policy Details</label>
                <textarea 
                  value={policyForm.description} 
                  onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })} 
                  placeholder="Explain the rules clearly to your guests..." 
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-brand-dark outline-none focus:border-brand-green resize-none"
                />
              </div>
              <Button onClick={() => savePolicyMutation.mutate(policyForm)} disabled={!policyForm.name || !policyForm.description || savePolicyMutation.isPending} className="w-full py-3">
                {savePolicyMutation.isPending ? 'Saving...' : 'Save Policy'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PoliciesTab;
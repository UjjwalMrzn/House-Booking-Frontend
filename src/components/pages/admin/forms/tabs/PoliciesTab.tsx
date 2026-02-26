import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService } from '../../../../../api/propertyService';
import { useToast } from '../../../../ui/Toaster';
import { FileText, Clock, Plus, Edit, Trash2, ShieldAlert } from 'lucide-react';
import Button from '../../../../ui/Button';
import Input from '../../../../ui/Input';
import TimePicker from '../../../../ui/TimePicker'; 
import Modal from '../../../../ui/Modal';
import FormModal from '../../../../ui/FormModal'; 

interface PoliciesTabProps {
  propertyId: string;
  checkInOutRules: any[];
  policies: any[];
  isViewMode?: boolean;
}

const PoliciesTab: React.FC<PoliciesTabProps> = ({ propertyId, checkInOutRules = [], policies = [], isViewMode }) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [ruleForm, setRuleForm] = useState({ isOpen: false, isEdit: false, id: null as number | null, check_in: '', check_out: '' });
  const [policyForm, setPolicyForm] = useState({ isOpen: false, isEdit: false, id: null as number | null, name: '', description: '' });

  const [deleteRuleModal, setDeleteRuleModal] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
  const [deletePolicyModal, setDeletePolicyModal] = useState<{ isOpen: boolean; id: number | null; name: string }>({ isOpen: false, id: null, name: "" });

  // CLEANED OF HACKS: Strictly relies on standard `data.id`
  const saveRuleMutation = useMutation({
    mutationFn: async (data: typeof ruleForm) => {
      if (data.isEdit && data.id) {
        return propertyService.updateCheckInOutRule(data.id, { check_in: data.check_in, check_out: data.check_out });
      }
      return propertyService.addCheckInOutRule({ property: propertyId, check_in: data.check_in, check_out: data.check_out });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      setRuleForm({ isOpen: false, isEdit: false, id: null, check_in: '', check_out: '' });
      toast.success("Times saved successfully!");
    },
    onError: (error: any) => {
      const backendError = error.response?.data?.error || "Failed to save times.";
      toast.error(backendError);
    }
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id: number) => propertyService.deleteCheckInOutRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      toast.success("Times removed.");
      setDeleteRuleModal({ isOpen: false, id: null });
    }
  });

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
    onError: (error: any) => {
      const backendError = error.response?.data?.error || "Failed to save policy.";
      toast.error(backendError);
    }
  });

  const deletePolicyMutation = useMutation({
    mutationFn: (id: number) => propertyService.deletePropertyPolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      toast.success("Policy removed.");
      setDeletePolicyModal({ isOpen: false, id: null, name: "" });
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
          {checkInOutRules.length === 0 && !isViewMode && (
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
                  {!isViewMode && (
                  <div className="flex gap-2">
                    <button onClick={() => setRuleForm({ isOpen: true, isEdit: true, id: rule.id, check_in: rule.check_in, check_out: rule.check_out })} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-gray-500 hover:text-amber-500 transition-colors">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => setDeleteRuleModal({ isOpen: true, id: rule.id })} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-gray-500 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  )}
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
          {!isViewMode && (
          <Button onClick={() => setPolicyForm({ isOpen: true, isEdit: false, id: null, name: '', description: '' })} className="px-4 py-2 text-xs flex items-center gap-2">
            <Plus size={14} strokeWidth={3} /> Add Policy
          </Button>
          )}
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
                  {!isViewMode && (
                  <div className="flex gap-2 shrink-0 ml-4">
                    <button onClick={() => setPolicyForm({ isOpen: true, isEdit: true, id: policy.id, name: policy.name, description: policy.description })} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-brand-green hover:text-white transition-colors">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => setDeletePolicyModal({ isOpen: true, id: policy.id, name: policy.name })} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-red-500 hover:text-white transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- REUSABLE FORM MODALS --- */}
      <FormModal 
        isOpen={ruleForm.isOpen} 
        onClose={() => setRuleForm({ ...ruleForm, isOpen: false })} 
        title="Set Property Times"
      >
        <div className="grid grid-cols-2 gap-4">
          <TimePicker label="Check-in Time" value={ruleForm.check_in} onChange={(newTime) => setRuleForm({ ...ruleForm, check_in: newTime })} required />
          <TimePicker label="Check-out Time" value={ruleForm.check_out} onChange={(newTime) => setRuleForm({ ...ruleForm, check_out: newTime })} required />
        </div>
        <Button onClick={() => saveRuleMutation.mutate(ruleForm)} disabled={!ruleForm.check_in || !ruleForm.check_out || saveRuleMutation.isPending} className="w-full py-3 bg-amber-500 hover:bg-amber-600 shadow-amber-500/30 text-white border-none">
          {saveRuleMutation.isPending ? 'Saving...' : 'Save Times'}
        </Button>
      </FormModal>

      <FormModal 
        isOpen={policyForm.isOpen} 
        onClose={() => setPolicyForm({ ...policyForm, isOpen: false })} 
        title={policyForm.isEdit ? 'Edit Policy' : 'Add Policy'}
      >
        <Input label="Policy Name" name="name" value={policyForm.name} onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })} placeholder="e.g., Cancellation Policy..." maxLength={150} required />
        <div className="space-y-1.5 relative group pb-4">
          <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Policy Details</label>
          <textarea value={policyForm.description} onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })} placeholder="Explain the rules..." maxLength={500} rows={4} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-brand-dark outline-none focus:border-brand-green resize-none" />
          {!isViewMode && (
            <div className="absolute bottom-0 right-2 text-[10px] font-bold text-gray-400">
              <span>{policyForm.description?.length || 0}</span> / 500
            </div>
          )}
        </div>
        <Button onClick={() => savePolicyMutation.mutate(policyForm)} disabled={!policyForm.name || !policyForm.description || savePolicyMutation.isPending} className="w-full py-3">
          {savePolicyMutation.isPending ? 'Saving...' : 'Save Policy'}
        </Button>
      </FormModal>

      {/* --- REUSABLE ALERT MODALS --- */}
      <Modal 
        isOpen={deleteRuleModal.isOpen}
        onClose={() => setDeleteRuleModal({ isOpen: false, id: null })}
        onConfirm={() => { if (deleteRuleModal.id) deleteRuleMutation.mutate(deleteRuleModal.id); }}
        title="Remove Times"
        message="Are you sure you want to remove the arrival and departure times for this property?"
        confirmText="Remove Now"
        variant="danger"
        loading={deleteRuleMutation.isPending}
      />

      <Modal 
        isOpen={deletePolicyModal.isOpen}
        onClose={() => setDeletePolicyModal({ isOpen: false, id: null, name: "" })}
        onConfirm={() => { if (deletePolicyModal.id) deletePolicyMutation.mutate(deletePolicyModal.id); }}
        title="Delete Policy"
        message={`Are you sure you want to delete "${deletePolicyModal.name}"? This action cannot be undone.`}
        confirmText="Delete Now"
        variant="danger"
        loading={deletePolicyMutation.isPending}
      />

    </div>
  );
};

export default PoliciesTab;
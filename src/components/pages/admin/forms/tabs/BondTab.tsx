import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bondService, type BondCharge } from '../../../../../api/bondService';
import { ShieldCheck, Trash2, Save, Plus, AlertCircle, RefreshCw, Edit2 } from 'lucide-react';
import { useToast } from '../../../../ui/Toaster';
import Input from '../../../../ui/Input';
import Button from '../../../../ui/Button';

interface BondTabProps {
  propertyId: number | null;
  isViewMode?: boolean;
}

const BondTab: React.FC<BondTabProps> = ({ propertyId, isViewMode }) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  const [amount, setAmount] = useState("");
  const [isEditing, setIsEditing] = useState(false); 

  const { data: bondsData, isLoading } = useQuery({
    queryKey: ['property-bond', propertyId],
    queryFn: () => bondService.getBonds(propertyId!),
    enabled: !!propertyId,
  });

  const existingBond = useMemo(() => {
    if (!bondsData) return null;
    const results = Array.isArray(bondsData) ? bondsData : (bondsData.results || []);
    return results.find((b: BondCharge) => b.property === propertyId) || null;
  }, [bondsData, propertyId]);

  useEffect(() => {
    if (existingBond) {
      setAmount(existingBond.amount || "");
      setIsEditing(false);
    } else {
      setAmount("");
      setIsEditing(true); 
    }
  }, [existingBond]);

  const createMutation = useMutation({
    mutationFn: () => bondService.createBond({ 
      property: propertyId!, 
      amount 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-bond', propertyId] });
      toast.success("Security bond established successfully.");
    },
    onError: () => toast.error("Failed to set security bond.")
  });

  const updateMutation = useMutation({
    mutationFn: () => bondService.updateBond(existingBond!.id!, { 
      amount 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-bond', propertyId] });
      toast.success("Bond amount updated.");
      setIsEditing(false); 
    },
    onError: () => toast.error("Failed to update bond.")
  });

  const deleteMutation = useMutation({
    mutationFn: () => bondService.deleteBond(existingBond!.id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-bond', propertyId] });
      setAmount("");
      toast.success("Bond removed.");
    },
    onError: () => toast.error("Failed to delete bond.")
  });

  if (!propertyId) {
    return (
      <div className="bg-white rounded-[2rem] border border-gray-100 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
          <ShieldCheck size={24} />
        </div>
        <h3 className="text-lg font-black text-brand-dark mb-2">Save Property First</h3>
        <p className="text-sm font-normal text-gray-400">You must save basic details before setting a bond.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-50 bg-white/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-green/10 text-brand-green rounded-lg flex items-center justify-center shadow-inner">
            <ShieldCheck size={16} strokeWidth={2.5} />
          </div>
          <h3 className="text-lg font-black text-brand-dark tracking-tight">Security Deposit (Bond)</h3>
        </div>
        <div className="flex gap-2">
          {existingBond && !isViewMode && !isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-brand-dark p-2 transition-colors"
              title="Edit Bond"
            >
              <Edit2 size={18} />
            </button>
          )}
          {existingBond && !isViewMode && (
            <button 
              onClick={() => { if(window.confirm("Remove this bond?")) deleteMutation.mutate(); }}
              className="text-red-400 hover:text-red-500 p-2 transition-colors"
              title="Remove Bond"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 md:p-10 space-y-8">
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-400 font-bold"><RefreshCw className="animate-spin" size={16} /> Loading...</div>
        ) : (
          <div className="max-w-2xl space-y-6">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
              <AlertCircle className="text-indigo-400 shrink-0 mt-0.5" size={16} />
              <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                Set a standard security deposit (bond) amount for this property. This amount is collected or held to cover potential damages.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
              <Input 
                label="Bond Amount ($)" 
                type="number" 
                value={amount} 
                onChange={(e: any) => setAmount(e.target.value)} 
                disabled={isViewMode || (!isEditing && !!existingBond)} 
                placeholder="0.00"
              />
            </div>

            {!isViewMode && isEditing && (
              <div className="flex gap-3 pt-2">
                {existingBond && (
                  <button 
                    onClick={() => { 
                      setIsEditing(false); 
                      setAmount(existingBond.amount);
                    }}
                    className="px-6 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
                  >
                    Cancel
                  </button>
                )}
                <Button 
                  onClick={() => existingBond ? updateMutation.mutate() : createMutation.mutate()} 
                  disabled={!amount || createMutation.isPending || updateMutation.isPending}
                  className="w-full md:w-auto px-8 h-14 shadow-lg shadow-brand-dark/10"
                >
                  {existingBond ? (updateMutation.isPending ? "Updating..." : "Update Amount") : (createMutation.isPending ? "Creating..." : "Set Bond Amount")}
                  {existingBond ? <Save size={16} className="ml-2" /> : <Plus size={16} className="ml-2" />}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BondTab;
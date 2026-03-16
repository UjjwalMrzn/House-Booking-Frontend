import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guestService, type PerPersonCharge } from '../../../../../api/guestService';
import { Users, Trash2, Save, Plus, AlertCircle, RefreshCw, Edit2 } from 'lucide-react';
import { useToast } from '../../../../ui/Toaster';
import Input from '../../../../ui/Input';
import Button from '../../../../ui/Button';

interface GuestTabProps {
  propertyId: number | null;
  isViewMode?: boolean;
}

const GuestTab: React.FC<GuestTabProps> = ({ propertyId, isViewMode }) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  const [amount, setAmount] = useState("");
  const [isEditing, setIsEditing] = useState(false); 

  const { data: chargeData, isLoading } = useQuery({
    queryKey: ['property-guest-charge', propertyId],
    queryFn: () => guestService.getCharges(propertyId!),
    enabled: !!propertyId,
  });

  const existingCharge = useMemo(() => {
    if (!chargeData) return null;
    const results = Array.isArray(chargeData) ? chargeData : (chargeData.results || []);
    return results.find((c: PerPersonCharge) => c.property === propertyId) || null;
  }, [chargeData, propertyId]);

  useEffect(() => {
    if (existingCharge) {
      setAmount(existingCharge.amount || "");
      setIsEditing(false);
    } else {
      setAmount("");
      setIsEditing(true); 
    }
  }, [existingCharge]);

  const createMutation = useMutation({
    mutationFn: () => guestService.createCharge({ property: propertyId!, amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-guest-charge', propertyId] });
      toast.success("Per person charge set successfully.");
    },
    onError: () => toast.error("Failed to set per person charge.")
  });

  const updateMutation = useMutation({
    mutationFn: () => guestService.updateCharge(existingCharge!.id!, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-guest-charge', propertyId] });
      toast.success("Per person charge updated.");
      setIsEditing(false); 
    },
    onError: () => toast.error("Failed to update charge.")
  });

  const deleteMutation = useMutation({
    mutationFn: () => guestService.deleteCharge(existingCharge!.id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-guest-charge', propertyId] });
      setAmount("");
      toast.success("Per person charge removed.");
    },
    onError: () => toast.error("Failed to delete charge.")
  });

  if (!propertyId) {
    return (
      <div className="bg-white rounded-[2rem] border border-gray-100 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
          <Users size={24} />
        </div>
        <h3 className="text-lg font-black text-brand-dark mb-2">Save Property First</h3>
        <p className="text-sm font-normal text-gray-400">You must save basic details before setting a per person charge.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-50 bg-white/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-green/10 text-brand-green rounded-lg flex items-center justify-center shadow-inner">
            <Users size={16} strokeWidth={2.5} />
          </div>
          {/* SURGICAL FIX: Updated Title */}
          <h3 className="text-lg font-black text-brand-dark tracking-tight">Per Person Charge</h3>
        </div>
        <div className="flex gap-2">
          {existingCharge && !isViewMode && !isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-brand-dark p-2 transition-colors"
              title="Edit Charge"
            >
              <Edit2 size={18} />
            </button>
          )}
          {existingCharge && !isViewMode && (
            <button 
              onClick={() => { if(window.confirm("Remove this charge?")) deleteMutation.mutate(); }}
              className="text-red-400 hover:text-red-500 p-2 transition-colors"
              title="Remove Charge"
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
              {/* SURGICAL FIX: Clarified that it applies to ALL guests */}
              <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                Set a flat charge that applies per person for the booking. This fee is calculated for every guest (including the first one).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
              <Input 
                label="Charge Per Person ($)" 
                type="number" 
                value={amount} 
                onChange={(e: any) => setAmount(e.target.value)} 
                disabled={isViewMode || (!isEditing && !!existingCharge)} 
                placeholder="0.00"
              />
            </div>

            {!isViewMode && isEditing && (
              <div className="flex gap-3 pt-2">
                {existingCharge && (
                  <button 
                    onClick={() => { 
                      setIsEditing(false); 
                      setAmount(existingCharge.amount);
                    }}
                    className="px-6 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
                  >
                    Cancel
                  </button>
                )}
                <Button 
                  onClick={() => existingCharge ? updateMutation.mutate() : createMutation.mutate()} 
                  disabled={!amount || createMutation.isPending || updateMutation.isPending}
                  className="w-full md:w-auto px-8 h-14 shadow-lg shadow-brand-dark/10"
                >
                  {existingCharge ? (updateMutation.isPending ? "Updating..." : "Update Amount") : (createMutation.isPending ? "Creating..." : "Set Charge")}
                  {existingCharge ? <Save size={16} className="ml-2" /> : <Plus size={16} className="ml-2" />}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestTab;
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '../../../api/ContactService';
import { useToast } from '../../ui/Toaster';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { Contact, Save, MapPin, Mail, Phone, Building, Edit2 } from 'lucide-react';
import { Skeleton } from '../../ui/Skeleton';

const AdminContactsPage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({ 
    id: null as number | null, 
    name: '', 
    email: '', 
    phoneNumber: '', 
    address: ''
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-contacts'],
    queryFn: () => contactService.getContacts(1, 10),
  });

  const activeContact = useMemo(() => {
    if (!data) return null;
    const contactsArray = Array.isArray(data) ? data : (data.results || []);
    return contactsArray[0] || null;
  }, [data]);

  useEffect(() => {
    if (activeContact && !isEditing) {
      setFormData({
        id: activeContact.id,
        name: activeContact.name || '',
        email: activeContact.email || '',
        phoneNumber: activeContact.phoneNumber || '',
        address: activeContact.address || ''
      });
    }
  }, [activeContact, isEditing]);

  const handleCancel = () => {
    setIsEditing(false);
    if (activeContact) {
      setFormData({
        id: activeContact.id,
        name: activeContact.name || '',
        email: activeContact.email || '',
        phoneNumber: activeContact.phoneNumber || '',
        address: activeContact.address || ''
      });
    }
  };

  const saveMutation = useMutation({
    mutationFn: (payloadData: typeof formData) => {
      const payload = { 
        name: payloadData.name, 
        email: payloadData.email, 
        phoneNumber: payloadData.phoneNumber, 
        address: payloadData.address, 
        isMain: true 
      };
      
      return payloadData.id 
        ? contactService.updateContact(payloadData.id, payload) 
        : contactService.createContact(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['public-contacts'] });
      toast.success(`Contact details saved successfully!`);
      setIsEditing(false); 
    },
    onError: () => toast.error("Failed to save contact details.")
  });

  return (
    <div className="max-w-4xl mx-auto w-full animate-fade-in pb-10 px-2 md:px-0">
      
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-brand-dark tracking-tight flex items-center gap-3">
          <Contact className="text-brand-green" size={32} />
          Contact Details
        </h1>
        <p className="text-sm font-bold text-gray-400 mt-1">Manage the company information shown on the public Contact Page.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
        
        {/* SURGICAL FIX: Responsive Header Padding */}
        <div className="p-4 md:p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-green/10 text-brand-green rounded-xl flex items-center justify-center shadow-inner shrink-0">
            <Building size={16} strokeWidth={2.5} />
          </div>
          <h3 className="text-base md:text-lg font-black text-brand-dark tracking-tight">Main Office Information</h3>
        </div>

        {/* SURGICAL FIX: Tightened Mobile Padding */}
        <div className="p-4 md:p-10 space-y-8">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton variant="input" />
              <div className="grid md:grid-cols-2 gap-6">
                <Skeleton variant="input" />
                <Skeleton variant="input" />
              </div>
              <Skeleton variant="input" />
            </div>
          ) : (
            <div className="space-y-8">
              
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Building size={16} className="text-indigo-400" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Company Name</h4>
                </div>
                <Input 
                  label="Title / Company Name" 
                  value={formData.name} 
                  onChange={(e: any) => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g., Gecko Works Nepal"
                  disabled={!isEditing}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone size={16} className="text-brand-green" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone</h4>
                  </div>
                  <Input 
                    label="Phone Number" 
                    type="tel"
                    value={formData.phoneNumber} 
                    onChange={(e: any) => setFormData({...formData, phoneNumber: e.target.value})} 
                    placeholder="e.g., +977 9840209417"
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail size={16} className="text-amber-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email</h4>
                  </div>
                  <Input 
                    label="Email Address" 
                    type="email"
                    value={formData.email} 
                    onChange={(e: any) => setFormData({...formData, email: e.target.value})} 
                    placeholder="e.g., ujjwal@gckoworks.com"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-4 md:space-y-6 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-red-400" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Location</h4>
                </div>
                <Input 
                  label="Physical Address" 
                  value={formData.address} 
                  onChange={(e: any) => setFormData({...formData, address: e.target.value})} 
                  placeholder="e.g., Teku, Kathmandu"
                  disabled={!isEditing}
                />
              </div>

            </div>
          )}
        </div>

        {/* SURGICAL FIX: Responsive Footer Stacking (flex-col on small screens) */}
        <div className="px-4 md:px-8 py-5 border-t border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
          {!isEditing ? (
            <Button 
              onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
              className="w-full sm:w-auto px-10 py-3 md:py-3.5 shadow-md flex items-center justify-center"
            >
              <Edit2 size={18} strokeWidth={2.5} className="mr-2" />
              Edit Details
            </Button>
          ) : (
            <>
              <button 
                onClick={handleCancel}
                className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-gray-500 hover:text-brand-dark hover:bg-gray-100 rounded-xl transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>
              <Button 
                onClick={() => saveMutation.mutate(formData)} 
                disabled={!formData.name || !formData.email || !formData.phoneNumber || saveMutation.isPending || isLoading} 
                className="w-full sm:w-auto px-10 py-3 md:py-3.5 shadow-md flex items-center justify-center order-1 sm:order-2"
              >
                <Save size={18} strokeWidth={2.5} className="mr-2" />
                {saveMutation.isPending ? 'Saving...' : 'Save Details'}
              </Button>
            </>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminContactsPage;
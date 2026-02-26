import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Save } from 'lucide-react';
import Input from '../../../../ui/Input';
import Button from '../../../../ui/Button';

interface BasicTabProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  isViewMode?: boolean;
}

const BasicTab: React.FC<BasicTabProps> = ({ formData, handleChange, handleSubmit, isPending, isViewMode }) => {
  // Max length constants
  const MAX_DESC_LENGTH = 2000;
  const currentDescLength = formData.description?.length || 0;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden animate-entrance">
      <div className="p-6 border-b border-gray-50 bg-white/50 flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-green/10 text-brand-green rounded-lg flex items-center justify-center shadow-inner">
          <Home size={16} strokeWidth={2.5} />
        </div>
        <h3 className="text-lg font-black text-brand-dark tracking-tight">Basic Information</h3>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Property Title" name="title" value={formData.title} onChange={handleChange} required disabled={isViewMode} />
          <Input label="Full Address" name="address" value={formData.address} onChange={handleChange} required disabled={isViewMode} />
        </div>

        {/* FIXED: Taller Textarea with Character Limit & Counter */}
        <div className="relative w-full group">
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={isViewMode}
            maxLength={MAX_DESC_LENGTH}
            placeholder=" "
            required
            rows={8} // FIXED: Changed from 3 to 8 for a massive, comfortable typing area
            className="peer block w-full px-4 pt-6 pb-2 text-[14px] font-normal text-gray-900 bg-white border border-gray-200 rounded-xl appearance-none transition-all outline-none focus:ring-0 focus:border-brand-green resize-y min-h-[120px]"
          />
          <label className="absolute text-[12px] text-gray-400 duration-150 transform top-4 z-10 origin-[0] left-4 font-medium pointer-events-none scale-75 -translate-y-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">
            Property Description
          </label>
          
          {/* NEW: Character Counter (Only shows if not in view mode) */}
          {!isViewMode && (
            <div className="absolute -bottom-6 right-2 text-[10px] font-bold text-gray-400">
              <span className={currentDescLength >= MAX_DESC_LENGTH ? 'text-red-500' : ''}>
                {currentDescLength}
              </span> / {MAX_DESC_LENGTH}
            </div>
          )}
        </div>

        {/* Added extra margin top to account for the absolute positioned counter */}
        <hr className="border-gray-50 mt-8" />

        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pricing & Capacity</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5">
          <div className="md:col-span-2">
            <Input label="Price per Night ($)" type="number" name="base_price_per_night" value={formData.base_price_per_night} onChange={handleChange} required disabled={isViewMode} />
          </div>
          <Input label="Max Guests" type="number" name="max_guests" value={formData.max_guests} onChange={handleChange} required disabled={isViewMode} />
          <Input label="Bedrooms" type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} required disabled={isViewMode} />
          <Input label="Bathrooms" type="number" name="bathroom" value={formData.bathroom} onChange={handleChange} required disabled={isViewMode} />
        </div>
      </div>

      {!isViewMode && (
      <div className="px-6 py-5 border-t border-gray-50 bg-gray-50/50 flex justify-end gap-3 mt-4">
        <Link to="/admin/properties" className="px-6 py-2.5 rounded-xl font-bold text-gray-500 text-sm hover:bg-gray-100 hover:text-gray-700 transition-colors flex items-center">
          Cancel
        </Link>
        <Button type="submit" className="px-8 py-2.5 text-sm flex items-center gap-2 shadow-[0_8px_15px_-5px_rgba(74,222,128,0.4)]" disabled={isPending}>
          <Save size={16} strokeWidth={2.5} />
          {isPending ? 'Saving...' : 'Save Details'}
        </Button>
      </div>
      )}
    </form>
  );
};

export default BasicTab;
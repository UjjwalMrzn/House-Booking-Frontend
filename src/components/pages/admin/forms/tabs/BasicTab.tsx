import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Save, DollarSign, PenTool, LayoutTemplate } from 'lucide-react';
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
  const MAX_DESC_LENGTH = 2000;
  const currentDescLength = formData.description?.length || 0;

  const MAX_OVERVIEW_LENGTH = 300;
  const currentOverviewLength = formData.overView?.length || 0;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden animate-entrance">
      <div className="p-6 border-b border-gray-50 bg-white/50 flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-green/10 text-brand-green rounded-lg flex items-center justify-center shadow-inner">
          <Home size={16} strokeWidth={2.5} />
        </div>
        <h3 className="text-lg font-black text-brand-dark tracking-tight">Basic Information</h3>
      </div>

      {/* SURGICAL FIX: Responsive padding (p-4 on mobile, p-8 on desktop) */}
      <div className="p-4 md:p-8 space-y-12">
        
        {/* --- CORE DETAILS --- */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <LayoutTemplate size={16} className="text-indigo-400" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Core Identity</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Property Title *" name="title" value={formData.title} onChange={handleChange} required disabled={isViewMode} />
            <Input label="Full Address *" name="address" value={formData.address} onChange={handleChange} required disabled={isViewMode} />
          </div>
        </section>


        {/* --- DYNAMIC PRICING --- */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-2 border-t border-gray-50 pt-8">
            <DollarSign size={16} className="text-emerald-500" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Dynamic Pricing (Per Night)</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Input label="Base Price ($) *" type="number" name="base_price_per_night" value={formData.base_price_per_night} onChange={handleChange} required disabled={isViewMode} />
            <Input label="Weekend Price ($)" type="number" name="weekend_price_per_night" value={formData.weekend_price_per_night} onChange={handleChange} disabled={isViewMode} placeholder="Optional" />
            <Input label="Holiday Price ($)" type="number" name="holiday_price_per_night" value={formData.holiday_price_per_night} onChange={handleChange} disabled={isViewMode} placeholder="Optional" />
          </div>
        </section>


        {/* --- CAPACITY & ROOMS --- */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-2 border-t border-gray-50 pt-8">
            <Home size={16} className="text-amber-500" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Capacity & Rooms</h4>
          </div>
          
          {/* SURGICAL FIX: Responsive Gap (gap-3 on mobile) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            <Input label="Max Guests *" type="number" name="max_guests" value={formData.max_guests} onChange={handleChange} required disabled={isViewMode} />
            <Input label="Beds *" type="number" name="beds" value={formData.beds} onChange={handleChange} required disabled={isViewMode} />
            <Input label="Bedrooms *" type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} required disabled={isViewMode} />
            <Input label="Bathrooms *" type="number" name="bathroom" value={formData.bathroom} onChange={handleChange} required disabled={isViewMode} />
          </div>
        </section>


        {/* --- DESCRIPTIONS --- */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-2 border-t border-gray-50 pt-8">
            <PenTool size={16} className="text-blue-500" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Rich Descriptions</h4>
          </div>

          {/* New Overview Field */}
          <div className="relative w-full group mb-4">
            <textarea
              name="overView"
              value={formData.overView}
              onChange={handleChange}
              disabled={isViewMode}
              maxLength={MAX_OVERVIEW_LENGTH}
              placeholder=" "
              rows={4}
              /* SURGICAL FIX: font-normal weight applied */
              className="peer block w-full px-4 pt-6 pb-2 text-[14px] font-normal text-gray-900 bg-white border border-gray-200 rounded-xl appearance-none transition-all outline-none focus:ring-0 focus:border-brand-green resize-y"
            />
            <label className="absolute text-[12px] text-gray-400 duration-150 transform top-4 z-10 origin-[0] left-4 font-medium pointer-events-none scale-75 -translate-y-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">
              Property Overview (Summary)
            </label>
            {!isViewMode && (
              <div className="absolute -bottom-5 right-2 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                <span className={currentOverviewLength >= MAX_OVERVIEW_LENGTH ? 'text-red-500' : ''}>
                  {currentOverviewLength}
                </span> / {MAX_OVERVIEW_LENGTH}
              </div>
            )}
          </div>

          {/* Main Description Field */}
          <div className="relative w-full group">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isViewMode}
              maxLength={MAX_DESC_LENGTH}
              placeholder=" "
              required
              rows={8}
              /* SURGICAL FIX: font-normal weight applied */
              className="peer block w-full px-4 pt-6 pb-2 text-[14px] font-normal text-gray-900 bg-white border border-gray-200 rounded-xl appearance-none transition-all outline-none focus:ring-0 focus:border-brand-green resize-y min-h-[120px]"
            />
            <label className="absolute text-[12px] text-gray-400 duration-150 transform top-4 z-10 origin-[0] left-4 font-medium pointer-events-none scale-75 -translate-y-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">
              Full Property Description *
            </label>
            {!isViewMode && (
              <div className="absolute -bottom-5 right-2 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                <span className={currentDescLength >= MAX_DESC_LENGTH ? 'text-red-500' : ''}>{currentDescLength}</span> / {MAX_DESC_LENGTH}
              </div>
            )}
          </div>
        </section>
        
      </div>

      {!isViewMode && (
        /* SURGICAL FIX: Mobile Footer Stacking (flex-col on xs) */
        <div className="px-4 md:px-6 py-5 border-t border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row justify-end gap-3 mt-8">
          <Link to="/admin/properties" className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-gray-500 text-sm hover:bg-gray-100 hover:text-gray-700 transition-colors flex items-center justify-center">
            Cancel
          </Link>
          <Button type="submit" className="w-full sm:w-auto px-8 py-3 text-sm flex items-center justify-center gap-2 shadow-[0_8px_15px_-5px_rgba(74,222,128,0.4)]" disabled={isPending}>
            <Save size={16} strokeWidth={2.5} />
            {isPending ? 'Saving...' : 'Save Details'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default BasicTab;
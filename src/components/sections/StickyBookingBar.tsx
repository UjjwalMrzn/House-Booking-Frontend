import { useState } from 'react';
import DatePicker from '../ui/DatePicker';
import GuestSelector from '../ui/GuestSelector';
import Button from '../ui/Button';

const StickyBookingBar = () => {
  // Logic: Local state to handle guest selection on the sticky bar
  const [guests, setGuests] = useState(1);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] py-4">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-12">
        
        {/* LEFT: Property Branding */}
        <div className="flex-shrink-0 hidden sm:block">
          <h4 className="text-xl font-bold text-brand-dark tracking-tight">Hinsley Cottage</h4>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Cotswold District, United Kingdom</p>
        </div>
        
        {/* RIGHT: Functional Booking Area */}
        <div className="flex flex-1 items-center gap-4 justify-end">
           <div className="w-full max-w-lg">
             <DatePicker />
           </div>
           <div className="w-40 hidden md:block">
             {/* Fixed: Passed required props */}
             <GuestSelector value={guests} onChange={setGuests} />
           </div>
           <Button className="h-[60px] px-10 bg-brand-green hover:bg-emerald-500 text-white font-black uppercase text-xs tracking-[0.15em] rounded-xl transition-all shadow-lg shadow-green-100 whitespace-nowrap">
              Book Now
           </Button>
        </div>

      </div>
    </div>
  );
};

export default StickyBookingBar;
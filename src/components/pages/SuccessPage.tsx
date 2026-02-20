import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Home, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
// FIXED: Integrated the Single Source of Truth constant
import { DEFAULT_PROPERTY_ID } from '../../utils/constants';

const SuccessPage = () => {
  const location = useLocation();
  const { bookingId, totalPrice, customerName } = location.state || {};

  // Fix for $NaN: Ensure we have a valid number
  const displayPrice = totalPrice ? Number(totalPrice).toLocaleString() : '0.00';

  return (
    <main className="min-h-screen bg-[#FCFBF9] flex items-center justify-center p-6 pt-24 animate-fade-in">
      <div className="bg-white max-w-lg w-full rounded-[2.5rem] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.08)] p-12 text-center border border-gray-100 animate-entrance">
        
        <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-8 text-brand-green">
          <CheckCircle size={40} strokeWidth={3} />
        </div>

        <h1 className="text-3xl font-black text-brand-dark mb-4 tracking-tight">Booking Confirmed!</h1>
        <p className="text-gray-500 mb-10 leading-relaxed font-medium">
          Thank you, <span className="font-bold text-brand-dark">{customerName || 'Guest'}</span>! 
          Your reservation has been successfully placed.
        </p>

        <div className="bg-[#F9F9F7] rounded-[2rem] p-8 mb-10 space-y-4 border border-gray-50">
          <div className="flex justify-between items-center">
            <span className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Booking ID</span>
            <span className="font-black text-brand-dark font-mono text-lg">#{bookingId || '---'}</span>
          </div>
          <div className="w-full h-px bg-gray-200/50"></div>
          <div className="flex justify-between items-center">
            <span className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Total Amount</span>
            <span className="font-black text-brand-green text-2xl">${displayPrice}</span>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* FIXED: Added 'block' to Link and 'fullWidth' to Button so they stretch together perfectly */}
          <Link to="/" className="w-full block">
            <Button fullWidth>
              Return to Home
            </Button>
          </Link>
          
          {/* FIXED: Redirect points to the global fallback property ID */}
          <Link to={`/overview/${DEFAULT_PROPERTY_ID}`} className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 hover:text-brand-dark uppercase tracking-[0.2em] transition-colors">
            <Home size={14} /> Browse more properties <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </main>
  );
};

export default SuccessPage;
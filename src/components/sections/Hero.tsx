import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import DatePicker from '../ui/DatePicker';
import GuestSelector from '../ui/GuestSelector';
// FIXED: Standardizing date format with the rest of the squad
import { format, parseISO } from 'date-fns';
// FIXED: Integrated the Single Source of Truth
import { DEFAULT_PROPERTY_ID } from '../../utils/constants';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../api/bookingApi';

const Hero = () => {
  const navigate = useNavigate();
  const [guests, setGuests] = useState(1);
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });

  // FIXED LOGIC: Redirects using the global property ID constant
  const handleBookingRedirect = () => {
    const params = new URLSearchParams({
      checkIn: dates.checkIn,
      checkOut: dates.checkOut,
      guests: guests.toString()
    });
    // FIXED: No more hardcoded ID
    navigate(`/overview/${DEFAULT_PROPERTY_ID}?${params.toString()}`);
  };

  const { data: bookedRanges = [] } = useQuery({
  queryKey: ["booked-dates-hero"],
  queryFn: async () => {
    const bookings = await bookingService.getConfirmedBookings();
    return bookings
      .filter((b: any) => String(b.property) === String(DEFAULT_PROPERTY_ID))
      .map((b: any) => ({ from: parseISO(b.check_in), to: parseISO(b.check_out) }));
  },
});

  return (
    <div className="w-full bg-[#fafafa] pb-24 overflow-visible">
      <div className="relative max-w-[96%] mx-auto mt-4 h-[550px] md:h-[600px] rounded-[3rem] overflow-hidden group shadow-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] group-hover:scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=2080&auto=format&fit=crop')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        </div>
        <div className="absolute bottom-40 left-0 w-full text-center z-10 px-4">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight animate-slide-up">
            Find your sanctuary.
          </h1>
        </div>
      </div>

      <div className="relative -mt-10 z-[50] flex justify-center px-6 overflow-visible">
        <div className="bg-white rounded-xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] p-2 flex flex-col md:flex-row items-stretch w-full max-w-4xl border border-gray-100 transition-all gap-2 overflow-visible">
          
          <div className="flex-[1.5]">
            <DatePicker 
              value={dates} 
              disabledDates={bookedRanges}
              onChange={(range: any) => setDates({ 
                // FIXED: Using 'yyyy-MM-dd' to match Overview and Reservation parsing
                checkIn: range?.from ? format(range.from, 'yyyy-MM-dd') : '', 
                checkOut: range?.to ? format(range.to, 'yyyy-MM-dd') : '' 
              })} 
            />
          </div>
          
          <div className="hidden md:block w-px h-8 bg-gray-100 self-center"></div>
          
          <div className="flex-1">
            <GuestSelector value={guests} onChange={setGuests} />
          </div>
          
          <div className="flex items-center">
            <Button size="md" className="h-[56px] rounded-xl px-10" onClick={handleBookingRedirect}>
              Book Now
            </Button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Hero;
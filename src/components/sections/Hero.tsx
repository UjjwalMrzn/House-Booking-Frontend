import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import DatePicker from '../ui/DatePicker';
import GuestSelector from '../ui/GuestSelector';

const Hero = () => {
  const navigate = useNavigate();
  const [guests, setGuests] = useState(1);
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });

  // FIXED LOGIC: Redirects directly to the property overview instead of a search page
  const handleBookingRedirect = () => {
    const params = new URLSearchParams({
      checkIn: dates.checkIn,
      checkOut: dates.checkOut,
      guests: guests.toString()
    });
    // Redirecting to property ID 3 (your main property)
    navigate(`/overview/3?${params.toString()}`);
  };

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
              onChange={(range: any) => setDates({ 
                checkIn: range?.from ? range.from.toISOString() : '', 
                checkOut: range?.to ? range.to.toISOString() : '' 
              })} 
            />
          </div>
          
          <div className="hidden md:block w-px h-8 bg-gray-100 self-center"></div>
          
          <div className="flex-1">
            <GuestSelector value={guests} onChange={setGuests} />
          </div>
          
          <div className="flex items-center">
            {/* FIXED: Changed text to "Book Now" to match the direct redirect logic */}
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
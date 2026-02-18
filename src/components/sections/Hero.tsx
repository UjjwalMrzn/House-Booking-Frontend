import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import DatePicker from '../ui/DatePicker';
import GuestSelector from '../ui/GuestSelector';

const Hero = () => {
  const navigate = useNavigate();
  const [guests, setGuests] = useState(1);
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });

  // RULE: Connected Logic
  const handleSearch = () => {
    const params = new URLSearchParams({
      checkIn: dates.checkIn,
      checkOut: dates.checkOut,
      guests: guests.toString()
    });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full bg-[#fafafa] pb-24">
      {/* Hero Visual Container */}
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

{/* BALANCED FLOATING SEARCH BAR */}
<div className="relative -mt-12 z-20 flex justify-center px-6">
  {/* OUTER BAR: Standardized to rounded-3xl (24px) 
      This creates a much tighter, professional frame than the previous 3rem/pill look.
  */}
  <div className="bg-white rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] p-2 flex flex-col md:flex-row items-stretch w-full max-w-4xl border border-gray-100 transition-all gap-2">
    
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
      {/* SEARCH BUTTON: Strictly matches the rounded-xl (12px) of the inputs.
          The h-[64px] ensures it sits perfectly flush with the DatePicker and GuestSelector.
      */}
      <Button 
        size="lg" 
        className="h-[64px] rounded-xl px-12" 
        onClick={handleSearch}
      >
        Search
      </Button>
    </div>
  </div>
</div>
    </div>
  );
};

export default Hero;
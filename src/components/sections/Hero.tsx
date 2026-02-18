import { useState } from 'react';
import Button from '../ui/Button';
import DatePicker from '../ui/DatePicker';
import GuestSelector from '../ui/GuestSelector';

const Hero = () => {
  // Logic: Local state to handle guest selection on the landing hero
  const [guests, setGuests] = useState(1);

  return (
    <div className="w-full bg-[#fafafa] pb-20">
      <div className="relative max-w-[96%] mx-auto mt-4 h-[550px] md:h-[600px] rounded-[2.5rem] overflow-hidden group shadow-lg">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=2080&auto=format&fit=crop')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        </div>

        <div className="absolute bottom-32 left-0 w-full text-center z-10 px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-2xl tracking-tight animate-entrance">
            Welcome to Haven Stays
          </h1>
          <p className="text-white/80 text-lg md:text-2xl font-medium max-w-2xl mx-auto hidden md:block animate-entrance [animation-delay:200ms]">
            Escape to the coast and find your perfect sanctuary.
          </p>
        </div>
      </div>

      <div className="relative -mt-14 z-20 flex justify-center px-4">
        <div className="bg-white rounded-[2rem] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.15)] p-2 flex flex-col md:flex-row items-center w-full max-w-5xl border border-white/50 backdrop-blur-md animate-entrance [animation-delay:400ms]">
          <DatePicker />
          <div className="hidden md:block w-px h-10 bg-gray-100 mx-2"></div>
          {/* Fixed: Passed required props */}
          <GuestSelector value={guests} onChange={setGuests} />
          <div className="w-full md:w-auto ml-auto p-1">
            <Button className="h-[64px] px-10 rounded-[1.25rem] bg-brand-green hover:bg-emerald-500 shadow-xl shadow-green-100 transition-all active:scale-95 text-sm font-black uppercase tracking-[0.1em] text-white">
              Search Availability
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
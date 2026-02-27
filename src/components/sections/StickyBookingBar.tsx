import { useState, useEffect } from 'react';
// FIXED: Integrated useSearchParams to sync bar state with the URL squad
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import DatePicker from '../ui/DatePicker';
import GuestSelector from '../ui/GuestSelector';
import Button from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { format, parseISO } from 'date-fns';
// FIXED: Integrated the Single Source of Truth constant
import { DEFAULT_PROPERTY_ID } from '../../utils/constants';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../api/bookingApi';

interface StickyBookingBarProps {
  property: any;
  isLoading: boolean;
}

const StickyBookingBar = ({ property, isLoading }: StickyBookingBarProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // FIXED: Access search parameters to sync with the rest of the squad
  const [searchParams] = useSearchParams();

  const [guests, setGuests] = useState(1);
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });

  const { data: bookedRanges = [] } = useQuery({
  queryKey: ["booked-dates", id],
  queryFn: async () => {
    const bookings = await bookingService.getConfirmedBookings();
    return bookings
      .filter((b: any) => String(b.property) === String(id || DEFAULT_PROPERTY_ID))
      .map((b: any) => ({ from: parseISO(b.check_in), to: parseISO(b.check_out) }));
  },
});

  // FIXED: Logic to keep sticky bar state in sync with URL choices
  useEffect(() => {
    const g = searchParams.get('guests');
    if (g) setGuests(parseInt(g));
    
    setDates({
      checkIn: searchParams.get('checkIn') || '',
      checkOut: searchParams.get('checkOut') || ''
    });
  }, [searchParams]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-200 shadow-[0_-15px_40px_rgba(0,0,0,0.12)] py-4 animate-slide-up">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-12">
        
        {/* LEFT: Property Branding */}
        <div className="flex-shrink-0 hidden sm:block">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-40 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>
          ) : (
            <>
              <h4 className="text-xl font-bold text-brand-dark tracking-tight capitalize">
                {property?.title || 'Property'}
              </h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                {property?.address || 'Location Details'}
              </p>
            </>
          )}
        </div>
        
        {/* RIGHT: Functional Booking Area */}
        <div className="flex flex-1 items-center gap-4 justify-end">
           <div className="w-full max-w-lg">
             {isLoading ? (
               <Skeleton className="h-14 w-full rounded-xl" />
             ) : (
               <DatePicker 
                value={dates}
                disabledDates={bookedRanges}
                onChange={(range: any) => setDates({
                  checkIn: range?.from ? format(range.from, 'yyyy-MM-dd') : '',
                  checkOut: range?.to ? format(range.to, 'yyyy-MM-dd') : ''
                })}
               />
             )}
           </div>
           
           <div className="w-40 hidden md:block">
             {isLoading ? (
               <Skeleton className="h-14 w-full rounded-xl" />
             ) : (
               <GuestSelector value={guests} onChange={setGuests} />
             )}
           </div>

           {isLoading ? (
             <Skeleton className="h-14 w-32 rounded-xl" />
           ) : (
             <Button 
                // FIXED: Uses global constant and camelCase parameter keys for squad consistency
                onClick={() => navigate(`/book/${id || DEFAULT_PROPERTY_ID}?checkIn=${dates.checkIn}&checkOut=${dates.checkOut}&guests=${guests}`)}
                className="whitespace-nowrap px-10"
             >
               Book Now
             </Button>
           )}
        </div>
      </div>
    </div>
  );
};

export default StickyBookingBar;
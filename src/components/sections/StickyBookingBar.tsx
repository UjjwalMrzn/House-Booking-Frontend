import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import DatePicker from '../ui/DatePicker';
import GuestSelector from '../ui/GuestSelector';
import Button from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { format, parseISO } from 'date-fns';
import { DEFAULT_PROPERTY_ID } from '../../utils/constants';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../api/bookingApi';
import { propertyService } from '../../api/propertyService';

interface StickyBookingBarProps {
  property: any;
  isLoading: boolean;
}

const StickyBookingBar = ({ property, isLoading }: StickyBookingBarProps) => {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // THE ID FIX: Grab the exact ID from params OR directly slice it from the URL as a failsafe
  const routeId = params.id || params.propertyId || property?.id || window.location.pathname.split('/')[2];

  const [guests, setGuests] = useState(1);
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });

  // Explicitly fetch the REAL property details by ID to guarantee we get max_guests
  const { data: realProperty } = useQuery({
    queryKey: ['property-strict-sticky', routeId],
    queryFn: () => propertyService.getPropertyDetails(routeId),
    enabled: !!routeId,
  });

  // Calculate strict limit
  const maxLimit = realProperty?.max_guests || property?.max_guests || 10;

  const { data: bookedRanges = [] } = useQuery({
    queryKey: ["booked-dates", routeId],
    queryFn: async () => {
      const bookings = await bookingService.getConfirmedBookings();
      return bookings
        .filter((b: any) => String(b.property) === String(routeId || DEFAULT_PROPERTY_ID))
        .map((b: any) => ({ from: parseISO(b.check_in), to: parseISO(b.check_out) }));
    },
  });

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
        
        <div className="flex-shrink-0 hidden sm:block">
          {isLoading && !realProperty ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-40 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>
          ) : (
            <>
              <h4 className="text-xl font-bold text-brand-dark tracking-tight capitalize">
                {realProperty?.title || property?.title || 'Property'}
              </h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                {realProperty?.address || property?.address || 'Location Details'}
              </p>
            </>
          )}
        </div>
        
        <div className="flex flex-1 items-center gap-4 justify-end">
           <div className="w-full max-w-lg">
             {isLoading && !realProperty ? (
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
             {isLoading && !realProperty ? (
               <Skeleton className="h-14 w-full rounded-xl" />
             ) : (
               <GuestSelector value={guests} onChange={setGuests} max={maxLimit} />
             )}
           </div>

           {isLoading && !realProperty ? (
             <Skeleton className="h-14 w-32 rounded-xl" />
           ) : (
             <Button 
                onClick={() => navigate(`/book/${routeId || DEFAULT_PROPERTY_ID}?checkIn=${dates.checkIn}&checkOut=${dates.checkOut}&guests=${guests}`)}
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
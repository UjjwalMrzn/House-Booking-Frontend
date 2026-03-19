import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DatePicker from '../ui/DatePicker';
import GuestSelector from '../ui/GuestSelector';
import Button from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { format, parseISO, differenceInDays } from 'date-fns'; 
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../api/bookingApi';
import { propertyService } from '../../api/propertyService';
import { holidayService } from "../../api/holidayService";
import { schoolHolidayService } from "../../api/schoolHolidayService";

const StickyBookingBar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });

  const [pricing, setPricing] = useState({ nights: 0, rental: 0, bond: 0, perPersonCharge: 0, total: 0 });
  const [isCalculating, setIsCalculating] = useState(false);

  const { data: realProperty, isLoading } = useQuery({
    queryKey: ['main-property-sticky'],
    queryFn: propertyService.getMainProperty,
  });

  const maxLimit = realProperty?.max_guests || 10;

  const { data: bookedRanges = [] } = useQuery({
    queryKey: ["booked-dates", realProperty?.id],
    queryFn: async () => {
      const bookings = await bookingService.getConfirmedBookings();
      return bookings
        .filter((b: any) => String(b.property) === String(realProperty?.id))
        .map((b: any) => ({ from: parseISO(b.check_in), to: parseISO(b.check_out) }));
    },
    enabled: !!realProperty?.id
  });

  const { data: allHolidaysData } = useQuery({
    queryKey: ['admin-holidays', 'all'],
    queryFn: () => holidayService.getAllHolidays(1, 500),
  });

  const holidayDates = useMemo(() => {
    if (!allHolidaysData) return [];
    const list = Array.isArray(allHolidaysData) ? allHolidaysData : (allHolidaysData.results || []);
    return list.filter((h: any) => h.is_active).map((h: any) => parseISO(h.date));
  }, [allHolidaysData]);

  const { data: allSchoolHolidaysData } = useQuery({
    queryKey: ['admin-school-holidays', 'all'],
    queryFn: () => schoolHolidayService.getSchoolHolidays(1, 500),
  });

  const schoolHolidayDates = useMemo(() => {
    if (!allSchoolHolidaysData) return [];
    const list = Array.isArray(allSchoolHolidaysData) ? allSchoolHolidaysData : (allSchoolHolidaysData.results || []);
    return list.filter((h: any) => h.is_active).map((h: any) => parseISO(h.date));
  }, [allSchoolHolidaysData]);

  useEffect(() => {
    const a = searchParams.get('adults');
    const k = searchParams.get('kids');
    const g = searchParams.get('guests'); 

    if (a) setAdults(parseInt(a));
    else if (g) setAdults(parseInt(g)); 

    if (k) setKids(parseInt(k));
    
    setDates({
      checkIn: searchParams.get('checkIn') || '',
      checkOut: searchParams.get('checkOut') || ''
    });
  }, [searchParams]);

  useEffect(() => {
    const fetchPrice = async () => {
      if (dates.checkIn && dates.checkOut && realProperty?.id) {
        const start = parseISO(dates.checkIn);
        const end = parseISO(dates.checkOut);
        const nights = differenceInDays(end, start);
        
        if (nights > 0) {
          setIsCalculating(true);
          try {
            const res = await bookingService.calculatePrice({
              property: realProperty.id,
              check_in: dates.checkIn,
              check_out: dates.checkOut,
              guests: adults + kids,
              adults: adults,
              kids: kids
            });
            
            const exactPrice = Number(res.total_price);
            const bondCharge = res.breakdown?.bond_charge ? Number(res.breakdown.bond_charge) : 0;
            const perPersonCharge = res.breakdown?.per_person_charge ? Number(res.breakdown.per_person_charge) : 0;
            const rentalCharge = exactPrice - bondCharge - perPersonCharge;

            setPricing({ nights, rental: rentalCharge, bond: bondCharge, perPersonCharge, total: exactPrice });
          } catch (error) {
            console.error("Failed to calculate price:", error);
          } finally {
            setIsCalculating(false);
          }
        } else {
          setPricing({ nights: 0, rental: 0, bond: 0, perPersonCharge: 0, total: 0 });
        }
      } else {
        setPricing({ nights: 0, rental: 0, bond: 0, perPersonCharge: 0, total: 0 });
      }
    };
    
    const timeoutId = setTimeout(() => {
      fetchPrice();
    }, 200);
    
    return () => clearTimeout(timeoutId);
  }, [dates, realProperty, adults, kids]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-200 shadow-[0_-15px_40px_rgba(0,0,0,0.12)] py-4 animate-slide-up">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-12">
        
        <div className="flex-shrink-0 hidden sm:block">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-40 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>
          ) : pricing.nights > 0 ? (
            <div className="animate-fade-in flex flex-col justify-center">
              <div className="flex items-end gap-2 mb-1.5">
                <span className="text-2xl font-black text-brand-dark leading-none">${pricing.total.toLocaleString()}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-green mb-0.5">Total due</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <span>Rental: ${pricing.rental.toLocaleString()}</span>
                
                {pricing.perPersonCharge > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    {/* RESTORED: Calculation only for Per Person */}
                    <span>Per Person ({(adults + kids)}x${(adults + kids) > 0 ? parseFloat((pricing.perPersonCharge / (adults + kids)).toFixed(2)).toLocaleString() : 0}): ${pricing.perPersonCharge.toLocaleString()}</span>
                  </>
                )}

                {pricing.bond > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>Bond: ${pricing.bond.toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              <h4 className="text-xl font-bold text-brand-dark tracking-tight capitalize">{realProperty?.title}</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">{realProperty?.address}</p>
            </>
          )}
        </div>
        
        <div className="flex flex-1 items-center gap-4 justify-end">
           <div className="w-full max-w-lg">
             {isLoading ? <Skeleton className="h-14 w-full rounded-xl" /> : (
               <DatePicker 
                value={dates} disabledDates={bookedRanges}
                holidayDates={holidayDates}
                schoolHolidayDates={schoolHolidayDates}
                onChange={(range: any) => setDates({
                  checkIn: range?.from ? format(range.from, 'yyyy-MM-dd') : '',
                  checkOut: range?.to ? format(range.to, 'yyyy-MM-dd') : ''
                })}
               />
             )}
           </div>
           
           <div className="w-48 hidden md:block">
             {isLoading ? <Skeleton className="h-14 w-full rounded-xl" /> : (
               <GuestSelector 
                 adults={adults} 
                 kids={kids} 
                 onAdultsChange={setAdults} 
                 onKidsChange={setKids} 
                 max={maxLimit} 
               />
             )}
           </div>

           {isLoading ? <Skeleton className="h-14 w-32 rounded-xl" /> : (
             <Button 
                disabled={isCalculating || !dates.checkIn || !dates.checkOut}
                onClick={() => navigate(`/book?checkIn=${dates.checkIn}&checkOut=${dates.checkOut}&adults=${adults}&kids=${kids}`)}
                className="whitespace-nowrap px-10"
             >
               {isCalculating ? "Calculating..." : "Book Now"}
             </Button>
           )}
        </div>
      </div>
    </div>
  );
};

export default StickyBookingBar;
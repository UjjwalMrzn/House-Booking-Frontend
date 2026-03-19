import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { differenceInDays, parseISO } from "date-fns";
import { propertyService } from "../api/propertyService";
import { bookingService } from "../api/bookingApi";
import { customerService } from "../api/customerService";
import { useToast } from "../components/ui/Toaster";
import { holidayService } from "../api/holidayService";
import { schoolHolidayService } from "../api/schoolHolidayService"; // SURGICAL FIX

export const useReservation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerId, setCustomerId] = useState<number | null>(null);

  const { data: property, isLoading } = useQuery({
    queryKey: ["main-property"],
    queryFn: propertyService.getMainProperty,
  });

  const { data: bookedRanges = [] } = useQuery({
    queryKey: ["booked-dates", property?.id],
    queryFn: async () => {
      const bookings = await bookingService.getConfirmedBookings();
      return bookings
        .filter((b: any) => String(b.property) === String(property?.id))
        .map((b: any) => ({ from: parseISO(b.check_in), to: parseISO(b.check_out) }));
    },
    enabled: !!property?.id,
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

  // SURGICAL FIX: Fetch and map school holidays
  const { data: allSchoolHolidaysData } = useQuery({
    queryKey: ['admin-school-holidays', 'all'],
    queryFn: () => schoolHolidayService.getSchoolHolidays(1, 500),
  });

  const schoolHolidayDates = useMemo(() => {
    if (!allSchoolHolidaysData) return [];
    const list = Array.isArray(allSchoolHolidaysData) ? allSchoolHolidaysData : (allSchoolHolidaysData.results || []);
    return list.filter((h: any) => h.is_active).map((h: any) => parseISO(h.date));
  }, [allSchoolHolidaysData]);

  const [adults, setAdults] = useState(parseInt(searchParams.get("adults") || searchParams.get("guests") || "1"));
  const [kids, setKids] = useState(parseInt(searchParams.get("kids") || "0"));
  const guests = adults + kids;

  const [dates, setDates] = useState({
    checkIn: searchParams.get("checkIn") || "",
    checkOut: searchParams.get("checkOut") || "",
  });

  const [contact, setContact] = useState({ firstName: "", lastName: "", email: "", phoneNumber: "", country: "" });
  
  const [pricing, setPricing] = useState({ nights: 0, rental: 0, bond: 0, perPersonCharge: 0, total: 0, dueNow: 0 });

  useEffect(() => {
    const fetchPrice = async () => {
      if (dates.checkIn && dates.checkOut && property?.id) {
        const start = parseISO(dates.checkIn);
        const end = parseISO(dates.checkOut);
        const nights = differenceInDays(end, start);
        
        if (nights > 0) {
          try {
            const res = await bookingService.calculatePrice({
              property: property.id,
              check_in: dates.checkIn,
              check_out: dates.checkOut,
              guests: guests,
              adults: adults,
              kids: kids
            });
            
            const exactPrice = Number(res.total_price);
            const bondCharge = res.breakdown?.bond_charge ? Number(res.breakdown.bond_charge) : 0;
            const perPersonCharge = res.breakdown?.per_person_charge ? Number(res.breakdown.per_person_charge) : 0;
            const rentalCharge = exactPrice - bondCharge - perPersonCharge; 

            setPricing({ 
              nights, 
              rental: rentalCharge, 
              bond: bondCharge, 
              perPersonCharge: perPersonCharge,
              total: exactPrice, 
              dueNow: exactPrice * 0.5 
            });
          } catch (error) {
            console.error("Failed to calculate price:", error);
            toast.error("Error calculating exact price for these dates.");
          }
        }
      }
    };
    fetchPrice();
  }, [dates, property, adults, kids, guests]); 

  const saveCustomerAndContinue = async () => {
    if (!contact.firstName || !contact.lastName || !contact.email || !contact.phoneNumber || !contact.country) {
      toast.error("All fields, including Country, are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await customerService.createCustomer({
        ...contact,
        action: "booking"
      });
      setCustomerId(response.data.id);
      toast.success("Contact details saved!");
      setCurrentStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save contact details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmBooking = async () => {
    if (!customerId || !property?.id) {
      toast.error("Session expired. Please re-enter contact info.");
      setCurrentStep(1);
      return;
    }
    setIsSubmitting(true);
    try {
      const bookingPayload = {
        property: property.id,
        check_in: dates.checkIn,
        check_out: dates.checkOut,
        customer: customerId,
        guests: guests,
        adults: adults, 
        kids: kids,     
        total_price: pricing.total.toString(),
        status: 'pending'
      };

      const response = await bookingService.createBooking(bookingPayload);
      toast.success("Booking Confirmed! Redirecting...");
      navigate("/success", {
        state: { bookingId: response.data.id, totalPrice: response.data.total_price, customerName: response.data.customer_name },
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return { 
    property, isLoading, currentStep, setCurrentStep, 
    dates, setDates, guests, adults, setAdults, kids, setKids, 
    contact, setContact, pricing, isSubmitting, setIsSubmitting, 
    saveCustomerAndContinue, confirmBooking, bookedRanges,
    customerId, holidayDates, schoolHolidayDates // SURGICAL FIX: Returning the new data
  };
};
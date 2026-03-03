import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { differenceInDays, parseISO } from "date-fns";
import { propertyService } from "../api/propertyService";
import { bookingService } from "../api/bookingApi";
import { customerService } from "../api/customerService";
import { useToast } from "../components/ui/Toaster";

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

  // UPDATED: Replaced single 'guests' with adults and kids
  const [adults, setAdults] = useState(parseInt(searchParams.get("adults") || searchParams.get("guests") || "1"));
  const [kids, setKids] = useState(parseInt(searchParams.get("kids") || "0"));
  const guests = adults + kids;

  const [dates, setDates] = useState({
    checkIn: searchParams.get("checkIn") || "",
    checkOut: searchParams.get("checkOut") || "",
  });

  const [contact, setContact] = useState({ firstName: "", lastName: "", email: "", phoneNumber: "", country: "" });
  const [pricing, setPricing] = useState({ nights: 0, rental: 0, total: 0, dueNow: 0 });

  // UPDATED: Now fetches exact price from backend API instead of multiplying on the frontend
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
            
            // Backend returns exact price factoring in weekends/holidays
            const exactPrice = Number(res.total_price);
            setPricing({ nights, rental: exactPrice, total: exactPrice, dueNow: exactPrice * 0.5 });
          } catch (error) {
            console.error("Failed to calculate price:", error);
            toast.error("Error calculating exact price for these dates.");
          }
        }
      }
    };
    fetchPrice();
  }, [dates, property, adults, kids, guests]); // Re-runs whenever dates or guest count changes

  const saveCustomerAndContinue = async () => {
    if (!contact.firstName || !contact.lastName || !contact.email || !contact.phoneNumber || !contact.country) {
      toast.error("All fields, including Country, are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await customerService.createCustomer(contact);
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
        adults: adults, // Added new field
        kids: kids,     // Added new field
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
    customerId 
  };
};
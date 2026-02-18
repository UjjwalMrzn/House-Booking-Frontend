import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { differenceInDays, parseISO } from 'date-fns';
import { propertyService } from '../api/propertyService';
import { bookingApi } from '../api/bookingApi';
import { useToast } from '../components/ui/Toaster'; // IMPORTED

export const useReservation = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast(); // HOOK
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerId, setCustomerId] = useState<number | null>(null);

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getPropertyDetails(id || '3'),
    enabled: !!id,
  });

  const [guests, setGuests] = useState(parseInt(searchParams.get('guests') || '1'));

  const [dates, setDates] = useState({
    checkIn: searchParams.get('checkin') || '',
    checkOut: searchParams.get('checkout') || '',
  });
  
  const [contact, setContact] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    phoneNumber: '', 
    country: '' 
  });

  const [pricing, setPricing] = useState({ nights: 0, rental: 0, total: 0, dueNow: 0 });

  useEffect(() => {
    if (dates.checkIn && dates.checkOut && property) {
      const start = parseISO(dates.checkIn);
      const end = parseISO(dates.checkOut);
      const nights = differenceInDays(end, start);
      if (nights > 0) {
        const rental = nights * Number(property.base_price_per_night);
        setPricing({ nights, rental, total: rental, dueNow: rental * 0.5 });
      }
    }
  }, [dates, property]);

  const saveCustomerAndContinue = async () => {
    // Strict Validation
    if (!contact.firstName || !contact.lastName || !contact.email || !contact.phoneNumber || !contact.country) {
      toast.error("All fields, including Country, are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await bookingApi.createCustomer(contact);
      const newCustomerId = response.data.id;
      
      if (!newCustomerId) throw new Error("System Error: No Customer ID returned.");
      
      setCustomerId(newCustomerId);
      toast.success("Contact details saved!");
      setCurrentStep(2);
    } catch (error: any) {
      console.error("API Error:", error);
      toast.error(error.response?.data?.message || "Failed to save contact details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmBooking = async () => {
    if (!customerId) {
      toast.error("Session expired. Please re-enter contact info.");
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingPayload = { 
        property: parseInt(id || '3'), 
        check_in: dates.checkIn, 
        check_out: dates.checkOut, 
        customer: customerId 
      };

      const response = await bookingApi.createBooking(bookingPayload);
      
      toast.success("Booking Confirmed! Redirecting...");
      
      navigate('/success', { 
        state: { 
          bookingId: response.data.id,
          totalPrice: response.data.total_price,
          customerName: response.data.customer_name
        } 
      });
      
    } catch (error: any) {
      console.error("Booking Error:", error);
      toast.error(error.response?.data?.message || "Booking failed. Please try again.");
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return { 
    property, isLoading, currentStep, setCurrentStep, dates, setDates, guests, 
    setGuests, contact, setContact, pricing, isSubmitting, 
    saveCustomerAndContinue, confirmBooking 
  };
};
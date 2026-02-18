import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { differenceInDays, parseISO } from 'date-fns';
import { propertyService } from '../api/propertyService';
import { bookingApi } from '../api/bookingApi';
import { authApi } from '../api/authApi';

export const useReservation = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getPropertyDetails(id || '3'),
    enabled: !!id,
  });

  // FIX: Read 'guests' from URL parameters
  const [guests, setGuests] = useState(parseInt(searchParams.get('guests') || '1'));

  const [dates, setDates] = useState({
    checkIn: searchParams.get('checkin') || '',
    checkOut: searchParams.get('checkout') || '',
  });
  
  const [contact, setContact] = useState({ firstName: '', lastName: '', email: '', phone: '', country: 'Nepal' });
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

  const confirmBooking = async () => {
    setIsSubmitting(true);
    try {
      const userRes = await authApi.register({ ...contact, username: contact.email, userType: 'customer' });
      const customerId = userRes.id || userRes.user?.id;
      await bookingApi.create({ 
        property: parseInt(id || '3'), 
        check_in: dates.checkIn, 
        check_out: dates.checkOut, 
        customer: customerId 
      });
      alert("✅ BOOKING CONFIRMED!");
      navigate('/');
    } catch (error) {
      alert("❌ Email already exists or server error.");
    } finally { setIsSubmitting(false); }
  };

  return { property, isLoading, currentStep, setCurrentStep, dates, setDates, guests, setGuests, contact, setContact, pricing, isSubmitting, confirmBooking };
};
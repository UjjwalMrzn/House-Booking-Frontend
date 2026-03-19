import { useEffect, useRef } from "react";
import {
  ChevronLeft,
  Star,
  Info,
  Check,
  ChevronRight,
  Clock,
} from "lucide-react";
import { useReservation } from "../../hooks/useReservation";
import { Skeleton } from "../ui/Skeleton";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import DatePicker from "../ui/DatePicker";
import GuestSelector from "../ui/GuestSelector";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { bookingService } from "../../api/bookingApi";
import { useToast } from "../ui/Toaster";

declare global {
  interface Window {
    paypal: any;
  }
}

const COUNTRY_OPTIONS = new Intl.DisplayNames(["en"], { type: "region" });
const DYNAMIC_COUNTRIES = Array.from({ length: 676 }, (_, i) => {
  try {
    const code = String.fromCharCode(65 + Math.floor(i / 26), 65 + (i % 26));
    const name = COUNTRY_OPTIONS.of(code);
    return name && name !== code ? name : null;
  } catch {
    return null;
  }
})
  .filter(Boolean)
  .filter((value, index, self) => self.indexOf(value) === index)
  .sort() as string[];

const ReservationPage = () => {
  const {
    property,
    isLoading,
    currentStep,
    setCurrentStep,
    dates,
    setDates,
    guests,
    adults,
    setAdults,
    kids,
    setKids,
    contact,
    setContact,
    pricing,
    isSubmitting,
    setIsSubmitting,
    saveCustomerAndContinue,
    bookedRanges,
    customerId,
    holidayDates,
    schoolHolidayDates
  } = useReservation();

  const navigate = useNavigate();
  const toast = useToast();

  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const bookingIdRef = useRef<string | null>(null);

  const maxLimit = property?.max_guests || 10;

  useEffect(() => {
    if (currentStep === 3 && property && paypalContainerRef.current) {
      const renderPayPal = () => {
        paypalContainerRef.current!.innerHTML = "";

        window.paypal
          .Buttons({
            style: {
              layout: "vertical",
              color: "blue",
              shape: "rect",
              label: "pay",
              height: 45,
            },

            createOrder: async (_data: any, _actions: any) => {
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
                  status: "pending",
                };

                const bookingRes =
                  await bookingService.createBooking(bookingPayload);
                bookingIdRef.current = bookingRes.data.id;

                const rawBase =
                  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
                const cleanBase = rawBase.replace(/\/+$/, "");

                const payload = {
                  property_id: property.id,
                  name: `${contact.firstName} ${contact.lastName}`.trim(),
                  email: contact.email,
                  phone: contact.phoneNumber,
                  booking: bookingIdRef.current,
                  check_in: dates.checkIn,
                  check_out: dates.checkOut,
                  adults: adults,
                  kids: kids,
                  price: pricing.total.toString(),
                };

                const res = await fetch(
                  `${cleanBase}/api/paypal/create-order/`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  },
                );

                if (!res.ok) throw new Error("Backend Error");

                const orderData = await res.json();
                return orderData.id;
              } catch (err) {
                setIsSubmitting(false);
                toast.error("Failed to initialize transaction.");
                throw err;
              }
            },

            onApprove: async (data: any, _actions: any) => {
              try {
                const rawBase = import.meta.env.VITE_API_BASE_URL;
                const cleanBase = rawBase.replace(/\/+$/, "");

                const payload = {
                  property_id: property.id,
                  name: `${contact.firstName} ${contact.lastName}`.trim(),
                  email: contact.email,
                  phone: contact.phoneNumber,
                  check_in: dates.checkIn,
                  check_out: dates.checkOut,
                  booking: bookingIdRef.current,
                  price: pricing.total.toString(),
                  adults: adults,
                  kids: kids,
                };

                const res = await fetch(
                  `${cleanBase}/api/paypal/capture-order/${data.orderID}/`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  },
                );

                if (!res.ok) {
                  const errorData = await res.text();
                  throw new Error(`Capture Error: ${errorData}`);
                }

                toast.success("Payment Successful! Redirecting...");

                navigate("/success", {
                  state: {
                    bookingId: bookingIdRef.current,
                    totalPrice: pricing.total,
                    customerName: contact.firstName,
                  },
                });
              } catch (err) {
                console.error("PayPal Capture Error:", err);
                
                // RESTORED: Original JSON Error Parsing Logic
                if (err instanceof Error) {
                  try {
                    const jsonString = err.message.replace(
                      "Capture Error: ",
                      ""
                    );
                    const parsedError = JSON.parse(jsonString);
                    toast.error(
                      parsedError.error ||
                        "An error occurred with your payment."
                    );
                  } catch {
                    toast.error(err.message);
                  }
                } else {
                  toast.error("An unexpected error occurred.");
                }
                
                setIsSubmitting(false);
              }
            },

            onError: (err: any) => {
              console.error(err);
              toast.error(
                "There was an error with your payment. Please try again.",
              );
              setIsSubmitting(false);
            },
          })
          .render(paypalContainerRef.current);
      };

      if (!window.paypal) {
        const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
        const script = document.createElement("script");
        script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=AUD&intent=capture`;
        script.async = true;
        script.onload = renderPayPal;
        document.body.appendChild(script);
      } else {
        renderPayPal();
      }
    }
  }, [currentStep, property, pricing]);

  if (isLoading)
    return (
      <main className="min-h-screen bg-[#FCFBF9] pt-24 pb-20 font-sans">
        <div className="max-w-[1200px] mx-auto px-6">
          <Skeleton variant="text" className="h-10 w-64 rounded-xl" />
        </div>
      </main>
    );

  const isContactValid = !!(
    contact.email &&
    contact.firstName &&
    contact.lastName &&
    contact.phoneNumber &&
    contact.country
  );
  const isDatesValid = !!(dates.checkIn && dates.checkOut);

  return (
    <main className="min-h-screen bg-[#FCFBF9] font-sans text-brand-dark pb-32 lg:pb-20 pt-24 animate-fade-in text-brand-dark">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-16 gap-6">
          <div className="w-full md:w-auto flex justify-start">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-brand-dark uppercase tracking-[0.2em]"
            >
              <ChevronLeft size={14} /> Back
            </button>
          </div>

          <div className="flex items-center justify-center bg-white border border-gray-100 p-1.5 rounded-full shadow-sm w-fit mx-auto md:mx-0 overflow-x-auto scrollbar-hide">
            {[
              { id: 1, label: "Contact" },
              { id: 2, label: "Dates" },
              { id: 3, label: "Payment" },
            ].map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() =>
                    step.id < currentStep && setCurrentStep(step.id)
                  }
                  className={`px-4 md:px-5 py-2 flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all rounded-full whitespace-nowrap
                  ${currentStep === step.id ? "bg-brand-green text-white shadow-md shadow-green-100" : "text-gray-400 hover:text-brand-dark"}`}
                >
                  {currentStep > step.id && <Check size={12} strokeWidth={4} />}
                  {step.label}
                </button>
                {idx < 2 && (
                  <ChevronRight size={12} className="text-gray-200 mx-1" />
                )}
              </div>
            ))}
          </div>

          <div className="w-16 invisible hidden md:block">Back</div>
        </div>

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-10 lg:gap-20 items-start">
          <div className="space-y-8 md:space-y-12">
            {currentStep === 1 && (
              <div className="animate-fade-in space-y-6 md:space-y-8">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#1A1A1A]">
                  Your contact details
                </h1>
                <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 space-y-6 sm:space-y-8">
                  <Input
                    label="Email Address *"
                    type="email"
                    value={contact.email}
                    onChange={(e: any) =>
                      setContact({ ...contact, email: e.target.value })
                    }
                    required
                  />
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="First Name *"
                      value={contact.firstName}
                      onChange={(e: any) =>
                        setContact({ ...contact, firstName: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="Last Name *"
                      value={contact.lastName}
                      onChange={(e: any) =>
                        setContact({ ...contact, lastName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="Phone Number *"
                      type="tel"
                      value={contact.phoneNumber}
                      onChange={(e: any) =>
                        setContact({ ...contact, phoneNumber: e.target.value })
                      }
                      required
                    />
                    <Select
                      label="Country of Residence *"
                      value={contact.country}
                      onChange={(val) =>
                        setContact({ ...contact, country: val })
                      }
                      options={DYNAMIC_COUNTRIES}
                      required
                    />
                  </div>
                  <Button
                    disabled={!isContactValid || isSubmitting}
                    onClick={saveCustomerAndContinue}
                    fullWidth
                    className="hidden lg:flex" 
                  >
                    {isSubmitting ? "Saving..." : "Continue to Dates"}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-fade-in space-y-6 md:space-y-8">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#1A1A1A]">
                  Dates & Guests
                </h1>
                <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 space-y-8 sm:space-y-10">
                  <DatePicker
                    value={{ checkIn: dates.checkIn, checkOut: dates.checkOut }}
                    disabledDates={bookedRanges}
                    holidayDates={holidayDates}
                    schoolHolidayDates={schoolHolidayDates}
                    onChange={(range: any) =>
                      setDates({
                        ...dates,
                        checkIn: range?.from
                          ? format(range.from, "yyyy-MM-dd")
                          : "",
                        checkOut: range?.to
                          ? format(range.to, "yyyy-MM-dd")
                          : "",
                      })
                    }
                  />
                  <GuestSelector
                    adults={adults}
                    kids={kids}
                    onAdultsChange={setAdults}
                    onKidsChange={setKids}
                    max={maxLimit}
                  />
                  <Button
                    disabled={!isDatesValid}
                    onClick={() => setCurrentStep(3)}
                    fullWidth
                    className="hidden lg:flex" 
                  >
                    Continue to Payment
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="animate-fade-in space-y-6 md:space-y-8">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#1A1A1A]">
                  Payment details
                </h1>
                <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 space-y-6 sm:space-y-8">
                  <div className="bg-[#f0f9ff] border border-blue-100 rounded-2xl p-5 sm:p-6 flex gap-4 text-xs text-blue-800 leading-relaxed">
                    <Info className="shrink-0 text-blue-500" size={18} />
                    <div>
                      <strong>Secure checkout provided by PayPal.</strong> Your
                      reservation will be confirmed immediately after payment.
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-6 sm:py-8 border-y border-gray-100">
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                      Total Amount Due
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-brand-green">
                      ${pricing.total.toLocaleString()}
                    </span>
                  </div>

                  <div className="relative w-full flex flex-col items-center justify-center min-h-[50px]">
                    {isSubmitting && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
                        <span className="text-sm font-bold text-brand-green animate-pulse">
                          Processing... Do not close window.
                        </span>
                      </div>
                    )}
                    <div
                      ref={paypalContainerRef}
                      className="w-full relative z-0"
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="sticky top-24 md:top-32">
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-200 animate-slide-up">
              <div className="mb-6 md:mb-8 flex items-center justify-between">
                <h3 className="text-base md:text-lg font-black text-brand-dark">
                  Reservation summary
                </h3>
                <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full flex items-center gap-1.5 border border-amber-100">
                  <Clock size={12} strokeWidth={3} />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider">
                    Pending
                  </span>
                </div>
              </div>

              <div className="flex gap-4 md:gap-5 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-gray-100">
                <img
                  src={
                    property?.images?.find((img: any) => img.is_main)?.image ||
                    property?.images?.[0]?.image
                  }
                  alt="Property"
                  className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-xl"
                />
                <div className="flex flex-col justify-center">
                  <h4 className="font-bold text-brand-dark text-sm leading-snug">
                    {property?.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[9px] md:text-[10px] text-brand-green font-black uppercase mt-1.5">
                    <Star size={10} fill="currentColor" /> Premium Property
                  </div>
                </div>
              </div>

              <div className="space-y-5 md:space-y-6 text-sm mb-6 md:mb-8">
                <div className="flex justify-between items-start">
                  <span className="text-gray-400 font-black uppercase text-[9px] md:text-[10px] tracking-widest mt-0.5">
                    Dates
                  </span>
                  <div className="text-right">
                    <p className="text-brand-dark font-black">
                      {dates.checkIn || "--"} — {dates.checkOut || "--"}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-400 font-black uppercase text-[9px] md:text-[10px] tracking-widest mt-0.5">
                    Guests
                  </span>
                  <div className="text-right">
                    <p className="text-brand-dark font-black">
                      {guests} Guest(s)
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-5 md:p-6 space-y-3">
                <div className="flex justify-between text-xs font-bold text-gray-500">
                  <span>Rental ({pricing.nights} nights)</span>
                  <span className="font-black">
                    ${pricing.rental.toLocaleString()}
                  </span>
                </div>
                
                {pricing.perPersonCharge > 0 && (
                  <div className="flex justify-between text-xs font-bold text-gray-500">
                    <span>Per Person Charge ({guests} x ${guests > 0 ? parseFloat((pricing.perPersonCharge / guests).toFixed(2)).toLocaleString() : 0})</span>
                    <span className="font-black">
                      ${pricing.perPersonCharge.toLocaleString()}
                    </span>
                  </div>
                )}

                {pricing.bond > 0 && (
                  <div className="flex justify-between text-xs font-bold text-gray-500">
                    <span>Security Deposit (Bond)</span>
                    <span className="font-black">
                      ${pricing.bond.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-lg md:text-xl font-black text-brand-dark pt-3 border-t border-gray-200">
                  <span>Total (AUD)</span>
                  <span className="text-brand-green font-black">
                    ${pricing.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pt-4 pb-6 px-6 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.1)] lg:hidden animate-slide-up"
        style={{ zIndex: 2147483647 }}
      >
        <div className="flex flex-col">
          <div className="flex items-end gap-1">
            <span className="text-xl font-black text-brand-dark">
              ${pricing.total.toLocaleString()}
            </span>
            <span className="text-gray-500 font-bold text-xs mb-1">AUD</span>
          </div>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            Total Due
          </span>
        </div>

        {currentStep === 1 && (
          <Button
            disabled={!isContactValid || isSubmitting}
            onClick={saveCustomerAndContinue}
            size="sm"
            className="px-6 rounded-lg"
          >
            {isSubmitting ? "Saving..." : "Next Step"}
          </Button>
        )}
        {currentStep === 2 && (
          <Button
            disabled={!isDatesValid}
            onClick={() => setCurrentStep(3)}
            size="sm"
            className="px-6 rounded-lg"
          >
            Payment
          </Button>
        )}
        {currentStep === 3 && (
          <Button
            disabled={isSubmitting}
            onClick={() => {
              paypalContainerRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }}
            size="sm"
            className="px-6 rounded-lg"
          >
            Pay Now
          </Button>
        )}
      </div>
    </main>
  );
};

export default ReservationPage;
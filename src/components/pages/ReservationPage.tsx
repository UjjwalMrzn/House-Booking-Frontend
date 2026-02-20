import { ChevronLeft, Star, Info, Check, ChevronRight, Clock } from 'lucide-react';
import { useReservation } from '../../hooks/useReservation';
import { Skeleton } from '../ui/Skeleton';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import DatePicker from '../ui/DatePicker';
import GuestSelector from '../ui/GuestSelector';
import { format } from 'date-fns';

// FIXED: Dynamic country list using Intl API for a professional, universal list
const COUNTRY_OPTIONS = new Intl.DisplayNames(['en'], { type: 'region' });
const ALL_COUNTRIES = Array.from({ length: 250 }, (_, i) => {
  try {
    const code = String.fromCharCode(65 + Math.floor(i / 26), 65 + (i % 26));
    const name = COUNTRY_OPTIONS.of(code);
    return name && name !== code ? name : null;
  } catch { return null; }
}).filter(Boolean).sort() as string[];

const ReservationPage = () => {
  const { 
    property, isLoading, currentStep, setCurrentStep, 
    dates, setDates, guests, setGuests, 
    contact, setContact, pricing, isSubmitting, 
    saveCustomerAndContinue, confirmBooking 
  } = useReservation();

  // RULE: Implementation Phase - Universal Skeleton Parity
  if (isLoading) return (
    <main className="min-h-screen bg-[#FCFBF9] pt-24 pb-20 font-sans">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center justify-between mb-16">
          <Skeleton variant="text" className="w-16" />
          <div className="flex gap-6">
            <Skeleton variant="text" className="w-20" />
            <Skeleton variant="text" className="w-20" />
            <Skeleton variant="text" className="w-20" />
          </div>
          <div className="w-16 invisible" />
        </div>

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-20 items-start">
          <div className="space-y-8">
            <Skeleton variant="text" className="h-10 w-64 rounded-xl" />
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 space-y-8 shadow-sm">
              <Skeleton variant="input" />
              <div className="grid md:grid-cols-2 gap-6">
                <Skeleton variant="input" />
                <Skeleton variant="input" />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Skeleton variant="input" />
                <Skeleton variant="input" />
              </div>
              <Skeleton variant="button" />
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-8">
            <Skeleton variant="text" className="h-6 w-32 rounded-lg" />
            <div className="flex gap-5 pb-8 border-b border-gray-50">
              <Skeleton variant="circle" className="w-16 h-16 rounded-xl shrink-0" />
              <div className="space-y-2 w-full">
                <Skeleton variant="text" className="w-3/4" />
                <Skeleton variant="text" className="w-1/4" />
              </div>
            </div>
            <Skeleton variant="card" className="h-32" />
          </div>
        </div>
      </div>
    </main>
  );

  const isContactValid = !!(contact.email && contact.firstName && contact.lastName && contact.phoneNumber && contact.country);
  const isDatesValid = !!(dates.checkIn && dates.checkOut);

  return (
    <main className="min-h-screen bg-[#FCFBF9] font-sans text-brand-dark pb-20 pt-24 animate-fade-in">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Navigation & Steps */}
        <div className="flex items-center justify-between mb-16">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-brand-dark uppercase tracking-[0.2em]">
            <ChevronLeft size={14}/> Back
          </button>
          
          <div className="flex items-center gap-6">
            {[ { id: 1, label: 'Contact' }, { id: 2, label: 'Dates' }, { id: 3, label: 'Payment' } ].map((step, idx) => (
              <div key={step.id} className="flex items-center gap-4">
                <button 
                  onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all pb-1 border-b-2
                  ${currentStep === step.id ? 'text-brand-dark border-brand-green' : 'text-gray-300 border-transparent'}`}
                >
                  {currentStep > step.id && <Check size={12} className="text-brand-green" />}
                  {step.label}
                </button>
                {idx < 2 && <ChevronRight size={14} className="text-gray-200"/>}
              </div>
            ))}
          </div>

          <div className="w-16 invisible">Back</div>
        </div>

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-20 items-start">
          
          {/* Main Form Area */}
          <div className="space-y-12">
            {currentStep === 1 && (
              <div className="animate-fade-in space-y-8">
                <h1 className="text-3xl font-black tracking-tight text-[#1A1A1A]">Your contact details</h1>
                <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 space-y-8">
                    <Input 
                     label="Email Address *" 
                     type="email" 
                     value={contact.email} 
                     onChange={(e: any) => setContact({...contact, email: e.target.value})} 
                     required 
                    />
                    <div className="grid md:grid-cols-2 gap-6">
                       <Input label="First Name *" value={contact.firstName} onChange={(e: any) => setContact({...contact, firstName: e.target.value})} required />
                       <Input label="Last Name *" value={contact.lastName} onChange={(e: any) => setContact({...contact, lastName: e.target.value})} required />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input label="Phone Number *" type="tel" value={contact.phoneNumber} onChange={(e: any) => setContact({...contact, phoneNumber: e.target.value})} required />
                      <Select 
                       label="Country of Residence *"
                       value={contact.country}
                       onChange={(val) => setContact({...contact, country: val})} 
                       options={ALL_COUNTRIES}
                       required
                      />
                    </div>
                    <Button 
                      disabled={!isContactValid || isSubmitting} 
                      onClick={saveCustomerAndContinue}
                      fullWidth
                    >
                      {isSubmitting ? "Saving..." : "Continue to Dates"}
                    </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-fade-in space-y-8">
                <h1 className="text-3xl font-black tracking-tight text-[#1A1A1A]">Dates & Guests</h1>
                <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 space-y-10">
                    <DatePicker 
                     value={{ checkIn: dates.checkIn, checkOut: dates.checkOut }}
                     onChange={(range: any) => setDates({
                       ...dates, 
                       checkIn: range?.from ? format(range.from, 'yyyy-MM-dd') : '',
                       checkOut: range?.to ? format(range.to, 'yyyy-MM-dd') : ''
                     })}
                    />
                    <GuestSelector value={guests} onChange={setGuests} />
                    <Button 
                      disabled={!isDatesValid} 
                      onClick={() => setCurrentStep(3)}
                      fullWidth
                    >
                      Continue to Payment
                    </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="animate-fade-in space-y-8">
                <h1 className="text-3xl font-black tracking-tight text-[#1A1A1A]">Payment details</h1>
                <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 space-y-8">
                    <div className="bg-[#FFF9E5] border border-[#FFEAB3] rounded-2xl p-6 flex gap-4 text-xs text-[#856404] leading-relaxed">
                      <Info className="shrink-0" size={18}/> 
                      <div><strong>No payment processed until confirmation.</strong> We will send you an email with updates.</div>
                    </div>
                    <div className="flex justify-between items-center py-8 border-y border-gray-100">
                      <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Amount Due Today (50%)</span>
                      <span className="text-3xl font-black text-brand-green">${pricing.dueNow.toLocaleString()}</span>
                    </div>
                    <Button 
                      onClick={confirmBooking} 
                      disabled={isSubmitting}
                      fullWidth
                    >
                      {isSubmitting ? "Processing..." : "Agree & Confirm Reservation"}
                    </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Summary Area */}
          <aside className="sticky top-32">
            <div className="bg-white p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 animate-slide-up">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-lg font-bold text-brand-dark">Reservation summary</h3>
                <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full flex items-center gap-1.5 border border-amber-100">
                    <Clock size={12} strokeWidth={3} />
                    <span className="text-[10px] font-black uppercase tracking-wider">Pending</span>
                </div>
              </div>

              <div className="flex gap-5 mb-8 pb-8 border-b border-gray-50">
                <img src={property?.images?.[0]?.image} alt="Property" className="w-16 h-16 object-cover rounded-xl" />
                <div>
                  <h4 className="font-bold text-brand-dark text-sm">{property?.title}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-brand-green font-bold uppercase mt-1">
                    <Star size={10} fill="currentColor"/> Superhost
                  </div>
                </div>
              </div>

              <div className="space-y-6 text-sm mb-8">
                <div className="flex justify-between items-start">
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Dates</span>
                  <div className="text-right">
                      <p className="text-brand-dark font-bold">{dates.checkIn || '--'} — {dates.checkOut || '--'}</p>
                      <button onClick={() => setCurrentStep(2)} className="text-[10px] text-brand-green font-bold underline mt-1">Edit</button>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Guests</span>
                  <div className="text-right">
                      <p className="text-brand-dark font-bold">{guests} Guest(s)</p>
                      <button onClick={() => setCurrentStep(2)} className="text-[10px] text-brand-green font-bold underline mt-1">Edit</button>
                  </div>
                </div>
              </div>

              <div className="bg-[#F9F9F7] rounded-2xl p-6 space-y-3">
                <div className="flex justify-between text-xs font-bold text-gray-500">
                    <span>Rental ({pricing.nights} nights)</span>
                    <span>${pricing.rental.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xl font-black text-brand-dark pt-3 border-t border-gray-200">
                    <span>Total (USD)</span>
                    <span>${pricing.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
};

export default ReservationPage;
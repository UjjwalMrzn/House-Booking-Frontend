import { ChevronLeft, Star, Info, Check, ChevronRight } from 'lucide-react';
import { useReservation } from '../../hooks/useReservation';
import { Skeleton } from '../ui/Skeleton';
import Button from '../ui/Button';
import Input from '../ui/Input';
import DatePicker from '../ui/DatePicker';
import { format } from 'date-fns';

const ReservationSteps = ({ currentStep, onStepClick }: { currentStep: number, onStepClick: (s: number) => void }) => {
  const steps = [{ id: 1, label: 'Contact' }, { id: 2, label: 'Dates' }, { id: 3, label: 'Payment' }];
  return (
    <div className="flex items-center gap-6">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-center gap-4">
          <button 
            onClick={() => step.id < currentStep && onStepClick(step.id)}
            className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-all pb-1 border-b-2
            ${currentStep === step.id ? 'text-brand-dark border-brand-green' : 'text-gray-300 border-transparent'}`}
          >
            {currentStep > step.id && <Check size={12} className="text-brand-green" />}
            {step.label}
          </button>
          {idx < 2 && <ChevronRight size={14} className="text-gray-200"/>}
        </div>
      ))}
    </div>
  );
};

const ReservationSummary = ({ property, dates, guests, contact, pricing, onEditStep }: any) => {
  if (!property) return null;
  return (
    <aside className="sticky top-32">
      <div className="bg-white p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100">
        <h3 className="text-lg font-bold text-brand-dark mb-8">Reservation summary</h3>
        <div className="flex gap-5 mb-8 pb-8 border-b border-gray-50">
          <img src={property.images?.[0]?.image} alt="Property" className="w-16 h-16 object-cover rounded-xl" />
          <div>
            <h4 className="font-bold text-brand-dark text-sm">{property.title}</h4>
            <div className="flex items-center gap-1 text-[10px] text-brand-green font-bold uppercase mt-1">
              <Star size={10} fill="currentColor"/> Superhost
            </div>
          </div>
        </div>
        <div className="space-y-6 text-sm mb-8">
          <div className="flex justify-between items-start">
            <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Dates</span>
            <div className="text-right">
                <p className="text-brand-dark font-bold">{dates.checkIn || '--'} — {dates.checkOut || '--'}</p>
                <button onClick={() => onEditStep(2)} className="text-[10px] text-brand-green font-bold underline mt-1">Edit</button>
            </div>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Guests</span>
            <div className="text-right">
                <p className="text-brand-dark font-bold">{guests} Guest(s)</p>
                <button onClick={() => onEditStep(2)} className="text-[10px] text-brand-green font-bold underline mt-1">Edit</button>
            </div>
          </div>
          {contact.email && (
            <div className="flex justify-between items-start border-t border-gray-50 pt-4">
              <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Contact</span>
              <div className="text-right">
                  <p className="text-brand-dark font-bold truncate max-w-[150px]">{contact.email}</p>
                  <button onClick={() => onEditStep(1)} className="text-[10px] text-brand-green font-bold underline mt-1">Edit</button>
              </div>
            </div>
          )}
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
  );
};

const ReservationPage = () => {
  const { 
    property, isLoading, currentStep, setCurrentStep, 
    dates, setDates, guests, setGuests, 
    contact, setContact, pricing, isSubmitting, confirmBooking 
  } = useReservation();

  const isContactValid = contact.email && contact.firstName && contact.lastName && contact.phone;
  const isDatesValid = dates.checkIn && dates.checkOut;

  if (isLoading) return <div className="min-h-screen bg-[#FCFBF9] pt-32 px-10"><Skeleton className="h-[600px] w-full max-w-6xl mx-auto" /></div>;

  return (
    <main className="min-h-screen bg-[#FCFBF9] font-sans text-brand-dark pb-20 pt-24">
      <div className="max-w-[1200px] mx-auto px-6">
        
        <div className="flex items-center justify-between mb-16">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-brand-dark uppercase tracking-[0.2em]">
            <ChevronLeft size={14}/> Back
          </button>
          <ReservationSteps currentStep={currentStep} onStepClick={setCurrentStep} />
          <div className="w-16 invisible">Back</div>
        </div>

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-20 items-start">
          <div className="space-y-12">
            
            {currentStep === 1 && (
              <div className="animate-fade-in space-y-8">
                <h1 className="text-3xl font-black tracking-tight text-[#1A1A1A]">Your contact details</h1>
                <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 space-y-8">
                   <Input label="Email Address *" type="email" value={contact.email} onChange={(e: any) => setContact({...contact, email: e.target.value})} required />
                   <div className="grid md:grid-cols-2 gap-6">
                      <Input label="First Name *" value={contact.firstName} onChange={(e: any) => setContact({...contact, firstName: e.target.value})} required />
                      <Input label="Last Name *" value={contact.lastName} onChange={(e: any) => setContact({...contact, lastName: e.target.value})} required />
                   </div>
                   <Input label="Phone Number *" type="tel" value={contact.phone} onChange={(e: any) => setContact({...contact, phone: e.target.value})} required />
                   
                   <Button 
                    disabled={!isContactValid} 
                    onClick={() => setCurrentStep(2)} 
                    className={`w-full h-16 uppercase tracking-widest text-[11px] ${!isContactValid ? 'opacity-30 cursor-not-allowed' : ''}`}
                   >
                     Continue to Dates
                   </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-fade-in space-y-8">
                <h1 className="text-3xl font-black tracking-tight text-[#1A1A1A]">Dates & Guests</h1>
                <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 space-y-10">
                   
                   <div className="flex border border-gray-200 rounded-2xl overflow-hidden shadow-sm relative">
                      <DatePicker 
                        value={{ checkIn: dates.checkIn, checkOut: dates.checkOut }}
                        onChange={(range: any) => setDates({
                          ...dates, 
                          checkIn: range?.from ? format(range.from, 'yyyy-MM-dd') : '',
                          checkOut: range?.to ? format(range.to, 'yyyy-MM-dd') : ''
                        })}
                      />
                   </div>

                   <div className="flex justify-between items-center p-8 bg-[#F9F9F7] rounded-2xl border border-gray-100">
                      <span className="font-bold text-brand-dark uppercase text-[10px] tracking-widest">Traveling with</span>
                      <div className="flex items-center gap-6">
                        <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-10 h-10 rounded-full bg-white border border-gray-200 font-bold hover:border-brand-green transition-all shadow-sm">-</button>
                        <span className="font-bold text-sm w-12 text-center">{guests} guest</span>
                        <button onClick={() => setGuests(guests + 1)} className="w-10 h-10 rounded-full bg-white border border-gray-200 font-bold hover:border-brand-green transition-all shadow-sm">+</button>
                      </div>
                   </div>

                   <Button 
                    disabled={!isDatesValid} 
                    onClick={() => setCurrentStep(3)} 
                    className={`w-full h-16 uppercase tracking-widest text-[11px] ${!isDatesValid ? 'opacity-30 cursor-not-allowed' : ''}`}
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
                     <div><strong>Payment upon confirmed reservation:</strong> No payment processed until confirmation. We will send you an email with updates.</div>
                   </div>
                   <div className="flex justify-between items-center py-8 border-y border-gray-100">
                     <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Amount Due Today (50%)</span>
                     <span className="text-3xl font-black text-brand-green">${pricing.dueNow.toLocaleString()}</span>
                   </div>
                   <Button onClick={confirmBooking} disabled={isSubmitting} className="w-full h-16 uppercase tracking-widest text-[11px]">
                     {isSubmitting ? "Processing..." : "Agree & Confirm Reservation"}
                   </Button>
                </div>
              </div>
            )}
          </div>

          <ReservationSummary 
            property={property} 
            dates={dates} 
            guests={guests} 
            contact={contact} 
            pricing={pricing} 
            onEditStep={setCurrentStep} 
          />
        </div>
      </div>
    </main>
  );
};

export default ReservationPage;
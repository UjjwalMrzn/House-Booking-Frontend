import { Check, ChevronRight } from 'lucide-react';

export const ReservationSteps = ({ currentStep, onStepClick }: { currentStep: number, onStepClick: (s: number) => void }) => {
  const steps = [{ id: 1, label: 'Contact' }, { id: 2, label: 'Dates' }, { id: 3, label: 'Payment' }];

  return (
    <div className="flex items-center gap-4">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-center gap-3">
          <button 
            onClick={() => step.id < currentStep && onStepClick(step.id)}
            className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-full transition-all 
            ${currentStep === step.id ? 'bg-brand-dark text-white shadow-lg' : currentStep > step.id ? 'bg-green-50 text-brand-green hover:bg-green-100' : 'text-gray-300 pointer-events-none'}`}
          >
            {currentStep > step.id ? <Check size={12} strokeWidth={4}/> : step.id} {step.label}
          </button>
          {idx < 2 && <ChevronRight size={14} className="text-gray-200"/>}
        </div>
      ))}
    </div>
  );
};
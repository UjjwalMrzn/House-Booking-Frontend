import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

const FormModal: React.FC<FormModalProps> = ({ 
  isOpen, onClose, title, children, maxWidth = 'max-w-md' 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Reusable "Click Outside to Close" logic baked right in!
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-fade-in">
      <div ref={modalRef} className={`bg-white w-full ${maxWidth} relative rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.2)] border border-gray-100 animate-slide-up`}>
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 rounded-t-[2rem]">
          <h3 className="text-lg font-black text-brand-dark tracking-tight">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-brand-dark transition-colors">
            <X size={20} strokeWidth={3} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FormModal;
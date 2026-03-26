import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const FormModal: React.FC<FormModalProps> = ({ 
  isOpen, onClose, title, children 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/40 backdrop-blur-sm animate-fade-in p-4 admin-modal-overlay">
      {/* SURGICAL FIX: 
        1. Removed dynamic maxWidth prop.
        2. Added md:w-[768px] to rigidly lock the width on desktop.
        Now it cannot shrink or grow. It will always be identical.
      */}
      <div ref={modalRef} className="bg-white w-full max-w-3xl md:w-[768px] relative rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.2)] border border-gray-100 animate-slide-up max-h-[90vh] flex flex-col">
        
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 rounded-t-[2rem] shrink-0">
          <h3 className="text-lg font-black text-brand-dark tracking-tight">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-brand-dark transition-colors">
            <X size={20} strokeWidth={3} />
          </button>
        </div>
        
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          {children}
        </div>

      </div>
    </div>,
    document.body
  );
};

export default FormModal;
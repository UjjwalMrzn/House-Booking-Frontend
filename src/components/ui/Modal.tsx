import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", variant = "primary", loading 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden animate-slide-up">
        
        {/* Header Icon */}
        <div className="p-6 pb-0 flex justify-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-brand-green/10 text-brand-green'}`}>
            {variant === 'danger' ? <AlertTriangle size={28} /> : <X size={28} />}
          </div>
        </div>

        <div className="p-8 text-center">
          <h3 className="text-xl font-black text-brand-dark tracking-tight mb-2">{title}</h3>
          <p className="text-sm font-bold text-gray-400 leading-relaxed">{message}</p>
        </div>

        <div className="p-6 bg-gray-50/50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <Button 
            onClick={onConfirm} 
            variant={variant === 'danger' ? 'primary' : 'primary'} // Map to your existing Button variants
            className={`flex-1 ${variant === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : ''}`}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
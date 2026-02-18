import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000); 
  }, [removeToast]);

  const success = (msg: string) => addToast(msg, 'success');
  const error = (msg: string) => addToast(msg, 'error');
  const info = (msg: string) => addToast(msg, 'info');

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      {/* RULE: Container designed once. Fixed position and pointer logic strictly internal. */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => {
          // RULE: Design CSS Once. Lock in color pairs and rounding.
          const styles = {
            error: {
              border: "border-red-100",
              text: "text-red-500",
              icon: <AlertCircle size={20} />
            },
            success: {
              border: "border-green-100",
              text: "text-brand-green",
              icon: <CheckCircle size={20} />
            },
            info: {
              border: "border-blue-100",
              text: "text-blue-500",
              icon: <Info size={20} />
            }
          }[toast.type];

          return (
            <div 
              key={toast.id}
              className={`
                pointer-events-auto min-w-[320px] bg-white p-4 rounded-2xl 
                shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border flex items-start gap-4 animate-entrance
                ${styles.border}
              `}
            >
              <div className={`mt-0.5 ${styles.text}`}>
                {styles.icon}
              </div>
              <div className="flex-1">
                <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${styles.text}`}>
                  {toast.type}
                </h4>
                <p className="text-sm font-bold text-brand-dark leading-tight">
                  {toast.message}
                </p>
              </div>
              <button 
                onClick={() => removeToast(toast.id)} 
                className="text-gray-300 hover:text-gray-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
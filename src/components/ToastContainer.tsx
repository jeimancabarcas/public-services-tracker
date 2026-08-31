import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let bgClass = 'bg-[#131b2e] text-white border-white/10';
        let icon = <CheckCircle2 className="w-4 h-4 text-[#86f2e4] shrink-0" />;

        if (toast.type === 'error') {
          bgClass = 'bg-[#ba1a1a] text-white border-transparent';
          icon = <AlertCircle className="w-4 h-4 text-white shrink-0" />;
        } else if (toast.type === 'info') {
          bgClass = 'bg-[#006a61] text-white border-transparent';
          icon = <Info className="w-4 h-4 text-[#86f2e4] shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-xl border text-xs font-medium animate-in slide-in-from-bottom-2 duration-150 ${bgClass}`}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 hover:bg-white/20 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

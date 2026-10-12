import React, { useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'critical' | 'warning' | 'success' | 'info';
  timestamp: number;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-right-5 ${
            toast.type === 'critical'
              ? 'bg-red-950/95 border-red-700/80 text-red-100 shadow-glow-red'
              : toast.type === 'warning'
              ? 'bg-orange-950/95 border-orange-700/80 text-orange-100 shadow-glow-orange'
              : toast.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-700/80 text-emerald-100'
              : 'bg-slate-900/95 border-slate-700 text-slate-100 shadow-lg'
          }`}
        >
          {toast.type === 'critical' && <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-pulse" />}
          {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />}
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />}

          <div className="flex-1 min-w-0">
            <h5 className="font-bold text-xs uppercase tracking-wide leading-tight">{toast.title}</h5>
            <p className="text-xs text-slate-200 mt-0.5 leading-snug">{toast.description}</p>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

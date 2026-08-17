import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
        };

        const borders = {
          success: 'border-emerald-200 dark:border-emerald-900/40 bg-white dark:bg-slate-900',
          error: 'border-rose-200 dark:border-rose-900/40 bg-white dark:bg-slate-900',
          warning: 'border-amber-200 dark:border-amber-900/40 bg-white dark:bg-slate-900',
          info: 'border-sky-200 dark:border-sky-900/40 bg-white dark:bg-slate-900',
        };

        return (
          <div
            key={toast.id}
            id={`toast-item-${toast.id}`}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-lg border ${borders[toast.type]} transition-all animate-in slide-in-from-bottom-5 duration-200`}
          >
            <div className="pt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              id={`toast-dismiss-${toast.id}`}
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

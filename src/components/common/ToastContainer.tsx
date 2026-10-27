/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bg = 'bg-white border-stone-200 text-stone-800';
        let icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;

        if (toast.type === 'error') {
          bg = 'bg-red-50 border-red-200 text-red-950';
          icon = <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />;
        } else if (toast.type === 'info') {
          bg = 'bg-emerald-50 border-emerald-200 text-emerald-950';
          icon = <Info className="w-4 h-4 text-emerald-600 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-lg transition-all animate-in slide-in-from-bottom-2 duration-200 ${bg}`}
          >
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              {icon}
              <span className="text-xs font-medium leading-snug">{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="p-1 text-stone-400 hover:text-stone-600 rounded-md shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

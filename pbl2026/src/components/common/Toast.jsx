// src/components/common/Toast.jsx
import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const typeConfig = {
    success: {
      style: 'bg-emerald-900 text-white border-emerald-800 shadow-lg',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0 mr-2.5" />
    },
    error: {
      style: 'bg-red-900 text-white border-red-800 shadow-lg',
      icon: <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mr-2.5" />
    },
    info: {
      style: 'bg-slate-900 text-white border-slate-800 shadow-lg',
      icon: <Info className="w-5 h-5 text-teal-300 flex-shrink-0 mr-2.5" />
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className="fixed bottom-5 right-5 z-50 transition-all transform ease-out duration-300 animate-in fade-in slide-in-from-bottom-2">
      <div className={`flex items-center px-4 py-3 rounded-xl border ${config.style}`}>
        {config.icon}
        <span className="text-sm font-medium pr-2">{message}</span>
        <button
          onClick={onClose}
          className="ml-auto p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

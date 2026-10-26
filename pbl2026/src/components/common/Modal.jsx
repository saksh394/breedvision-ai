// src/components/common/Modal.jsx
import React from 'react';
import Icons from './Icons';

export default function Modal({
  isOpen,
  title,
  onClose,
  children,
  maxWidth = 'max-w-lg',
  className = ''
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className={`bg-white rounded-xl ${maxWidth} w-full p-6 shadow-xl border border-slate-200 my-8 ${className}`}>
        {(title || onClose) && (
          <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
            {title && <h3 className="text-lg font-bold text-slate-900">{title}</h3>}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <Icons.Close className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

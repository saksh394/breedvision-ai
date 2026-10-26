// src/components/common/EmptyState.jsx
import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: CustomIcon = null,
  title = "No data available",
  message = "No records found at this moment.",
  actionText,
  onAction
}) {
  return (
    <div className="p-12 text-center">
      <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center border border-slate-200">
        {CustomIcon ? <CustomIcon className="w-6 h-6" /> : <Inbox className="w-6 h-6" />}
      </div>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {message && <p className="text-xs text-slate-500 mt-1 mb-4 max-w-sm mx-auto">{message}</p>}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="btn-primary text-xs px-4 py-2"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ErrorState({
  title = "Something went wrong.",
  message = "Unable to analyze this image.",
  retryText = "Try Again",
  onRetry
}) {
  return (
    <div className="py-10 text-center space-y-4">
      <div className="w-12 h-12 mx-auto bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-200">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <p className="text-base font-semibold text-slate-800">{message || title}</p>
      {onRetry && (
        <div>
          <button
            onClick={onRetry}
            className="btn-primary"
          >
            {retryText}
          </button>
        </div>
      )}
    </div>
  );
}

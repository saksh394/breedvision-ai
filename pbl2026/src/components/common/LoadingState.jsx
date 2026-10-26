// src/components/common/LoadingState.jsx
import React from 'react';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

export default function LoadingState({
  title = "Analyzing Image...",
  steps = [],
  currentStep = 0
}) {
  return (
    <div className="py-10 text-center space-y-5">
      <div className="w-12 h-12 mx-auto bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center border border-emerald-200 shadow-sm">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>

      {steps.length > 0 && (
        <div className="max-w-xs mx-auto space-y-2.5 text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
          {steps.map((step, index) => {
            const isDone = index < currentStep;
            const isCurrent = index === currentStep;
            return (
              <div
                key={index}
                className={`flex items-center space-x-2.5 text-xs font-medium transition-colors ${
                  isDone
                    ? 'text-emerald-800'
                    : isCurrent
                    ? 'text-emerald-700 font-semibold'
                    : 'text-slate-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                )}
                <span>{step}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

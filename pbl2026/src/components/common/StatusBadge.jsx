// src/components/common/StatusBadge.jsx
import React from 'react';
import { CheckCircle2, Check, Clock, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status, size = "sm" }) {
  const getBadgeConfig = () => {
    switch (status) {
      case 'Verified':
      case 'Active':
        return {
          style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
        };
      case 'Corrected':
        return {
          style: 'bg-teal-50 text-teal-700 border-teal-200',
          icon: <Check className="w-3.5 h-3.5 mr-1" />
        };
      case 'Under Review':
        return {
          style: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: <Clock className="w-3.5 h-3.5 mr-1" />
        };
      case 'Inactive':
      case 'Rejected':
        return {
          style: 'bg-red-50 text-red-700 border-red-200',
          icon: <AlertCircle className="w-3.5 h-3.5 mr-1" />
        };
      case 'Pending':
      default:
        return {
          style: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <Clock className="w-3.5 h-3.5 mr-1" />
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span className={`inline-flex items-center ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'} rounded-full font-medium border ${config.style}`}>
      {config.icon}
      <span>{status || 'Pending'}</span>
    </span>
  );
}

// frontend/app/components/StatusBadge.tsx

import React from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: 'planning' | 'in-development' | 'coming-soon' | 'completed';
  text?: string;
}

export default function StatusBadge({ status, text }: StatusBadgeProps) {
  const baseStyles = 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium';

  const statusConfig = {
    'planning': {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      icon: AlertCircle,
      defaultText: 'Planning Phase'
    },
    'in-development': {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      icon: Clock,
      defaultText: 'Under Development'
    },
    'coming-soon': {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      icon: Clock,
      defaultText: 'Coming Soon'
    },
    'completed': {
      bg: 'bg-green-50',
      text: 'text-green-700',
      icon: CheckCircle,
      defaultText: 'Completed'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  const displayText = text || config.defaultText;

  return (
    <div className={`${baseStyles} ${config.bg} ${config.text}`}>
      <Icon size={16} />
      <span>{displayText}</span>
    </div>
  );
}
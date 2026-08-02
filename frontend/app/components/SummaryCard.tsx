'use client';

import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
}

export default function SummaryCard({
  title,
  value,
  icon: Icon,
  bgColor,
  textColor,
}: SummaryCardProps) {
  return (
    <div className={`${bgColor} rounded-lg shadow p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`${textColor} opacity-20`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
}
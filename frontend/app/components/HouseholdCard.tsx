'use client';

import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface HouseholdCardProps {
  householdId: string;
  memberCount: number;
  combinedBalance: number;
  riskBucket: string;
  churnProbability: number;
  householdValue: 'premium' | 'standard' | 'starter';
}

export default function HouseholdCard({
  householdId,
  memberCount,
  combinedBalance,
  riskBucket,
  churnProbability,
  householdValue,
}: HouseholdCardProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High Risk':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium Risk':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Low Risk':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Safe':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getValueColor = (value: string) => {
    switch (value) {
      case 'premium':
        return 'text-yellow-600 font-semibold';
      case 'standard':
        return 'text-blue-600 font-semibold';
      case 'starter':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <Link href={`/households/${householdId}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 cursor-pointer border border-gray-200 hover:border-blue-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">{householdId}</h3>
          <span className={`px-2 py-1 rounded text-xs font-semibold border ${getRiskColor(riskBucket)}`}>
            {riskBucket}
          </span>
        </div>

        {/* Main Info */}
        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Members</span>
            <span className="text-sm font-semibold text-gray-900">{memberCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Balance</span>
            <span className="text-sm font-semibold text-gray-900">{formatCurrency(combinedBalance)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Churn Risk</span>
            <span className="text-sm font-semibold text-gray-900">{(churnProbability * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t flex justify-between items-center">
          <span className={`text-xs ${getValueColor(householdValue)} uppercase tracking-wide`}>
            {householdValue}
          </span>
          <span className="text-xs text-blue-600 font-medium hover:text-blue-800">View →</span>
        </div>
      </div>
    </Link>
  );
}
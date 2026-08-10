'use client';

import Link from 'next/link';

interface CohortCardProps {
  cohortId: number;
  cohortName: string;
  description: string;
  memberCount: number;
  sizePercentage: number;
  avgChurnProbability: number;
  pctHighRisk: number;
}

export default function CohortCard({
  cohortId,
  cohortName,
  description,
  memberCount,
  sizePercentage,
  avgChurnProbability,
  pctHighRisk,
}: CohortCardProps) {
  const getRiskSeverity = (churnProb: number) => {
    if (churnProb >= 0.55) return 'High Risk Cohort';
    if (churnProb >= 0.50) return 'Medium Risk Cohort';
    return 'Lower Risk Cohort';
  };

  const getRiskColor = (churnProb: number) => {
    if (churnProb >= 0.55) return 'bg-red-50 border-red-200';
    if (churnProb >= 0.50) return 'bg-orange-50 border-orange-200';
    return 'bg-green-50 border-green-200';
  };

  const truncate = (text: string, length: number) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  return (
    <Link href={`/cohorts/${cohortId}`}>
      <div className={`rounded-lg shadow hover:shadow-lg transition p-5 cursor-pointer border ${getRiskColor(avgChurnProbability)}`}>
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-900">{cohortName}</h3>
            <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded">
              Cohort {cohortId}
            </span>
          </div>
          <p className="text-xs text-gray-600 italic">{truncate(description, 80)}</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-3 py-3 border-y border-gray-200">
          <div>
            <p className="text-xs text-gray-500 mb-1">Members</p>
            <p className="text-lg font-bold text-gray-900">{memberCount.toLocaleString()}</p>
            <p className="text-xs text-gray-600">{sizePercentage.toFixed(1)}% of total</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Churn Risk</p>
            <p className="text-lg font-bold text-gray-900">{(avgChurnProbability * 100).toFixed(1)}%</p>
            <p className="text-xs text-gray-600">{pctHighRisk.toFixed(0)}% high-risk</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs font-semibold text-gray-700">{getRiskSeverity(avgChurnProbability)}</span>
          <span className="text-xs text-blue-600 font-medium hover:text-blue-800">Explore →</span>
        </div>
      </div>
    </Link>
  );
}
// app/components/RiskGauge.tsx
'use client';

import { getRiskBucket, getPredictedDays } from '@/app/lib/utils';

interface RiskGaugeProps {
  probability: number;
}

export default function RiskGauge({ probability }: RiskGaugeProps) {
  const riskBucket = getRiskBucket(probability);
  const predictedDays = getPredictedDays(probability);

  // Determine color based on probability
  let gaugeColor = '#22c55e'; // green
  let bgColor = 'bg-green-500';
  let textColor = 'text-green-700';

  if (probability >= 0.7) {
    gaugeColor = '#ef4444'; // red
    bgColor = 'bg-red-500';
    textColor = 'text-red-700';
  } else if (probability >= 0.5) {
    gaugeColor = '#f97316'; // orange
    bgColor = 'bg-orange-500';
    textColor = 'text-orange-700';
  } else if (probability >= 0.3) {
    gaugeColor = '#eab308'; // yellow
    bgColor = 'bg-yellow-500';
    textColor = 'text-yellow-700';
  }

  return (
    <div className="bg-white rounded-lg shadow p-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
        Churn Prediction
      </h3>

      {/* Gauge SVG */}
      <div className="flex justify-center mb-6">
        <svg width="200" height="150" viewBox="0 0 200 150">
          {/* Background arc */}
          <path
            d="M 30 130 A 70 70 0 0 1 170 130"
            stroke="#e5e7eb"
            strokeWidth="20"
            fill="none"
            strokeLinecap="round"
          />

          {/* Progress arc */}
          <path
            d="M 30 130 A 70 70 0 0 1 170 130"
            stroke={gaugeColor}
            strokeWidth="20"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${probability * 220} 220`}
          />

          {/* Center text */}
          <text
            x="100"
            y="100"
            textAnchor="middle"
            fontSize="32"
            fontWeight="bold"
            fill={gaugeColor}
          >
            {(probability * 100).toFixed(1)}%
          </text>
          <text
            x="100"
            y="120"
            textAnchor="middle"
            fontSize="12"
            fill="#6b7280"
          >
            Churn Probability
          </text>
        </svg>
      </div>

      {/* Risk Info Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`${bgColor} rounded-lg p-4 text-white text-center`}>
          <p className="text-sm opacity-90">Risk Level</p>
          <p className="text-2xl font-bold">{riskBucket}</p>
        </div>
        <div className="bg-blue-100 rounded-lg p-4 text-blue-900 text-center">
          <p className="text-sm">Predicted to Churn</p>
          <p className="text-2xl font-bold">~{predictedDays} days</p>
        </div>
      </div>

      {/* Explanation */}
      <div className={`border-l-4 pl-4 py-2 ${textColor}`}>
        <p className="text-sm">
          {probability >= 0.7 &&
            'This member is at very high risk of churning. Immediate intervention recommended.'}
          {probability >= 0.5 && probability < 0.7 &&
            'This member shows moderate churn risk. Consider proactive outreach.'}
          {probability >= 0.3 && probability < 0.5 &&
            'This member has some churn indicators. Monitor account activity.'}
          {probability < 0.3 &&
            'This member is at low risk. Continue normal account management.'}
        </p>
      </div>
    </div>
  );
}
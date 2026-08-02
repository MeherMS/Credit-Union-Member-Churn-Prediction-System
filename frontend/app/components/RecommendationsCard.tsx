// app/components/RecommendationsCard.tsx
'use client';

import { AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';

interface RecommendationsCardProps {
  probability: number;
}

export default function RecommendationsCard({ probability }: RecommendationsCardProps) {
  let recommendations: string[] = [];
  let icon: React.ReactNode;
  let bgColor: string;

  if (probability >= 0.7) {
    icon = <AlertCircle className="text-red-600" size={24} />;
    bgColor = 'bg-red-50 border-red-200';
    recommendations = [
      'Call member immediately to understand concerns',
      'Offer personalized retention incentives (fee waiver, higher rates)',
      'Escalate to account manager for 1-on-1 meeting',
      'Review recent account activity for red flags',
      'Consider retention specialist consultation',
    ];
  } else if (probability >= 0.5) {
    icon = <Lightbulb className="text-orange-600" size={24} />;
    bgColor = 'bg-orange-50 border-orange-200';
    recommendations = [
      'Schedule check-in call to assess satisfaction',
      'Review account for product cross-sell opportunities',
      'Offer enhanced digital banking features',
      'Provide personalized financial planning advice',
      'Monitor account for activity changes',
    ];
  } else if (probability >= 0.3) {
    icon = <Lightbulb className="text-yellow-600" size={24} />;
    bgColor = 'bg-yellow-50 border-yellow-200';
    recommendations = [
      'Continue regular account monitoring',
      'Send promotional offers aligned with member profile',
      'Encourage use of online banking tools',
      'Periodic satisfaction surveys',
      'Keep informed of new products/services',
    ];
  } else {
    icon = <CheckCircle className="text-green-600" size={24} />;
    bgColor = 'bg-green-50 border-green-200';
    recommendations = [
      'Member is highly satisfied - maintain good service',
      'Consider for loyalty/rewards program upgrade',
      'Potential advocate for referral programs',
      'Continue standard account management',
      'Regular relationship reviews',
    ];
  }

  return (
    <div className={`rounded-lg shadow border p-6 ${bgColor}`}>
      <div className="flex items-center space-x-3 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-gray-800">Recommended Actions</h3>
      </div>

      <ul className="space-y-3">
        {recommendations.map((rec, idx) => (
          <li key={idx} className="flex items-start space-x-3">
            <span className="text-blue-600 font-bold mt-1">•</span>
            <span className="text-gray-700">{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
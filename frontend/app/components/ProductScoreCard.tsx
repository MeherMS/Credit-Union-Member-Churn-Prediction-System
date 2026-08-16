"use client";

import { ProductScore } from "@/app/types";
import {
  CreditCard,
  Landmark,
  TrendingUp,
  Smartphone,
  Crown,
} from "lucide-react";

interface ProductScoreCardProps {
  productName: "credit_card" | "personal_loan" | "investment" | "mobile_banking" | "premium_account";
  score: ProductScore;
  isTopOpportunity: boolean;
}

const productConfig = {
  credit_card: {
    icon: CreditCard,
    label: "Credit Card",
    color: "from-blue-500 to-blue-600",
  },
  personal_loan: {
    icon: Landmark,
    label: "Personal Loan",
    color: "from-green-500 to-green-600",
  },
  investment: {
    icon: TrendingUp,
    label: "Investment Account",
    color: "from-purple-500 to-purple-600",
  },
  mobile_banking: {
    icon: Smartphone,
    label: "Mobile Banking",
    color: "from-orange-500 to-orange-600",
  },
  premium_account: {
    icon: Crown,
    label: "Premium Account",
    color: "from-yellow-500 to-yellow-600",
  },
};

function getProbabilityColor(prob: number): string {
  if (prob >= 0.7) return "bg-red-100 border-red-300";
  if (prob >= 0.5) return "bg-orange-100 border-orange-300";
  if (prob >= 0.3) return "bg-yellow-100 border-yellow-300";
  return "bg-gray-100 border-gray-300";
}

function getProbabilityBarColor(prob: number): string {
  if (prob >= 0.7) return "bg-red-500";
  if (prob >= 0.5) return "bg-orange-500";
  if (prob >= 0.3) return "bg-yellow-500";
  return "bg-gray-400";
}

export function ProductScoreCard({
  productName,
  score,
  isTopOpportunity,
}: ProductScoreCardProps) {
  const config = productConfig[productName];
  const Icon = config.icon;
  const percentage = Math.round(score.adoption_probability * 100);

  return (
    <div
      className={`rounded-lg border-2 p-6 transition-all hover:shadow-lg ${getProbabilityColor(score.adoption_probability)}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-full bg-gradient-to-br ${config.color} p-3`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{config.label}</h3>
            {score.has_product === 1 && (
              <p className="text-sm font-semibold text-green-600">✓ Already has</p>
            )}
            {score.has_product === 0 && (
              <p className="text-sm text-gray-600">Doesn't have</p>
            )}
          </div>
        </div>
        {isTopOpportunity && (
          <div className="rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 px-3 py-1">
            <span className="text-xs font-bold text-white">⭐ TOP PICK</span>
          </div>
        )}
      </div>

      {/* Probability Display */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Adoption Probability</span>
          <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-300">
          <div
            className={`h-full ${getProbabilityBarColor(score.adoption_probability)} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Recommendation */}
      <div className="rounded-md bg-white/50 p-3">
        <p className="text-sm text-gray-700">{score.recommendation}</p>
      </div>
    </div>
  );
}
"use client";

import { ProductPredictionResponse } from "@/app/types";
import { TrendingDown, Briefcase, Zap, AlertCircle } from "lucide-react";

interface ProductsSummaryProps {
  prediction: ProductPredictionResponse;
}

function getRiskColor(churnProb: number): string {
  if (churnProb >= 0.7) return "from-red-500 to-red-600";
  if (churnProb >= 0.5) return "from-orange-500 to-orange-600";
  if (churnProb >= 0.3) return "from-yellow-500 to-yellow-600";
  return "from-green-500 to-green-600";
}

function getRiskLabel(churnProb: number): string {
  if (churnProb >= 0.7) return "High Risk";
  if (churnProb >= 0.5) return "Medium Risk";
  if (churnProb >= 0.3) return "Low Risk";
  return "Safe";
}

function countOwnedProducts(prediction: ProductPredictionResponse): number {
  return Object.values(prediction.products).filter((p) => p.has_product === 1).length;
}

function countAvailableProducts(prediction: ProductPredictionResponse): number {
  return 5 - countOwnedProducts(prediction);
}

export function ProductsSummary({ prediction }: ProductsSummaryProps) {
  const churnProb = prediction.churn_probability;
  const ownedCount = countOwnedProducts(prediction);
  const availableCount = countAvailableProducts(prediction);
  const topOpportProb = Math.round(
    prediction.products[prediction.top_opportunity as keyof typeof prediction.products]?.adoption_probability * 100 || 0
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {/* Card 1: Churn Risk */}
      <div className={`rounded-lg bg-gradient-to-br ${getRiskColor(churnProb)} p-6 text-white`}>
        <div className="mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-semibold">Churn Risk</span>
        </div>
        <div className="text-3xl font-bold">{Math.round(churnProb * 100)}%</div>
        <p className="mt-1 text-sm opacity-90">{getRiskLabel(churnProb)}</p>
      </div>

      {/* Card 2: Products Owned */}
      <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
        <div className="mb-2 flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          <span className="text-sm font-semibold">Products Owned</span>
        </div>
        <div className="text-3xl font-bold">{ownedCount}</div>
        <p className="mt-1 text-sm opacity-90">out of 5</p>
      </div>

      {/* Card 3: Available Products */}
      <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
        <div className="mb-2 flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          <span className="text-sm font-semibold">Opportunities</span>
        </div>
        <div className="text-3xl font-bold">{availableCount}</div>
        <p className="mt-1 text-sm opacity-90">available products</p>
      </div>

      {/* Card 4: Top Opportunity */}
      <div className="rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 text-white">
        <div className="mb-2 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          <span className="text-sm font-semibold">Top Opportunity</span>
        </div>
        <div className="text-2xl font-bold capitalize">{prediction.top_opportunity}</div>
        <p className="mt-1 text-sm opacity-90">{topOpportProb}% probability</p>
      </div>
    </div>
  );
}
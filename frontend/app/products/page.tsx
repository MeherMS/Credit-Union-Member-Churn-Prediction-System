"use client";

import { useState } from "react";
import { useProductSearch } from "@/app/hooks/useProductSearch";
import { ProductSearchInput } from "@/app/components/ProductSearchInput";
import { ProductsSummary } from "@/app/components/ProductsSummary";
import { ProductScoreCard } from "@/app/components/ProductScoreCard";
import { Loader } from "lucide-react";

export default function ProductsPage() {
  const { prediction, memberDetails, loading, error, searchTerm, handleSearch, clearSearch } =
    useProductSearch();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Lead Scoring & Product Opportunities
          </h1>
          <p className="text-lg text-gray-600">
            Discover which products members are most likely to adopt
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-12 rounded-xl bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Search Member</h2>
          <ProductSearchInput
            onSearch={handleSearch}
            onClear={clearSearch}
            isLoading={loading}
            error={error}
            searchValue={searchTerm}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-white py-16 shadow-lg">
            <Loader className="h-12 w-12 animate-spin text-blue-500" />
            <p className="text-lg text-gray-600">Analyzing member profile and products...</p>
          </div>
        )}

        {/* Results Section */}
        {!loading && prediction && memberDetails && (
          <div className="space-y-8">
            {/* Member Profile Card */}
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Member Profile</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-600">Member ID</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">{memberDetails.member_id}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-600">Age</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">{memberDetails.age}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-600">Country</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">{memberDetails.country}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-600">Tenure</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">{memberDetails.tenure} years</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Overview</h2>
              <ProductsSummary prediction={prediction} />
            </div>

            {/* Products Section */}
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Product Opportunities</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Credit Card */}
                <ProductScoreCard
                  productName="credit_card"
                  score={prediction.products.credit_card}
                  isTopOpportunity={prediction.top_opportunity === "credit_card"}
                />

                {/* Personal Loan */}
                <ProductScoreCard
                  productName="personal_loan"
                  score={prediction.products.personal_loan}
                  isTopOpportunity={prediction.top_opportunity === "personal_loan"}
                />

                {/* Investment */}
                <ProductScoreCard
                  productName="investment"
                  score={prediction.products.investment}
                  isTopOpportunity={prediction.top_opportunity === "investment"}
                />

                {/* Mobile Banking */}
                <ProductScoreCard
                  productName="mobile_banking"
                  score={prediction.products.mobile_banking}
                  isTopOpportunity={prediction.top_opportunity === "mobile_banking"}
                />

                {/* Premium Account */}
                <ProductScoreCard
                  productName="premium_account"
                  score={prediction.products.premium_account}
                  isTopOpportunity={prediction.top_opportunity === "premium_account"}
                />
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-8 shadow-lg border-2 border-blue-200">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">📊 Recommended Actions</h2>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 text-white font-bold">
                      1
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Focus on {prediction.top_opportunity.replace(/_/g, " ").toUpperCase()}
                    </p>
                    <p className="text-gray-700 mt-1">
                      This member has the highest adoption probability for{" "}
                      <strong>
                        {prediction.top_opportunity.replace(/_/g, " ")} (
                        {Math.round(
                          prediction.products[
                            prediction.top_opportunity as keyof typeof prediction.products
                          ]?.adoption_probability * 100
                        )}
                        %)
                      </strong>
                      . Prioritize outreach for this product.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-500 text-white font-bold">
                      2
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Consider Cross-Sell Opportunities</p>
                    <p className="text-gray-700 mt-1">
                      Products with 50%+ probability are good candidates:{" "}
                      <strong>
                        {Object.entries(prediction.products)
                          .filter(
                            ([_, score]) =>
                              score.adoption_probability >= 0.5 &&
                              score.has_product === 0
                          )
                          .map(([name]) => name.replace(/_/g, " "))
                          .join(", ") || "None"}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-500 text-white font-bold">
                      3
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Monitor Churn Risk</p>
                    <p className="text-gray-700 mt-1">
                      Churn probability is{" "}
                      <strong>
                        {Math.round(prediction.churn_probability * 100)}%
                      </strong>
                      . {prediction.churn_probability >= 0.5 ? "⚠️ High risk - prioritize retention" : "✓ Low risk - good retention candidate"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 md:flex-row justify-center">
              <button
                onClick={clearSearch}
                className="rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 transition-colors"
              >
                ← Search Another Member
              </button>
              <button
                onClick={() => window.print()}
                className="rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 transition-colors"
              >
                🖨️ Print Report
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !prediction && !error && (
          <div className="rounded-xl bg-white p-16 text-center shadow-lg">
            <div className="mb-4 text-5xl">🔍</div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">No Member Selected</h2>
            <p className="text-gray-600">
              Search for a member ID above to see their product adoption opportunities
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
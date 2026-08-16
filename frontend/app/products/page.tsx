"use client";

import { useState } from "react";
import { useProductSearch } from "@/app/hooks/useProductSearch";
import { useMembersList } from "@/app/hooks/useMembersList";
import { ProductSearchInput } from "@/app/components/ProductSearchInput";
import { MembersListSelector } from "@/app/components/MembersListSelector";
import { ProductsSummary } from "@/app/components/ProductsSummary";
import { ProductScoreCard } from "@/app/components/ProductScoreCard";
import { Loader } from "lucide-react";
import { MemberForProducts  } from "@/app/types";
import  Layout  from "@/app/components/Layout";

export default function ProductsPage() {
  const { prediction, memberDetails, loading, error, searchTerm, handleSearch, clearSearch } =
    useProductSearch();

  const {
    members,
    loading: membersLoading,
    error: membersError,
    page: currentPage,
    totalPages,
    country,
    riskLevel,
    searchId,
    nextPage,
    prevPage,
    handleCountryChange,
    handleRiskChange,
    handleSearchChange,
  } = useMembersList(15);

  const [activeTab, setActiveTab] = useState<"search" | "browse" | "results">("browse");

  const handleMemberSelect = (member: MemberForProducts) => {
    handleSearch(member.member_id);
    setActiveTab("results");
  };

  return (
    <Layout>
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

        {/* Tabs Navigation */}
        <div className="mb-8 flex gap-2 border-b border-gray-300">
          <button
            onClick={() => setActiveTab("browse")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "browse"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📋 Browse Members
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "search"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            🔍 Search Member
          </button>
          {prediction && (
            <button
              onClick={() => setActiveTab("results")}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === "results"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📊 Results
            </button>
          )}
        </div>

        {/* TAB 1: Browse Members */}
        {activeTab === "browse" && (
          <MembersListSelector
            members={members}
            loading={membersLoading}
            error={membersError}
            currentPage={currentPage}
            totalPages={totalPages}
            country={country}
            riskLevel={riskLevel}
            searchId={searchId}
            onCountryChange={handleCountryChange}
            onRiskChange={handleRiskChange}
            onSearchChange={handleSearchChange}
            onMemberSelect={handleMemberSelect}
            onNextPage={nextPage}
            onPrevPage={prevPage}
          />
        )}

        {/* TAB 2: Search Member */}
        {activeTab === "search" && (
          <div className="rounded-xl bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Search Member by ID</h2>
            <ProductSearchInput
              onSearch={handleSearch}
              onClear={clearSearch}
              isLoading={loading}
              error={error}
              searchValue={searchTerm}
            />
          </div>
        )}

        {/* TAB 3: Results */}
        {activeTab === "results" && loading && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-white py-16 shadow-lg">
            <Loader className="h-12 w-12 animate-spin text-blue-500" />
            <p className="text-lg text-gray-600">Analyzing member profile and products...</p>
          </div>
        )}

        {activeTab === "results" && !loading && prediction && memberDetails && (
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
                onClick={() => {
                  clearSearch();
                  setActiveTab("browse");
                }}
                className="rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 transition-colors"
              >
                ← Browse More Members
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
      </div>
    </div>
    </Layout>);
}
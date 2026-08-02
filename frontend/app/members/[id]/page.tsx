'use client';

import { useState } from 'react';
import Layout from '@/app/components/Layout';
import MemberInfoCard from '@/app/components/MemberInfoCard';
import RiskGauge from '@/app/components/RiskGauge';
import FeatureRadarChart from '@/app/components/FeatureRadarChart';
import RecommendationsCard from '@/app/components/RecommendationsCard';
import { useMemberProfile } from '@/app/hooks/useMemberProfile';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function MemberDetailPage() {
  const params = useParams();
  const memberId = params.id as string;

  const { data, loading, error } = useMemberProfile(memberId);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading member profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link
            href="/members"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Members
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-4 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-red-900">Error Loading Member</h2>
                <p className="text-red-700 mt-2">
                  {error || `Member ${memberId} not found`}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Prepare feature importance data
  const featureImportanceData = (data.top_risk_factors || []).slice(0, 5).map((factor, index) => ({
    feature: factor,
    importance: ((5 - index) / 5) * 100, // Decreasing importance
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/members"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Members
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Member Profile: {data.member_id}
          </h1>
          <p className="text-gray-600 mt-2">
            Age {data.age} • {data.country} • {data.gender}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column: Info & Gauge */}
          <div className="lg:col-span-2 space-y-8">
            {/* Member Info */}
            <MemberInfoCard
              member={{
                member_id: data.member_id,
                age: data.age,
                gender: data.gender,
                country: data.country,
                credit_score: data.credit_score,
                balance: data.balance,
                estimated_salary: data.estimated_salary,
                tenure: data.tenure,
                products_number: data.products_number,
                credit_card: data.credit_card,
                active_member: data.active_member,
              }}
            />

            {/* Churn Risk Gauge */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Churn Risk Assessment</h2>
              <RiskGauge probability={data.churn_probability} />
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Churn Probability</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(data.churn_probability * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Predicted Days to Churn</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.days_to_churn ? `${data.days_to_churn} days` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Importance */}
            {featureImportanceData.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Top Risk Factors
                </h2>
                <FeatureRadarChart data={featureImportanceData} />
              </div>
            )}
          </div>

          {/* Right Column: Recommendations */}
          <div className="lg:col-span-1">
            <RecommendationsCard probability={data.churn_probability} />
          </div>
        </div>

        {/* Account Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Account Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Tenure</span>
                <span className="font-semibold text-gray-900">{data.tenure} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Products Owned</span>
                <span className="font-semibold text-gray-900">{data.products_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Credit Card</span>
                <span className="font-semibold text-gray-900">
                  {data.credit_card === 1 ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Member</span>
                <span className="font-semibold text-gray-900">
                  {data.active_member === 1 ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="border-t pt-4 flex justify-between">
                <span className="text-gray-600">Credit Score</span>
                <span className="font-semibold text-gray-900">{data.credit_score}</span>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Account Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.balance)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Estimated Annual Salary</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.estimated_salary)}
                </p>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-1">Balance to Salary Ratio</p>
                <p className="text-lg font-semibold text-gray-900">
                  {((data.balance / data.estimated_salary) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
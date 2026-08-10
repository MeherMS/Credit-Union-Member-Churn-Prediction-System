'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Layout from '@/app/components/Layout';
import SummaryCard from '@/app/components/SummaryCard';
import { useHouseholdDetail } from '@/app/hooks/useHouseholds';
import { AlertTriangle, Users, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function HouseholdDetailPage() {
  const params = useParams();
  const householdId = params.id as string;

  const { data: household, loading, error } = useHouseholdDetail(householdId);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading household details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-4 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-red-900">Error Loading Household</h2>
                <p className="text-red-700 mt-2">{error}</p>
                <Link
                  href="/households"
                  className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Back to Households
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!household) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-gray-600">Household not found.</p>
          <Link href="/households" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← Back to Households
          </Link>
        </div>
      </Layout>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const formatPercentage = (val: number) => {
    return (val * 100).toFixed(1) + '%';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High Risk':
        return 'bg-red-100 text-red-800';
      case 'Medium Risk':
        return 'bg-orange-100 text-orange-800';
      case 'Low Risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'Safe':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Risk level distribution (hypothetical - would need member-level data)
  const riskDistribution = [
    {
      name: 'High Risk',
      value: Math.round(household.weighted_churn_probability * household.member_count),
      fill: '#ef4444',
    },
    {
      name: 'Medium Risk',
      value: Math.round((1 - household.weighted_churn_probability) * household.member_count * 0.4),
      fill: '#f97316',
    },
    {
      name: 'Low Risk',
      value: Math.round((1 - household.weighted_churn_probability) * household.member_count * 0.6),
      fill: '#eab308',
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/households" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Households
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{household.household_id}</h1>
              <p className="text-gray-600 mt-1">Household Details & Analysis</p>
            </div>
            <span className={`px-4 py-2 rounded-lg text-lg font-semibold ${getRiskColor(household.risk_bucket)}`}>
              {household.risk_bucket}
            </span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            title="Members"
            value={household.member_count}
            icon={Users}
            bgColor="bg-blue-500"
            textColor="text-blue-700"
          />
          <SummaryCard
            title="Combined Balance"
            value={formatCurrency(household.combined_balance)}
            icon={DollarSign}
            bgColor="bg-green-500"
            textColor="text-green-700"
          />
          <SummaryCard
            title="Avg Credit Score"
            value={Math.round(household.avg_credit_score)}
            icon={TrendingUp}
            bgColor="bg-purple-500"
            textColor="text-purple-700"
          />
          <SummaryCard
            title="Churn Probability"
            value={formatPercentage(household.weighted_churn_probability)}
            icon={AlertTriangle}
            bgColor="bg-red-500"
            textColor="text-red-700"
          />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Detailed Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Household Profile</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-700">Household Value</span>
                <span className="font-semibold text-gray-900 uppercase">
                  {household.household_value}
                </span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-700">Average Age</span>
                <span className="font-semibold text-gray-900">
                  {household.avg_age.toFixed(1)} years
                </span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-700">Average Tenure</span>
                <span className="font-semibold text-gray-900">
                  {household.avg_tenure.toFixed(1)} years
                </span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-700">Total Products</span>
                <span className="font-semibold text-gray-900">
                  {household.products_number} products
                </span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-700">Average Credit Score</span>
                <span className="font-semibold text-gray-900">
                  {household.avg_credit_score.toFixed(0)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-700">Churn Probability</span>
                <span className="font-semibold text-gray-900">
                  {formatPercentage(household.weighted_churn_probability)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Risk Distribution Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Estimated Risk Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Estimated based on household churn probability
            </p>
          </div>
        </div>

        {/* Members in Household */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Members in This Household</h2>

          {household.member_ids && household.member_ids.length > 0 ? (
            <div className="space-y-3">
              {household.member_ids.map((memberId) => (
                <div
                  key={memberId}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{memberId}</p>
                    <p className="text-sm text-gray-600">Member ID</p>
                  </div>
                  <Link
                    href={`/members/${memberId}`}
                    className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 rounded transition"
                  >
                    View Profile
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No members found in this household.</p>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Recommended Actions</h2>
          <ul className="space-y-3 text-blue-900">
            {household.weighted_churn_probability >= 0.7 && (
              <>
                <li className="flex items-start">
                  <span className="text-blue-600 font-bold mr-3">•</span>
                  <span>
                    <strong>Urgent:</strong> This household has high churn risk. Consider immediate
                    retention outreach.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 font-bold mr-3">•</span>
                  <span>
                    <strong>Intervention:</strong> Schedule a personal call from account manager to
                    understand concerns.
                  </span>
                </li>
              </>
            )}
            {household.weighted_churn_probability >= 0.5 && household.weighted_churn_probability < 0.7 && (
              <>
                <li className="flex items-start">
                  <span className="text-blue-600 font-bold mr-3">•</span>
                  <span>
                    <strong>Monitor:</strong> This household shows medium churn risk. Increase
                    engagement.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 font-bold mr-3">•</span>
                  <span>
                    <strong>Offer:</strong> Consider offering personalized products or loyalty rewards.
                  </span>
                </li>
              </>
            )}
            {household.combined_balance >= 150000 && (
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">•</span>
                <span>
                  <strong>Premium Segment:</strong> This is a high-value household. Ensure premium
                  service levels.
                </span>
              </li>
            )}
            {household.member_count > 1 && (
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">•</span>
                <span>
                  <strong>Family Account:</strong> Consider offering family packages or bundled
                  services.
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
'use client';

import { useState } from 'react';
import Layout from '@/app/components/Layout';
import HouseholdCard from '@/app/components/HouseholdCard';
import SummaryCard from '@/app/components/SummaryCard';
import { useHouseholds } from '@/app/hooks/useHouseholds';
import { useAnalyticsSummary } from '@/app/hooks/useCohorts';
import { AlertTriangle, Home, DollarSign, TrendingUp } from 'lucide-react';
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

export default function HouseholdsPage() {
  const [page, setPage] = useState(0);
  const [riskFilter, setRiskFilter] = useState('');
  const [sortBy, setSortBy] = useState<'risk' | 'value'>('risk');

  const limit = 12; // 12 cards per page
  const skip = page * limit;

  const { data, loading, error } = useHouseholds(skip, limit, riskFilter, sortBy);
  const { data: analyticsData, loading: analyticsLoading } = useAnalyticsSummary();

  if (loading || analyticsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading households...</p>
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
                <h2 className="text-lg font-semibold text-red-900">Error Loading Households</h2>
                <p className="text-red-700 mt-2">{error}</p>
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

  if (!data || !analyticsData) {
    return (
      <Layout>
        <div className="text-center text-gray-600">No household data available.</div>
      </Layout>
    );
  }

  const householdStats = analyticsData.households;
  const totalHouseholds = householdStats.total;
  const totalMembers = analyticsData.cohorts.cohorts.reduce(
    (sum, cohort) => sum + cohort.characteristics.member_count,
    0
  );

  // Risk distribution data for bar chart
  const riskDistributionData = [
    { name: 'High Risk', value: householdStats.high_risk, fill: '#ef4444' },
    { name: 'Medium Risk', value: householdStats.medium_risk, fill: '#f97316' },
    { name: 'Low Risk', value: householdStats.low_risk, fill: '#eab308' },
    { name: 'Safe', value: householdStats.safe, fill: '#22c55e' },
  ];

  // Household value distribution for pie chart
  const householdValueData = data.households.reduce(
    (acc, hh) => {
      const existing = acc.find((item) => item.name === hh.household_value);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({
          name: hh.household_value.charAt(0).toUpperCase() + hh.household_value.slice(1),
          value: 1,
        });
      }
      return acc;
    },
    [] as Array<{ name: string; value: number }>
  );

  const valueColors = {
    Premium: '#fbbf24',
    Standard: '#60a5fa',
    Starter: '#d1d5db',
  };

  const totalPages = Math.ceil(data.total / limit);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Household Analytics</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            title="Total Households"
            value={totalHouseholds.toLocaleString()}
            icon={Home}
            bgColor="bg-blue-500"
            textColor="text-blue-700"
          />
          <SummaryCard
            title="Total Members"
            value={totalMembers.toLocaleString()}
            icon={TrendingUp}
            bgColor="bg-purple-500"
            textColor="text-purple-700"
          />
          <SummaryCard
            title="High-Risk Households"
            value={householdStats.high_risk.toLocaleString()}
            icon={AlertTriangle}
            bgColor="bg-red-500"
            textColor="text-red-700"
          />
          <SummaryCard
            title="Avg Household Balance"
            value={`$${(householdStats.top_at_risk.reduce((sum, hh) => sum + hh.combined_balance, 0) / householdStats.top_at_risk.length / 1000).toFixed(0)}K`}
            icon={DollarSign}
            bgColor="bg-green-500"
            textColor="text-green-700"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Risk Distribution Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Household Risk Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Household Value Distribution Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Household Value Segments</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={householdValueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {householdValueData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={valueColors[entry.name as keyof typeof valueColors]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top At-Risk Households */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Top 5 At-Risk Households</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {householdStats.top_at_risk.slice(0, 5).map((hh) => (
              <HouseholdCard
                key={hh.household_id}
                householdId={hh.household_id}
                memberCount={hh.member_count}
                combinedBalance={hh.combined_balance}
                riskBucket={hh.risk_bucket}
                churnProbability={hh.weighted_churn_probability}
                householdValue={hh.household_value}
              />
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
              <select
                value={riskFilter}
                onChange={(e) => {
                  setRiskFilter(e.target.value);
                  setPage(0);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                <option value="High Risk">High Risk</option>
                <option value="Medium Risk">Medium Risk</option>
                <option value="Low Risk">Low Risk</option>
                <option value="Safe">Safe</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as 'risk' | 'value');
                  setPage(0);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="risk">Risk (High First)</option>
                <option value="value">Balance (High First)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setRiskFilter('');
                  setSortBy('risk');
                  setPage(0);
                }}
                className="w-full px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Households Grid */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">All Households</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {data.households.map((hh) => (
              <HouseholdCard
                key={hh.household_id}
                householdId={hh.household_id}
                memberCount={hh.member_count}
                combinedBalance={hh.combined_balance}
                riskBucket={hh.risk_bucket}
                churnProbability={hh.weighted_churn_probability}
                householdValue={hh.household_value}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {skip + 1} to {Math.min(skip + limit, data.total)} of {data.total} households
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`px-3 py-2 rounded-lg ${
                      page === i
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
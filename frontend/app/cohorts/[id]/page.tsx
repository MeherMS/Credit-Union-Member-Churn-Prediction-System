'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import Layout from '@/app/components/Layout';
import SummaryCard from '@/app/components/SummaryCard';
import { useCohortDetail, useCohortMembers } from '@/app/hooks/useCohorts';
import { AlertTriangle, Users, TrendingUp, Layers } from 'lucide-react';
import Link from 'next/link';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function CohortDetailPage() {
  const params = useParams();
  const cohortId = parseInt(params.id as string);
  const [page, setPage] = useState(0);

  const limit = 15; // Members per page
  const skip = page * limit;

  const { data: cohort, loading: cohortLoading, error: cohortError } = useCohortDetail(cohortId);
  const { data: membersData, loading: membersLoading, error: membersError } = useCohortMembers(
    cohortId,
    skip,
    limit
  );

  if (cohortLoading || membersLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading cohort details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (cohortError) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-4 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-red-900">Error Loading Cohort</h2>
                <p className="text-red-700 mt-2">{cohortError}</p>
                <Link
                  href="/cohorts"
                  className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Back to Cohorts
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!cohort) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-gray-600">Cohort not found.</p>
          <Link href="/cohorts" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← Back to Cohorts
          </Link>
        </div>
      </Layout>
    );
  }

  // Radar chart data
  const radarData = [
    {
      category: 'Tenure',
      value: Math.min(100, (cohort.characteristics.avg_tenure / 10) * 100),
    },
    {
      category: 'Balance',
      value: Math.min(100, (cohort.characteristics.avg_balance / 250000) * 100),
    },
    {
      category: 'Products',
      value: Math.min(100, (cohort.characteristics.avg_products / 4) * 100),
    },
    {
      category: 'Credit Score',
      value: Math.min(100, (cohort.characteristics.avg_credit_score / 850) * 100),
    },
    {
      category: 'Activity Rate',
      value: cohort.characteristics.avg_active_member_rate,
    },
  ];

  // Risk distribution pie chart
  const riskDistribution = [
    { name: 'High Risk', value: cohort.risk_profile.pct_high_risk, fill: '#ef4444' },
    { name: 'Medium Risk', value: cohort.risk_profile.pct_medium_risk, fill: '#f97316' },
    { name: 'Low Risk', value: cohort.risk_profile.pct_low_risk, fill: '#eab308' },
    { name: 'Safe', value: cohort.risk_profile.pct_safe, fill: '#22c55e' },
  ];

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

  const cohortColors = ['#3b82f6', '#ef4444', '#f97316', '#eab308', '#22c55e', '#8b5cf6'];
  const cohortColor = cohortColors[cohort.cohort_id];

  const totalPages = membersData ? Math.ceil(membersData.total_members / limit) : 1;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cohorts" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Cohorts
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{cohort.cohort_name}</h1>
              <p className="text-gray-600 mt-2">{cohort.description}</p>
            </div>
            <div
              className="px-4 py-2 rounded-lg text-lg font-semibold text-white"
              style={{ backgroundColor: cohortColor }}
            >
              Cohort {cohort.cohort_id}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            title="Total Members"
            value={cohort.characteristics.member_count.toLocaleString()}
            icon={Users}
            bgColor="bg-blue-500"
            textColor="text-blue-700"
          />
          <SummaryCard
            title="% of Total"
            value={`${cohort.size_percentage.toFixed(1)}%`}
            icon={Layers}
            bgColor="bg-purple-500"
            textColor="text-purple-700"
          />
          <SummaryCard
            title="Avg Churn Risk"
            value={formatPercentage(cohort.risk_profile.avg_churn_probability)}
            icon={TrendingUp}
            bgColor="bg-red-500"
            textColor="text-red-700"
          />
          <SummaryCard
            title="High-Risk Members"
            value={`${cohort.risk_profile.pct_high_risk.toFixed(1)}%`}
            icon={AlertTriangle}
            bgColor="bg-orange-500"
            textColor="text-orange-700"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Radar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cohort Characteristics</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Profile"
                  dataKey="value"
                  stroke={cohortColor}
                  fill={cohortColor}
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Distribution Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Characteristics */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Detailed Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Average Age</p>
              <p className="text-2xl font-bold text-gray-900">{cohort.characteristics.avg_age.toFixed(1)}</p>
              <p className="text-xs text-gray-600 mt-1">years</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Average Tenure</p>
              <p className="text-2xl font-bold text-gray-900">{cohort.characteristics.avg_tenure.toFixed(1)}</p>
              <p className="text-xs text-gray-600 mt-1">years</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Average Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(cohort.characteristics.avg_balance)}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Avg Products</p>
              <p className="text-2xl font-bold text-gray-900">{cohort.characteristics.avg_products.toFixed(1)}</p>
              <p className="text-xs text-gray-600 mt-1">per member</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Average Credit Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {cohort.characteristics.avg_credit_score.toFixed(0)}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Active Member Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {(cohort.characteristics.avg_active_member_rate * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Members ({membersData?.total_members || 0})
          </h2>

          {membersData && membersData.members.length > 0 ? (
            <>
              <div className="overflow-x-auto mb-6">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Member ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cohort</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membersData.members.map((member) => (
                      <tr key={member.member_id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{member.member_id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{member.cohort_name}</td>
                        <td className="px-6 py-4 text-sm">
                          <Link
                            href={`/members/${member.member_id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View Profile
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {skip + 1} to {Math.min(skip + limit, membersData.total_members)} of{' '}
                  {membersData.total_members} members
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
            </>
          ) : (
            <p className="text-gray-600">No members found in this cohort.</p>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Cohort Strategy</h2>
          <ul className="space-y-3 text-blue-900">
            {cohort.risk_profile.avg_churn_probability >= 0.55 && (
              <>
                <li className="flex items-start">
                  <span className="text-blue-600 font-bold mr-3">•</span>
                  <span>
                    <strong>High-Risk Segment:</strong> This cohort has elevated churn risk. Consider
                    targeted retention campaigns.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 font-bold mr-3">•</span>
                  <span>
                    <strong>Engagement Focus:</strong> Increase touchpoints and personalized offers to
                    re-engage members.
                  </span>
                </li>
              </>
            )}
            {cohort.risk_profile.avg_churn_probability >= 0.5 && cohort.risk_profile.avg_churn_probability < 0.55 && (
              <>
                <li className="flex items-start">
                  <span className="text-blue-600 font-bold mr-3">•</span>
                  <span>
                    <strong>Monitor Closely:</strong> This cohort shows moderate churn risk. Regular
                    monitoring recommended.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 font-bold mr-3">•</span>
                  <span>
                    <strong>Cross-sell Opportunities:</strong> Use engagement campaigns to introduce new
                    products.
                  </span>
                </li>
              </>
            )}
            {cohort.characteristics.avg_balance >= 150000 && (
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">•</span>
                <span>
                  <strong>Premium Opportunity:</strong> High-value cohort. Provide premium service and
                  exclusive benefits.
                </span>
              </li>
            )}
            {cohort.characteristics.avg_active_member_rate >= 0.8 && (
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">•</span>
                <span>
                  <strong>Loyalty Program:</strong> Highly engaged cohort. Perfect for loyalty rewards
                  and advocacy programs.
                </span>
              </li>
            )}
            {cohort.characteristics.avg_tenure >= 8 && (
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">•</span>
                <span>
                  <strong>Long-term Value:</strong> Established customers. Focus on deepening relationships
                  and life-stage products.
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
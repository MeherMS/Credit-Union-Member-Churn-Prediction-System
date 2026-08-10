'use client';

import { useState } from 'react';
import Layout from '@/app/components/Layout';
import CohortCard from '@/app/components/CohortCard';
import SummaryCard from '@/app/components/SummaryCard';
import { useCohorts } from '@/app/hooks/useCohorts';
import { AlertTriangle, Layers, Users, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function CohortsPage() {
  const { data, loading, error } = useCohorts();
  const [selectedCohort, setSelectedCohort] = useState<number | null>(null);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading cohorts...</p>
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
                <h2 className="text-lg font-semibold text-red-900">Error Loading Cohorts</h2>
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

  if (!data || !data.cohorts) {
    return (
      <Layout>
        <div className="text-center text-gray-600">No cohort data available.</div>
      </Layout>
    );
  }

  const cohorts = data.cohorts;
  const totalCohorts = data.total_cohorts;
  const totalMembers = data.total_members;

  // Member distribution by cohort for bar chart
  const memberDistributionData = cohorts.map((cohort) => ({
    name: `${cohort.cohort_name.substring(0, 12)}...`,
    members: cohort.characteristics.member_count,
    fill: ['#3b82f6', '#ef4444', '#f97316', '#eab308', '#22c55e', '#8b5cf6'][cohort.cohort_id],
  }));

  // Churn rate by cohort for bar chart
  const churnRateData = cohorts.map((cohort) => ({
    name: `Cohort ${cohort.cohort_id}`,
    'Churn Rate': parseFloat((cohort.risk_profile.avg_churn_probability * 100).toFixed(1)),
    'High Risk %': cohort.risk_profile.pct_high_risk,
  }));

  // Select a cohort for detailed radar chart (default to first)
  const displayedCohort = selectedCohort !== null ? cohorts.find((c) => c.cohort_id === selectedCohort) : cohorts[0];

  // Normalize characteristics for radar chart (0-100 scale)
  const radarData = displayedCohort
    ? [
        {
          category: 'Tenure',
          value: Math.min(100, (displayedCohort.characteristics.avg_tenure / 10) * 100),
        },
        {
          category: 'Balance',
          value: Math.min(100, (displayedCohort.characteristics.avg_balance / 250000) * 100),
        },
        {
          category: 'Products',
          value: Math.min(100, (displayedCohort.characteristics.avg_products / 4) * 100),
        },
        {
          category: 'Credit Score',
          value: Math.min(100, (displayedCohort.characteristics.avg_credit_score / 850) * 100),
        },
        {
          category: 'Activity Rate',
          value: displayedCohort.characteristics.avg_active_member_rate,
        },
      ]
    : [];

  const riskColors = ['#3b82f6', '#ef4444', '#f97316', '#eab308', '#22c55e', '#8b5cf6'];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Behavioral Cohort Analysis</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            title="Total Cohorts"
            value={totalCohorts}
            icon={Layers}
            bgColor="bg-blue-500"
            textColor="text-blue-700"
          />
          <SummaryCard
            title="Total Members"
            value={totalMembers.toLocaleString()}
            icon={Users}
            bgColor="bg-purple-500"
            textColor="text-purple-700"
          />
          <SummaryCard
            title="Avg Churn Risk"
            value={`${(cohorts.reduce((sum, c) => sum + c.risk_profile.avg_churn_probability, 0) / cohorts.length * 100).toFixed(1)}%`}
            icon={TrendingUp}
            bgColor="bg-orange-500"
            textColor="text-orange-700"
          />
          <SummaryCard
            title="Largest Cohort"
            value={`${Math.max(...cohorts.map((c) => c.characteristics.member_count)).toLocaleString()} members`}
            icon={Users}
            bgColor="bg-green-500"
            textColor="text-green-700"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Member Distribution Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Members per Cohort</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={memberDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="members" radius={[8, 8, 0, 0]}>
                  {memberDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Churn Rate by Cohort */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Churn Rates by Cohort</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={churnRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Churn Rate" fill="#ef4444" radius={[8, 8, 0, 0]} />
                <Bar dataKey="High Risk %" fill="#f97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cohort Characteristics Radar Chart */}
        {displayedCohort && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {displayedCohort.cohort_name} - Characteristics Profile
            </h2>
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Profile"
                      dataKey="value"
                      stroke={riskColors[displayedCohort.cohort_id]}
                      fill={riskColors[displayedCohort.cohort_id]}
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Description</p>
                  <p className="text-sm text-gray-900">{displayedCohort.description}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Members</p>
                  <p className="text-xl font-bold text-gray-900">
                    {displayedCohort.characteristics.member_count.toLocaleString()}
                    <span className="text-sm text-gray-600 ml-2">({displayedCohort.size_percentage.toFixed(1)}%)</span>
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Avg Churn Risk</p>
                  <p className="text-xl font-bold text-gray-900">
                    {(displayedCohort.risk_profile.avg_churn_probability * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Cohort Selector */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm font-semibold text-gray-700 mb-3">Select Different Cohort:</p>
              <div className="flex flex-wrap gap-2">
                {cohorts.map((cohort) => (
                  <button
                    key={cohort.cohort_id}
                    onClick={() => setSelectedCohort(cohort.cohort_id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      selectedCohort === cohort.cohort_id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    Cohort {cohort.cohort_id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Cohorts Grid */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">All Cohorts Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cohorts.map((cohort) => (
              <CohortCard
                key={cohort.cohort_id}
                cohortId={cohort.cohort_id}
                cohortName={cohort.cohort_name}
                description={cohort.description}
                memberCount={cohort.characteristics.member_count}
                sizePercentage={cohort.size_percentage}
                avgChurnProbability={cohort.risk_profile.avg_churn_probability}
                pctHighRisk={cohort.risk_profile.pct_high_risk}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
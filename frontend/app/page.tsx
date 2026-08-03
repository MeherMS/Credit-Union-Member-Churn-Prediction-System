'use client';

import { useState, useEffect } from 'react';
import Layout from '@/app/components/Layout';
import SummaryCard from '@/app/components/SummaryCard';
import RiskDistributionChart from '@/app/components/RiskDistributionChart';
import TopAtRiskTable from '@/app/components/TopAtRiskTable';
import { useDashboardData } from '@/app/hooks/useDashboardData';
import { AlertTriangle, Users, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { data, loading, error } = useDashboardData();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-red-900">Error Loading Dashboard</h2>
                <p className="text-red-700 mt-2">
                  {error || 'Failed to load dashboard data. Please check if the backend is running.'}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => (window.location.href = '/')}
                    className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 font-medium"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Safe number conversion
  const safeNumber = (val: any): number => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  const summary = {
    total_members: safeNumber(data.summary.members),
    high_risk: safeNumber(data.summary.high_risk),
    medium_risk: safeNumber(data.summary.medium_risk),
    low_risk: safeNumber(data.summary.low_risk),
    safe: safeNumber(data.summary.safe),
  };

  // Transform data for charts
  const riskDistribution = [
    { name: 'High Risk', value: summary.high_risk, fill: '#ef4444' },
    { name: 'Medium Risk', value: summary.medium_risk, fill: '#f97316' },
    { name: 'Low Risk', value: summary.low_risk, fill: '#eab308' },
    { name: 'Safe', value: summary.safe, fill: '#22c55e' },
  ];

  const total = summary.total_members;
  const highRiskPercentage = total > 0 ? ((summary.high_risk / total) * 100).toFixed(1) : '0';
  const mediumRiskPercentage = total > 0 ? ((summary.medium_risk / total) * 100).toFixed(1) : '0';
  const safePercentage = total > 0 ? ((summary.safe / total) * 100).toFixed(1) : '0';

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* API Status Indicator */}
        <div className="mb-6 flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700">API Connected</span>
          </div>
          <span className="text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            title="Total Members"
            value={summary.total_members.toLocaleString()}
            icon={Users}
            bgColor="bg-blue-500"
            textColor="text-blue-700"
          />
          <SummaryCard
            title="High Risk"
            value={summary.high_risk.toString()}
            icon={AlertTriangle}
            bgColor="bg-red-500"
            textColor="text-red-700"
          />
          <SummaryCard
            title="Medium Risk"
            value={summary.medium_risk.toString()}
            icon={TrendingUp}
            bgColor="bg-orange-500"
            textColor="text-orange-700"
          />
          <SummaryCard
            title="Safe"
            value={summary.safe.toString()}
            icon={Users}
            bgColor="bg-green-500"
            textColor="text-green-700"
          />
        </div>

        {/* Quick Stats & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Risk Distribution Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h2>
            <RiskDistributionChart data={riskDistribution} />
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">High Risk Percentage</span>
                <span className="text-2xl font-bold text-red-600">{highRiskPercentage}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: `${highRiskPercentage}%` }}></div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-gray-600">Medium Risk Percentage</span>
                <span className="text-2xl font-bold text-orange-600">{mediumRiskPercentage}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500" style={{ width: `${mediumRiskPercentage}%` }}></div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-gray-600">Safe Members</span>
                <span className="text-2xl font-bold text-green-600">{safePercentage}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${safePercentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top At-Risk Members */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 10 At-Risk Members</h2>
          <TopAtRiskTable members={data.top_at_risk_members} />
        </div>
      </div>
    </Layout>
  );
}
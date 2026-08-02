'use client';

import { useState } from 'react';
import Layout from '@/app/components/Layout';
import { useReportGenerator } from '@/app/hooks/useReportGenerator';
import { AlertTriangle, FileText, CheckCircle, Loader } from 'lucide-react';

export default function ReportsPage() {
  const { generateReport, loading, error, success, reset } = useReportGenerator();

  // Form state
  const [format, setFormat] = useState<'pdf' | 'xlsx'>('pdf');
  const [country, setCountry] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [minRisk, setMinRisk] = useState('');
  const [maxRisk, setMaxRisk] = useState('');

  const handleGenerateReport = async () => {
    const filters = {
      format,
      country: country || undefined,
      min_age: minAge ? parseInt(minAge) : undefined,
      max_age: maxAge ? parseInt(maxAge) : undefined,
      min_risk_level: minRisk ? parseFloat(minRisk) / 100 : undefined,
      max_risk_level: maxRisk ? parseFloat(maxRisk) / 100 : undefined,
    };

    await generateReport(filters);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Generate Executive Report</h1>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-green-600 mr-4 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-green-900">Report Generated!</h2>
                <p className="text-green-700 mt-2">
                  Your report has been generated and is downloading now.
                </p>
                <button
                  onClick={reset}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                >
                  Generate Another Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-4 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-red-900">Error Generating Report</h2>
                <p className="text-red-700 mt-2">{error}</p>
                <button
                  onClick={reset}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {!success && (
          <>
            {/* Report Format Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div
                onClick={() => setFormat('pdf')}
                className={`p-6 rounded-lg border-2 cursor-pointer transition ${
                  format === 'pdf'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <FileText className={`w-8 h-8 mb-3 ${format === 'pdf' ? 'text-blue-600' : 'text-gray-600'}`} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Report</h3>
                <p className="text-gray-600 text-sm">
                  Professional PDF format with charts and summaries. Perfect for printing and
                  sharing.
                </p>
              </div>

              <div
                onClick={() => setFormat('xlsx')}
                className={`p-6 rounded-lg border-2 cursor-pointer transition ${
                  format === 'xlsx'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <FileText className={`w-8 h-8 mb-3 ${format === 'xlsx' ? 'text-blue-600' : 'text-gray-600'}`} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Excel Report</h3>
                <p className="text-gray-600 text-sm">
                  Excel spreadsheet with detailed data. Ideal for further analysis and
                  filtering.
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-8 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Report Filters</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Country Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country (Optional)
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Countries</option>
                    <option value="France">France</option>
                    <option value="Germany">Germany</option>
                    <option value="Spain">Spain</option>
                  </select>
                </div>

                {/* Age Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Age
                    </label>
                    <input
                      type="number"
                      value={minAge}
                      onChange={(e) => setMinAge(e.target.value)}
                      placeholder="e.g., 25"
                      min="18"
                      max="96"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Age
                    </label>
                    <input
                      type="number"
                      value={maxAge}
                      onChange={(e) => setMaxAge(e.target.value)}
                      placeholder="e.g., 60"
                      min="18"
                      max="96"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Risk Level Range */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Level Range</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Risk (%) - Optional
                    </label>
                    <input
                      type="number"
                      value={minRisk}
                      onChange={(e) => setMinRisk(e.target.value)}
                      placeholder="e.g., 30"
                      min="0"
                      max="100"
                      step="5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-600 mt-1">Leave empty to include all</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Risk (%) - Optional
                    </label>
                    <input
                      type="number"
                      value={maxRisk}
                      onChange={(e) => setMaxRisk(e.target.value)}
                      placeholder="e.g., 100"
                      min="0"
                      max="100"
                      step="5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-600 mt-1">Leave empty to include all</p>
                  </div>
                </div>
              </div>

              {/* Report Contents */}
              <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Report Includes:</h3>
                <ul className="space-y-2 text-blue-800 text-sm">
                  <li>✓ Executive Summary with key metrics</li>
                  <li>✓ Risk distribution breakdown (High/Medium/Low/Safe)</li>
                  <li>✓ Top 10 at-risk members with churn probabilities</li>
                  <li>✓ Member demographic analysis</li>
                  <li>✓ Actionable recommendations by risk level</li>
                  {format === 'pdf' && <li>✓ Professional formatting with charts</li>}
                  {format === 'xlsx' && <li>✓ Multi-sheet workbook with detailed data</li>}
                </ul>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className={`w-full px-6 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading && <Loader className="w-5 h-5 animate-spin" />}
                {loading ? 'Generating Report...' : 'Generate Report'}
              </button>
            </div>

            {/* Info Card */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tips</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Leave filters empty to include all members in the report</li>
                <li>• Risk percentage: 0-100% (0.3 = 30% churn probability)</li>
                <li>• PDF format is best for presentations and sharing</li>
                <li>• Excel format is best for detailed analysis and pivot tables</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
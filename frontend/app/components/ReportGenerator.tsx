// app/components/ReportGenerator.tsx
'use client';

import { useState } from 'react';
import { FileText, Download, Loader } from 'lucide-react';
import { generateReport } from '@/app/lib/api';

interface ReportGeneratorProps {
  onReportGenerated?: () => void;
}

export default function ReportGenerator({ onReportGenerated }: ReportGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [riskLevel, setRiskLevel] = useState('all');
  const [country, setCountry] = useState('all');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [format, setFormat] = useState<'pdf' | 'xlsx'>('pdf');

  const countries = ['France', 'Spain', 'Germany'];

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build filters object
      const filters: any = {
        format,
      };

      if (riskLevel !== 'all') {
        filters.risk_level = riskLevel;
      }
      if (country !== 'all') {
        filters.country = country;
      }
      if (ageMin) {
        filters.age_min = parseInt(ageMin);
      }
      if (ageMax) {
        filters.age_max = parseInt(ageMax);
      }

      // Generate report via API
      const blob = await generateReport(filters);

      // Download file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `churn_report_${new Date().getTime()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      a.click();

      setSuccess(true);
      if (onReportGenerated) onReportGenerated();

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error('Report generation error:', err);
      setError(err.message || 'Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Generator Card */}
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="text-blue-600" size={32} />
          <h2 className="text-2xl font-bold text-gray-900">Generate Executive Report</h2>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Risk Level Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Risk Level
            </label>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Risk Levels</option>
              <option value="High Risk">High Risk Only</option>
              <option value="Medium Risk">Medium Risk Only</option>
              <option value="Low Risk">Low Risk Only</option>
              <option value="Safe">Safe Only</option>
            </select>
          </div>

          {/* Country Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Age Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Age Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                min="18"
                max="120"
                placeholder="Min Age"
                value={ageMin}
                onChange={(e) => setAgeMin(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                min="18"
                max="120"
                placeholder="Max Age"
                value={ageMax}
                onChange={(e) => setAgeMax(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Report Format
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormat('pdf')}
                className={`p-4 rounded-lg border-2 transition ${
                  format === 'pdf'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-2">📄</div>
                <p className="font-semibold text-gray-900">PDF Report</p>
                <p className="text-xs text-gray-600 mt-1">Professional formatted</p>
              </button>
              <button
                onClick={() => setFormat('xlsx')}
                className={`p-4 rounded-lg border-2 transition ${
                  format === 'xlsx'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-2">📊</div>
                <p className="font-semibold text-gray-900">Excel Report</p>
                <p className="text-xs text-gray-600 mt-1">Data-focused spreadsheet</p>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm">
              ✓ Report generated and downloaded successfully!
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} />
                <span>Generating Report...</span>
              </>
            ) : (
              <>
                <Download size={20} />
                <span>Generate & Download Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">What's Included</h3>
        <ul className="space-y-2 text-blue-800">
          <li>✓ Executive Summary with key metrics</li>
          <li>✓ Risk distribution breakdown (charts & tables)</li>
          <li>✓ Top at-risk members list with details</li>
          <li>✓ Recommended interventions by risk level</li>
          <li>✓ Filtered data based on your selections</li>
          <li>✓ Generated on {new Date().toLocaleDateString()}</li>
        </ul>
      </div>

      {/* Sample Report Preview */}
      <div className="bg-white rounded-lg shadow p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Preview</h3>
        <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-600">
          <div className="text-6xl mb-4">📋</div>
          <p className="font-semibold">Sample report preview will appear here</p>
          <p className="text-sm mt-2">Generate a report to download the full document</p>
        </div>
      </div>
    </div>
  );
}
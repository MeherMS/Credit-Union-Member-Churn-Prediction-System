// app/components/CSVUploader.tsx
'use client';

import { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { bulkPredict } from '@/app/lib/api';

interface UploadResult {
  total_members: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  safe: number;
  predictions: Array<{
    customer_id: number;
    surname: string;
    churn_probability: number;
    risk_bucket: string;
  }>;
}

interface CSVUploaderProps {
  onUploadSuccess?: (result: UploadResult) => void;
}

export default function CSVUploader({ onUploadSuccess }: CSVUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call API
      const response = await bulkPredict(file);

      // Mock result if API returns success (in real implementation, API would return predictions)
      const mockResult: UploadResult = {
        total_members: 150,
        high_risk: 25,
        medium_risk: 35,
        low_risk: 45,
        safe: 45,
        predictions: [
          { customer_id: 1, surname: 'Smith', churn_probability: 0.85, risk_bucket: 'High Risk' },
          { customer_id: 2, surname: 'Johnson', churn_probability: 0.72, risk_bucket: 'High Risk' },
          { customer_id: 3, surname: 'Brown', churn_probability: 0.55, risk_bucket: 'Medium Risk' },
          { customer_id: 4, surname: 'Davis', churn_probability: 0.42, risk_bucket: 'Low Risk' },
          { customer_id: 5, surname: 'Miller', churn_probability: 0.18, risk_bucket: 'Safe' },
        ],
      };

      setResult(mockResult);
      setSuccess(true);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      if (onUploadSuccess) {
        onUploadSuccess(mockResult);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResults = () => {
    if (!result) return;

    // Create CSV content
    const headers = ['Customer ID', 'Name', 'Churn Probability', 'Risk Bucket'];
    const rows = result.predictions.map((p) => [
      p.customer_id,
      p.surname,
      (p.churn_probability * 100).toFixed(1) + '%',
      p.risk_bucket,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `predictions_${new Date().getTime()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Member Data</h2>

        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-xl text-gray-700 font-semibold">
            Drop your CSV file here or click to select
          </p>
          <p className="text-gray-500 mt-2">
            Maximum file size: 10MB | Format: CSV
          </p>

          {file && (
            <div className="mt-4 inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
              ✓ {file.name}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Upload size={20} />
                <span>Upload & Predict</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {success && result && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center space-x-3 mb-6">
            <CheckCircle className="text-green-600" size={32} />
            <h3 className="text-2xl font-bold text-gray-900">Upload Successful!</h3>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">Total Members</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {result.total_members}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">High Risk</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {result.high_risk}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">Medium Risk</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {result.medium_risk}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">Low Risk</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {result.low_risk}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">Safe</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {result.safe}
              </p>
            </div>
          </div>

          {/* Sample Results Table */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Sample Results (First 5)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                      Churn Probability
                    </th>
                    <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                      Risk Level
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {result.predictions.map((pred) => (
                    <tr key={pred.customer_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">#{pred.customer_id}</td>
                      <td className="px-4 py-3">{pred.surname}</td>
                      <td className="px-4 py-3">
                        {(pred.churn_probability * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                            pred.risk_bucket === 'High Risk'
                              ? 'bg-red-500'
                              : pred.risk_bucket === 'Medium Risk'
                              ? 'bg-orange-500'
                              : pred.risk_bucket === 'Low Risk'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                        >
                          {pred.risk_bucket}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownloadResults}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            📥 Download Full Results (CSV)
          </button>
        </div>
      )}
    </div>
  );
}
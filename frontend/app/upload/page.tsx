'use client';

import { useState, useEffect } from 'react';
import Layout from '@/app/components/Layout';
import { useBulkPredict } from '@/app/hooks/useBulkPredict';
import { AlertTriangle, Download, CheckCircle, Clock } from 'lucide-react';

export default function UploadPage() {
  const { jobId, loading, error, jobStatus, uploadFile, checkStatus, downloadResults, reset } =
    useBulkPredict();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [polling, setPolling] = useState(false);

  // Poll for job status every 2 seconds
  useEffect(() => {
    if (!jobId) return;

    setPolling(true);
    const interval = setInterval(async () => {
      const status = await checkStatus(jobId);
      if (status && (status.status === 'completed' || status.status === 'failed')) {
        setPolling(false);
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, checkStatus]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        alert('Please drop a CSV file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        alert('Please select a CSV file');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }
    await uploadFile(selectedFile);
  };

  // Show results
  if (jobStatus && jobStatus.status === 'completed') {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Bulk Prediction Results</h1>

          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-green-600 mr-4 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-green-900">Upload Complete!</h2>
                <p className="text-green-700 mt-2">
                  Successfully processed {jobStatus.processed_records} of {jobStatus.total_records}{' '}
                  records.
                </p>
              </div>
            </div>
          </div>

          {/* Result Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">Total Records</p>
              <p className="text-3xl font-bold text-gray-900">{jobStatus.total_records}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">Processed Records</p>
              <p className="text-3xl font-bold text-gray-900">{jobStatus.processed_records}</p>
            </div>
          </div>

          {/* Download Button */}
          <div className="mb-8">
            <button
              onClick={() => downloadResults(jobId!)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <Download className="w-5 h-5" />
              Download Results CSV
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                reset();
                setSelectedFile(null);
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Upload Another File
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error
  if (jobStatus && jobStatus.status === 'failed') {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload Failed</h1>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-4 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-red-900">Processing Failed</h2>
                <p className="text-red-700 mt-2">
                  An error occurred while processing your file. Please try again.
                </p>
                <button
                  onClick={() => {
                    reset();
                    setSelectedFile(null);
                  }}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show processing
  if (jobStatus && jobStatus.status === 'processing') {
    const progress = (jobStatus.processed_records / jobStatus.total_records) * 100;
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Processing Your File</h1>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <Clock className="w-6 h-6 text-blue-600 mr-4 flex-shrink-0 mt-0.5 animate-spin" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-blue-900">Processing in Progress</h2>
                <p className="text-blue-700 mt-2">
                  Processed {jobStatus.processed_records} of {jobStatus.total_records} records
                </p>
                <div className="mt-4 w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-blue-600 mt-2">{progress.toFixed(0)}% Complete</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show upload form
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Bulk Member Predictions</h1>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">CSV Format Requirements</h2>
          <p className="text-blue-700 text-sm mb-3">
            Your CSV file must include these columns (in any order):
          </p>
          <ul className="list-disc list-inside text-blue-700 text-sm space-y-1">
            <li>credit_score</li>
            <li>country (France, Germany, or Spain)</li>
            <li>gender (M or F)</li>
            <li>age</li>
            <li>tenure</li>
            <li>balance</li>
            <li>products_number</li>
            <li>credit_card (0 or 1)</li>
            <li>active_member (0 or 1)</li>
            <li>estimated_salary</li>
          </ul>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-4 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-red-900">Error</h2>
                <p className="text-red-700 mt-2">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }`}
          >
            <div>
              <p className="text-gray-600 text-lg mb-4">
                Drag and drop your CSV file here, or click to select
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer font-medium"
              >
                Select File
              </label>
            </div>
          </div>

          {/* Selected File */}
          {selectedFile && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Selected File:</p>
              <p className="font-semibold text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-600 mt-1">
                Size: {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          {/* Upload Button */}
          <div className="mt-6">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || loading}
              className={`w-full px-6 py-3 rounded-lg font-medium transition ${
                !selectedFile || loading
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Uploading...' : 'Upload and Process'}
            </button>
          </div>
        </div>

        {/* Status Info */}
        {polling && jobId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start">
              <Clock className="w-6 h-6 text-yellow-600 mr-4 flex-shrink-0 mt-0.5 animate-spin" />
              <div>
                <h2 className="text-lg font-semibold text-yellow-900">Processing</h2>
                <p className="text-yellow-700 mt-2">
                  Your file is being processed. This may take a minute...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
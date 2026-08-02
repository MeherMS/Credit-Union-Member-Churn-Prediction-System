import { useState } from 'react';
import apiClient from '@/app/lib/api';

export interface BulkPredictResponse {
  job_id: string;
  filename: string;
  status: string;
  total_records: number;
  processed_records?: number;
}

export interface JobStatus {
  job_id: string;
  status: string;
  total_records: number;
  processed_records: number;
  created_at: string;
}

export const useBulkPredict = () => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);

  // Upload CSV file
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/bulk_predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Bulk predict job created:', response.data);
      setJobId(response.data.job_id);
      return response.data.job_id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      console.error('❌ Upload error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Check job status
  const checkStatus = async (id: string) => {
    try {
      const response = await apiClient.get(`/bulk_predict/${id}`);
      console.log('✅ Job status:', response.data);
      setJobStatus(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check status';
      console.error('❌ Status check error:', errorMessage);
      setError(errorMessage);
      return null;
    }
  };

  // Download results
  const downloadResults = async (id: string) => {
    try {
      const response = await apiClient.get(`/bulk_predict/${id}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `predictions_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Results downloaded');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download results';
      console.error('❌ Download error:', errorMessage);
      setError(errorMessage);
    }
  };

  const reset = () => {
    setJobId(null);
    setJobStatus(null);
    setError(null);
  };

  return {
    jobId,
    loading,
    error,
    jobStatus,
    uploadFile,
    checkStatus,
    downloadResults,
    reset,
  };
};
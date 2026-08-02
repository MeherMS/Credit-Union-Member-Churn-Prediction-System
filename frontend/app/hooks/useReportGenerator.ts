import { useState } from 'react';
import apiClient from '@/app/lib/api';

export interface ReportFilters {
  min_risk_level?: number;
  max_risk_level?: number;
  country?: string;
  min_age?: number;
  max_age?: number;
  format: 'pdf' | 'xlsx';
}

export const useReportGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const generateReport = async (filters: ReportFilters) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
  
      // Build request body
      const requestBody: any = {
        format: filters.format,
      };
  
      if (filters.min_risk_level !== undefined) {
        requestBody.min_risk_level = filters.min_risk_level;
      }
      if (filters.max_risk_level !== undefined) {
        requestBody.max_risk_level = filters.max_risk_level;
      }
      if (filters.country) {
        requestBody.country = filters.country;
      }
      if (filters.min_age !== undefined) {
        requestBody.min_age = filters.min_age;
      }
      if (filters.max_age !== undefined) {
        requestBody.max_age = filters.max_age;
      }
  
      console.log('📊 Generating report with filters:', requestBody);
  
      const response = await apiClient.post('/report/generate', requestBody);
  
      console.log('📊 Report response:', response.data);
  
      // Check if response is JSON with download_url
      if (response.data && response.data.download_url) {
        const downloadUrl = response.data.download_url;
        console.log('📥 Downloading from URL:', downloadUrl);
  
        // Fetch the file from the download URL
        const fileResponse = await apiClient.get(downloadUrl, {
          responseType: 'blob',
        });
  
        // Create downloadable file
        const url = window.URL.createObjectURL(new Blob([fileResponse.data]));
        const link = document.createElement('a');
        link.href = url;
  
        // Determine filename based on format
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename =
          filters.format === 'pdf'
            ? `churn_report_${timestamp}.pdf`
            : `churn_report_${timestamp}.xlsx`;
  
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
  
        setSuccess(true);
        console.log('✅ Report generated and downloaded');
        return true;
      } else {
        // Fallback: response is already a blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
  
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename =
          filters.format === 'pdf'
            ? `churn_report_${timestamp}.pdf`
            : `churn_report_${timestamp}.xlsx`;
  
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
  
        setSuccess(true);
        console.log('✅ Report generated and downloaded');
        return true;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate report';
      console.error('❌ Report generation error:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return { generateReport, loading, error, success, reset };
};
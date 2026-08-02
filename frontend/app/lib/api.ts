// app/lib/api.ts
import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for API responses
export interface MemberPrediction {
  member_id: string;
  credit_score: number;
  age: number;
  tenure: number;
  balance: number;
  products_number: number;
  credit_card: number;
  active_member: number;
  estimated_salary: number;
  country: string;
  gender: string;
  churn_probability: number;
  risk_bucket: string;
  risk_days: number;
  feature_importance: Record<string, number>;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
}

export interface PredictRequest {
  credit_score: number;
  country: string;
  gender: string;
  age: number;
  tenure: number;
  balance: number;
  products_number: number;
  credit_card: number;
  active_member: number;
  estimated_salary: number;
}

// API Endpoints
export const healthCheck = async (): Promise<HealthResponse> => {
  try {
    const response = await apiClient.get('/health');
    console.log('✅ Backend health:', response.data);
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

export const predictMember = async (
  memberData: PredictRequest
): Promise<MemberPrediction> => {
  try {
    const response = await apiClient.post('/predict', memberData);
    return response.data;
  } catch (error) {
    console.error('Prediction failed:', error);
    throw error;
  }
};

export const getMemberProfile = async (
  memberId: string
): Promise<MemberPrediction> => {
  try {
    const response = await apiClient.get(`/member/${memberId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch member profile:', error);
    throw error;
  }
};

export const bulkPredict = async (file: File): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/bulk_predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Bulk prediction failed:', error);
    throw error;
  }
};

// app/lib/api.ts (update the generateReport function)

export const generateReport = async (filters: {
    risk_level?: string;
    country?: string;
    age_min?: number;
    age_max?: number;
    format: 'pdf' | 'xlsx';
  }): Promise<Blob> => {
    try {
      const response = await apiClient.post('/report/generate', filters, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Report generation failed:', error);
      
      // Mock response for demo purposes
      const mockContent = `Mock ${filters.format.toUpperCase()} Report\n\nGenerated: ${new Date().toLocaleString()}\n\nFilters Applied:\n${Object.entries(filters)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join('\n')}`;
      
      return new Blob([mockContent], { 
        type: filters.format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
    }
  };

  // Add request/response interceptors for better error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle timeout
      if (error.code === 'ECONNABORTED') {
        console.error('Request timeout - server took too long to respond');
        error.message = 'Request timeout. The server took too long to respond. Please try again.';
      }
  
      // Handle connection refused
      if (error.code === 'ECONNREFUSED') {
        console.error('Connection refused - backend server may be down');
        error.message = 'Cannot connect to server. Please check if the backend is running.';
      }
  
      // Handle network error
      if (error.message === 'Network Error') {
        console.error('Network error - check your internet connection');
        error.message = 'Network error. Please check your internet connection.';
      }
  
      return Promise.reject(error);
    }
  );
export default apiClient;
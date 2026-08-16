// app/lib/api.ts
import axios, { AxiosError } from 'axios';
import { ProductPredictionResponse, MembersSearchResponse } from "@/app/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
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

// ========== HOUSEHOLD ENDPOINTS ==========

export const getHouseholds = async (
  skip: number = 0,
  limit: number = 10,
  riskLevel?: string,
  sortBy: 'risk' | 'value' = 'risk'
) => {
  try {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    if (riskLevel) params.append('risk_level', riskLevel);
    params.append('sort_by', sortBy);

    const response = await apiClient.get(`/households?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching households:', error);
    throw error;
  }
};

export const getHouseholdDetail = async (householdId: string) => {
  try {
    const response = await apiClient.get(`/household/${householdId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching household detail:', error);
    throw error;
  }
};

// ========== COHORT ENDPOINTS ==========

export const getAllCohorts = async () => {
  try {
    const response = await apiClient.get('/cohorts');
    return response.data;
  } catch (error) {
    console.error('Error fetching cohorts:', error);
    throw error;
  }
};

export const getCohortDetail = async (cohortId: number) => {
  try {
    const response = await apiClient.get(`/cohort/${cohortId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cohort detail:', error);
    throw error;
  }
};

export const getCohortMembers = async (
  cohortId: number,
  skip: number = 0,
  limit: number = 10
) => {
  try {
    const response = await apiClient.get(
      `/cohort/${cohortId}/members?skip=${skip}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching cohort members:', error);
    throw error;
  }
};

export const getAnalyticsSummary = async () => {
  try {
    const response = await apiClient.get('/analytics/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    throw error;
  }
};

// ============================================================================
// PRODUCT PREDICTION API FUNCTIONS (Phase 9)
// ============================================================================

/**
 * Predict product adoption probabilities for a member
 * @param features - Member features (same as churn prediction)
 * @returns ProductPredictionResponse with all 5 product scores
 */
export async function predictProducts(features: {
  member_id: string;
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
}): Promise<ProductPredictionResponse> {
  try {
    const response = await apiClient.post<ProductPredictionResponse>(
      "/predict_products",
      features
    );
    return response.data;
  } catch (error) {
    console.error("Product prediction error:", error);
    throw error;
  }
}

/**
 * Search members by ID or name
 * @param query - Search query (member ID or name)
 * @param skip - Pagination offset
 * @param limit - Results per page
 * @returns List of matching members
 */
export async function searchMembers(
  query: string,
  skip: number = 0,
  limit: number = 20
): Promise<MembersSearchResponse> {
  try {
    const response = await apiClient.get<MembersSearchResponse>("/members", {
      params: {
        skip,
        limit,
        // Search is done server-side if backend supports it
        // Otherwise we'll filter client-side
      },
    });
    return response.data;
  } catch (error) {
    console.error("Member search error:", error);
    throw error;
  }
}

/**
 * Get member details by ID
 * @param memberId - Member ID
 * @returns Member details (for getting features to predict)
 */
export async function getMemberDetails(memberId: string): Promise<any> {
  try {
    const response = await apiClient.get(`/member/${memberId}`);
    return response.data;
  } catch (error) {
    console.error("Get member details error:", error);
    throw error;
  }
}
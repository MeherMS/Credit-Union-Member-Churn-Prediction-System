'use client';

import { useState } from 'react';
import apiClient from '@/app/lib/api';

export interface PredictionResult {
  success: boolean;
  member_id: string;
  member_name: string;
  churn_probability: number;
  risk_bucket: string;
  days_to_churn: number | null;
  prediction: number;
  top_risk_factors: string[];
  message: string;
}

export interface PredictFormData {
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

export const useSinglePredict = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const predict = async (formData: PredictFormData) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await apiClient.post<PredictionResult>(
        '/predict-single',
        formData
      );

      setResult(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Prediction failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { predict, loading, error, result, reset };
};
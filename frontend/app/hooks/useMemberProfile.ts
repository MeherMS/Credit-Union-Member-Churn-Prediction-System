import { useState, useEffect } from 'react';
import apiClient from '@/app/lib/api';

export interface MemberProfile {
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
  churn_probability: number;
  risk_bucket: string;
  days_to_churn: number | null;
  prediction: number;
  top_risk_factors: string[];
}

export const useMemberProfile = (memberId: string) => {
  const [data, setData] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get(`/member/${memberId}`);
        console.log('✅ Member profile fetched:', response.data);

        setData(response.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch member profile';
        console.error('❌ Member profile fetch error:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (memberId) {
      fetchProfile();
    }
  }, [memberId]);

  return { data, loading, error };
};
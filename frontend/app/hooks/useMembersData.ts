import { useState, useEffect } from 'react';
import apiClient from '@/app/lib/api';

export interface Member {
  member_id: string;
  age: number;
  country: string;
  balance: number;
  risk_bucket: string;
  churn_probability: number;
  tenure?: number;
  products_number?: number;
  credit_score?: number;
}

export interface MembersResponse {
  total: number;
  page: number;
  limit: number;
  members: Member[];
}

export const useMembersData = (
  skip: number = 0,
  limit: number = 10,
  risk_level?: string,
  country?: string
) => {
  const [data, setData] = useState<MembersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError(null);

        let url = `/members?skip=${skip}&limit=${limit}`;
        if (risk_level) url += `&risk_level=${encodeURIComponent(risk_level)}`;
        if (country) url += `&country=${encodeURIComponent(country)}`;

        const response = await apiClient.get(url);
        console.log('✅ Members data fetched:', response.data);

        setData(response.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch members';
        console.error('❌ Members fetch error:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [skip, limit, risk_level, country]);

  return { data, loading, error };
};
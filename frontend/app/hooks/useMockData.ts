import { useState, useEffect } from 'react';
import  api  from '@/app/lib/api';

export interface DashboardData {
  summary: {
    high_risk: number;
    medium_risk: number;
    low_risk: number;
    safe: number;
    total_members: number;
  };
  top_at_risk_members: Array<{
    member_id: string;
    age: number;
    country: string;
    balance: number;
    risk_bucket: string;
    churn_probability: number;
  }>;
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get('/stats/risk_distribution');
        console.log('✅ Dashboard data fetched:', response.data);
        
        setData(response.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
        console.error('❌ Dashboard fetch error:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
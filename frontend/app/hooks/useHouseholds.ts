'use client';

import { useState, useEffect } from 'react';
import { getHouseholds, getHouseholdDetail } from '@/app/lib/api';
import { Household, HouseholdsResponse } from '@/app/types';

export const useHouseholds = (
  skip: number = 0,
  limit: number = 10,
  riskLevel?: string,
  sortBy: 'risk' | 'value' = 'risk'
) => {
  const [data, setData] = useState<HouseholdsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getHouseholds(skip, limit, riskLevel, sortBy);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch households');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [skip, limit, riskLevel, sortBy]);

  return { data, loading, error };
};

export const useHouseholdDetail = (householdId: string) => {
  const [data, setData] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!householdId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await getHouseholdDetail(householdId);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch household');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [householdId]);

  return { data, loading, error };
};
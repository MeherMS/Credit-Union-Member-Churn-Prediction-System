'use client';

import { useState, useEffect } from 'react';
import {
  getAllCohorts,
  getCohortDetail,
  getCohortMembers,
  getAnalyticsSummary,
} from '@/app/lib/api';
import {
  AllCohortsResponse,
  Cohort,
  CohortMembersResponse,
  AnalyticsSummary,
} from '@/app/types';

export const useCohorts = () => {
  const [data, setData] = useState<AllCohortsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getAllCohorts();
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cohorts');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

export const useCohortDetail = (cohortId: number) => {
  const [data, setData] = useState<Cohort | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getCohortDetail(cohortId);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cohort');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cohortId]);

  return { data, loading, error };
};

export const useCohortMembers = (
  cohortId: number,
  skip: number = 0,
  limit: number = 10
) => {
  const [data, setData] = useState<CohortMembersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getCohortMembers(cohortId, skip, limit);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cohort members');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cohortId, skip, limit]);

  return { data, loading, error };
};

export const useAnalyticsSummary = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getAnalyticsSummary();
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
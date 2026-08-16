"use client";

import { useState, useEffect } from "react";
import { predictProducts, getMemberDetails } from "@/app/lib/api";
import { ProductPredictionResponse } from "@/app/types";

interface UseProductPredictionOptions {
  autoFetch?: boolean;
}

export function useProductPrediction(
  memberId: string | null,
  options: UseProductPredictionOptions = { autoFetch: true }
) {
  const [data, setData] = useState<ProductPredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!memberId || !options.autoFetch) return;

    const fetchPrediction = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Get member details
        const memberDetails = await getMemberDetails(memberId);

        // Step 2: Predict products
        const prediction = await predictProducts({
            member_id: memberId,
          credit_score: memberDetails.credit_score,
          country: memberDetails.country,
          gender: memberDetails.gender,
          age: memberDetails.age,
          tenure: memberDetails.tenure,
          balance: memberDetails.balance,
          products_number: memberDetails.products_number,
          credit_card: memberDetails.credit_card,
          active_member: memberDetails.active_member,
          estimated_salary: memberDetails.estimated_salary,
        });

        setData(prediction);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch product predictions";
        setError(errorMessage);
        console.error("Product prediction error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [memberId, options.autoFetch]);

  const refetch = async () => {
    if (!memberId) return;
    try {
      setLoading(true);
      setError(null);

      const memberDetails = await getMemberDetails(memberId);
      const prediction = await predictProducts({
        member_id: memberId,
        credit_score: memberDetails.credit_score,
        country: memberDetails.country,
        gender: memberDetails.gender,
        age: memberDetails.age,
        tenure: memberDetails.tenure,
        balance: memberDetails.balance,
        products_number: memberDetails.products_number,
        credit_card: memberDetails.credit_card,
        active_member: memberDetails.active_member,
        estimated_salary: memberDetails.estimated_salary,
      });

      setData(prediction);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to refetch product predictions";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}
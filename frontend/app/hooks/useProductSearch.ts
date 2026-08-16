"use client";

import { useState } from "react";
import { getMemberDetails, predictProducts } from "@/app/lib/api";
import { ProductPredictionResponse } from "@/app/types";

export function useProductSearch() {
  const [prediction, setPrediction] = useState<ProductPredictionResponse | null>(null);
  const [memberDetails, setMemberDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = async (memberId: string) => {
    if (!memberId.trim()) {
      setError("Please enter a member ID");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSearchTerm(memberId);

      // Step 1: Get member details
      const member = await getMemberDetails(memberId);
      setMemberDetails(member);

      // Step 2: Predict products
      const result = await predictProducts({
        member_id: memberId,
        credit_score: member.credit_score,
        country: member.country,
        gender: member.gender,
        age: member.age,
        tenure: member.tenure,
        balance: member.balance,
        products_number: member.products_number,
        credit_card: member.credit_card,
        active_member: member.active_member,
        estimated_salary: member.estimated_salary,
      });

      setPrediction(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Member not found or prediction failed";
      setError(errorMessage);
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setPrediction(null);
    setMemberDetails(null);
    setSearchTerm("");
    setError(null);
  };

  return {
    prediction,
    memberDetails,
    loading,
    error,
    searchTerm,
    handleSearch,
    clearSearch,
  };
}
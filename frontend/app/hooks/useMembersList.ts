"use client";

import { useState, useEffect } from "react";
import { getMembersWithFilters } from "@/app/lib/api";
import { MemberForProducts  } from "@/app/types";

export function useMembersList(pageSize: number = 15) {
  const [members, setMembers] = useState<MemberForProducts []>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [country, setCountry] = useState<string | null>(null);
  const [riskLevel, setRiskLevel] = useState<string | null>(null);
  const [searchId, setSearchId] = useState("");

  // Fetch members on mount and when filters change
  useEffect(() => {
    fetchMembers(0);
  }, [country, riskLevel, searchId]);

  const fetchMembers = async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);

      const skip = pageNum * pageSize;
      const data = await getMembersWithFilters({
        skip,
        limit: pageSize,
        country: country || undefined,
        risk_level: riskLevel || undefined,
        search: searchId || undefined,
      });

      setMembers(data.members || []);
      setTotal(data.total || 0);
      setPage(pageNum);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch members";
      setError(errorMessage);
      console.error("Fetch members error:", err);
    } finally {
      setLoading(false);
    }
  };

  const nextPage = () => {
    if ((page + 1) * pageSize < total) {
      fetchMembers(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 0) {
      fetchMembers(page - 1);
    }
  };

  const handleCountryChange = (value: string) => {
    setCountry(value === "all" ? null : value);
  };

  const handleRiskChange = (value: string) => {
    setRiskLevel(value === "all" ? null : value);
  };

  const handleSearchChange = (value: string) => {
    setSearchId(value);
  };

  const totalPages = Math.ceil(total / pageSize);
  const currentPageCount = members.length;

  return {
    members,
    loading,
    error,
    page,
    total,
    totalPages,
    currentPageCount,
    pageSize,
    country,
    riskLevel,
    searchId,
    nextPage,
    prevPage,
    handleCountryChange,
    handleRiskChange,
    handleSearchChange,
  };
}
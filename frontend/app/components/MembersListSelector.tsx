"use client";

import { MemberForProducts  } from "@/app/types";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";

interface MembersListSelectorProps {
  members: MemberForProducts [];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  country: string | null;
  riskLevel: string | null;
  searchId: string;
  onCountryChange: (country: string) => void;
  onRiskChange: (risk: string) => void;
  onSearchChange: (id: string) => void;
  onMemberSelect: (member: MemberForProducts ) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
}

function getRiskColor(churnProb: number): string {
  if (churnProb >= 0.7) return "bg-red-100 text-red-800 border-red-300";
  if (churnProb >= 0.5) return "bg-orange-100 text-orange-800 border-orange-300";
  if (churnProb >= 0.3) return "bg-yellow-100 text-yellow-800 border-yellow-300";
  return "bg-green-100 text-green-800 border-green-300";
}

function getRiskLabel(churnProb: number): string {
  if (churnProb >= 0.7) return "High Risk";
  if (churnProb >= 0.5) return "Medium Risk";
  if (churnProb >= 0.3) return "Low Risk";
  return "Safe";
}

export function MembersListSelector({
  members,
  loading,
  error,
  currentPage,
  totalPages,
  country,
  riskLevel,
  searchId,
  onCountryChange,
  onRiskChange,
  onSearchChange,
  onMemberSelect,
  onNextPage,
  onPrevPage,
}: MembersListSelectorProps) {
  return (
    <div className="rounded-xl bg-white p-8 shadow-lg">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Browse Members</h2>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Search by ID */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Search by ID
          </label>
          <input
            type="text"
            placeholder="e.g., MEM_00001"
            value={searchId}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Country Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Country
          </label>
          <select
            value={country || "all"}
            onChange={(e) => onCountryChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="all">All Countries</option>
            <option value="France">France</option>
            <option value="Germany">Germany</option>
            <option value="Spain">Spain</option>
          </select>
        </div>

        {/* Risk Level Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Risk Level
          </label>
          <select
            value={riskLevel || "all"}
            onChange={(e) => onRiskChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="all">All Risk Levels</option>
            <option value="High Risk">High Risk</option>
            <option value="Medium Risk">Medium Risk</option>
            <option value="Low Risk">Low Risk</option>
            <option value="Safe">Safe</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          <p className="font-semibold">❌ {error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <Loader className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading members...</p>
        </div>
      )}

      {/* Members List */}
      {!loading && members.length > 0 && (
        <div className="mb-6 space-y-3 max-h-96 overflow-y-auto">
          {members.map((member) => (
            <button
              key={member.member_id}
              onClick={() => onMemberSelect(member)}
              className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 p-4 text-left transition-all hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{member.member_id}</p>
                  <p className="text-sm text-gray-600">
                    Age {member.age} • {member.country} • Balance: ${member.balance?.toLocaleString()}
                  </p>
                </div>
                <div className={`rounded-full border px-3 py-1 text-sm font-semibold ${getRiskColor(member.churn_probability)}`}>
                  {getRiskLabel(member.churn_probability)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && members.length === 0 && !error && (
        <div className="rounded-lg bg-gray-50 p-12 text-center">
          <p className="text-gray-600">No members found matching your filters</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && members.length > 0 && (
        <div className="flex items-center justify-between">
          <button
            onClick={onPrevPage}
            disabled={currentPage === 0}
            className="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-900 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
            Previous
          </button>

          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">
              Page {currentPage + 1} of {totalPages}
            </p>
          </div>

          <button
            onClick={onNextPage}
            disabled={currentPage >= totalPages - 1}
            className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
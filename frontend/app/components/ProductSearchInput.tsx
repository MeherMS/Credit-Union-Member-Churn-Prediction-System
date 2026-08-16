"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

interface ProductSearchInputProps {
  onSearch: (memberId: string) => void;
  onClear: () => void;
  isLoading: boolean;
  error: string | null;
  searchValue: string;
}

export function ProductSearchInput({
  onSearch,
  onClear,
  isLoading,
  error,
  searchValue,
}: ProductSearchInputProps) {
  const [inputValue, setInputValue] = useState(searchValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue);
  };

  const handleClear = () => {
    setInputValue("");
    onClear();
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter Member ID (e.g., MEM001)"
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
            />
            {inputValue && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          <p className="font-semibold">❌ {error}</p>
        </div>
      )}
    </div>
  );
}
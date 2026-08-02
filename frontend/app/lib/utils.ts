// app/lib/utils.ts

/**
 * Convert churn probability to risk bucket
 */
export const getRiskBucket = (probability: number): string => {
    if (probability >= 0.7) return 'High Risk';
    if (probability >= 0.5) return 'Medium Risk';
    if (probability >= 0.3) return 'Low Risk';
    return 'Safe';
  };
  
  /**
   * Convert churn probability to estimated days to churn
   */
  export const getPredictedDays = (probability: number): number => {
    if (probability >= 0.7) return 14;
    if (probability >= 0.5) return 45;
    if (probability >= 0.3) return 80;
    return 180;
  };
  
  /**
   * Get color code for risk bucket
   */
  export const getRiskColor = (probability: number): string => {
    if (probability >= 0.7) return 'bg-red-500';
    if (probability >= 0.5) return 'bg-orange-500';
    if (probability >= 0.3) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  /**
   * Get text color for risk bucket
   */
  export const getRiskTextColor = (probability: number): string => {
    if (probability >= 0.7) return 'text-red-700';
    if (probability >= 0.5) return 'text-orange-700';
    if (probability >= 0.3) return 'text-yellow-700';
    return 'text-green-700';
  };
  
  /**
   * Get border color for risk bucket
   */
  export const getRiskBorderColor = (probability: number): string => {
    if (probability >= 0.7) return 'border-red-300';
    if (probability >= 0.5) return 'border-orange-300';
    if (probability >= 0.3) return 'border-yellow-300';
    return 'border-green-300';
  };
  
  /**
   * Format currency
   */
  export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };
  
  /**
   * Format percentage
   */
  export const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };
  
  /**
   * Truncate text
   */
  export const truncate = (text: string, length: number): string => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };
  
  /**
   * Sleep for debugging
   */
  export const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
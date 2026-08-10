// app/types/index.ts

export interface Member {
    row_number: number;
    customer_id: number;
    surname: string;
    credit_score: number;
    country: string;
    gender: string;
    age: number;
    tenure: number;
    balance: number;
    products_number: number;
    credit_card: number;
    active_member: number;
    estimated_salary: number;
  }
  
  export interface MemberWithPrediction extends Member {
    churn_probability: number;
    risk_bucket: string;
    risk_days: number;
    feature_importance: Record<string, number>;
  }
  
  export interface DashboardSummary {
    total_members: number;
    high_risk_count: number;
    medium_risk_count: number;
    low_risk_count: number;
    safe_count: number;
  }
  
  export interface RiskDistribution {
    name: string;
    value: number;
    color: string;
  }

  // ========== HOUSEHOLD TYPES ==========

export interface Household {
  household_id: string;
  member_ids: string[];
  member_count: number;
  combined_balance: number;
  avg_age: number;
  avg_tenure: number;
  products_number: number;
  avg_credit_score: number;
  weighted_churn_probability: number;
  risk_bucket: string;
  household_value: 'premium' | 'standard' | 'starter';
}

export interface HouseholdsResponse {
  total: number;
  page: number;
  limit: number;
  households: Household[];
}

// ========== COHORT TYPES ==========

export interface CohortCharacteristics {
  avg_tenure: number;
  avg_age: number;
  avg_balance: number;
  avg_products: number;
  avg_credit_score: number;
  avg_active_member_rate: number;
  member_count: number;
}

export interface CohortRiskProfile {
  avg_churn_probability: number;
  pct_high_risk: number;
  pct_medium_risk: number;
  pct_low_risk: number;
  pct_safe: number;
}

export interface Cohort {
  cohort_id: number;
  cohort_name: string;
  description: string;
  characteristics: CohortCharacteristics;
  risk_profile: CohortRiskProfile;
  size_percentage: number;
}

export interface AllCohortsResponse {
  total_cohorts: number;
  total_members: number;
  cohorts: Cohort[];
}

export interface MemberCohortAssignment {
  member_id: string;
  cohort_id: number;
  cohort_name: string;
}

export interface CohortMembersResponse {
  cohort_id: number;
  cohort_name: string;
  total_members: number;
  page: number;
  limit: number;
  members: MemberCohortAssignment[];
}

export interface AnalyticsSummary {
  households: {
    total: number;
    high_risk: number;
    medium_risk: number;
    low_risk: number;
    safe: number;
    top_at_risk: Household[];
  };
  cohorts: {
    total: number;
    cohorts: Cohort[];
  };
}
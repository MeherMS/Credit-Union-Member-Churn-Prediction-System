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
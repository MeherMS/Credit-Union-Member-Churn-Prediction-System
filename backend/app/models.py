from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# ==================== REQUEST SCHEMAS ====================

class PredictRequest(BaseModel):
    """Single member prediction request"""
    credit_score: int
    country: str
    gender: str
    age: int
    tenure: int
    balance: float
    products_number: int
    credit_card: int
    active_member: int
    estimated_salary: float

class BulkPredictRequest(BaseModel):
    """Bulk prediction metadata (CSV file handled separately)"""
    filename: str


# ==================== RESPONSE SCHEMAS ====================

class PredictionResponse(BaseModel):
    """Single prediction response"""
    churn_probability: float
    risk_bucket: str
    days_to_churn: Optional[int]
    top_risk_factors: List[str]
    prediction: int  # 0 or 1

class MemberProfile(BaseModel):
    """Member profile with prediction"""
    member_id: str
    credit_score: int
    country: str
    gender: str
    age: int
    tenure: int
    balance: float
    products_number: int
    credit_card: int
    active_member: int
    estimated_salary: float
    churn_probability: float
    risk_bucket: str
    days_to_churn: Optional[int]
    top_risk_factors: List[str]
    prediction: int
    created_at: datetime

class BulkPredictResponse(BaseModel):
    """Bulk prediction response"""
    job_id: str
    filename: str
    status: str  # "pending", "processing", "completed", "failed"
    total_records: Optional[int] = None
    processed_records: Optional[int] = None
    results_url: Optional[str] = None

class HealthResponse(BaseModel):
    """API health check response"""
    status: str
    model_loaded: bool
    database_connected: bool
    environment: str

class ReportGenerateRequest(BaseModel):
    """Report generation request"""
    min_risk_level: Optional[float] = None  # Filter: >= this probability
    max_risk_level: Optional[float] = None  # Filter: <= this probability
    country: Optional[str] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    format: str = "pdf"  # "pdf" or "xlsx"

class ReportGenerateResponse(BaseModel):
    """Report generation response"""
    message: str
    download_url: str


# ========== HOUSEHOLD MODELS ==========

class HouseholdResponse(BaseModel):
    """Response model for household data"""
    household_id: str
    member_ids: List[str]
    member_count: int
    combined_balance: float
    avg_age: float
    avg_tenure: float
    products_number: int
    avg_credit_score: float
    weighted_churn_probability: float
    risk_bucket: str
    household_value: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "household_id": "HH000001",
                "member_ids": ["MEM000001", "MEM000002"],
                "member_count": 2,
                "combined_balance": 150000.50,
                "avg_age": 45.5,
                "avg_tenure": 8.3,
                "products_number": 4,
                "avg_credit_score": 720.0,
                "weighted_churn_probability": 0.35,
                "risk_bucket": "Low Risk",
                "household_value": "premium"
            }
        }


class HouseholdsListResponse(BaseModel):
    """Response for paginated household list"""
    total: int
    page: int
    limit: int
    households: List[HouseholdResponse]


# ========== COHORT MODELS ==========

class CohortCharacteristics(BaseModel):
    """Cohort characteristics"""
    avg_tenure: float
    avg_age: float
    avg_balance: float
    avg_products: float
    avg_credit_score: float
    avg_active_member_rate: float
    member_count: int


class CohortRiskProfile(BaseModel):
    """Cohort risk breakdown"""
    avg_churn_probability: float
    pct_high_risk: float
    pct_medium_risk: float
    pct_low_risk: float
    pct_safe: float


class CohortResponse(BaseModel):
    """Response model for cohort data"""
    cohort_id: int
    cohort_name: str
    description: str
    characteristics: CohortCharacteristics
    risk_profile: CohortRiskProfile
    size_percentage: float
    
    class Config:
        json_schema_extra = {
            "example": {
                "cohort_id": 0,
                "cohort_name": "Dormant Power User",
                "description": "Inactive but heavy product users...",
                "characteristics": {
                    "avg_tenure": 4.7,
                    "avg_age": 57.4,
                    "avg_balance": 126371.0,
                    "avg_products": 3.5,
                    "avg_credit_score": 510.0,
                    "avg_active_member_rate": 0.0,
                    "member_count": 1587
                },
                "risk_profile": {
                    "avg_churn_probability": 0.4926,
                    "pct_high_risk": 23.5,
                    "pct_medium_risk": 25.9,
                    "pct_low_risk": 25.7,
                    "pct_safe": 24.9
                },
                "size_percentage": 15.9
            }
        }


class AllCohortsResponse(BaseModel):
    """Response for all cohorts"""
    total_cohorts: int
    total_members: int
    cohorts: List[CohortResponse]


class MemberCohortAssignment(BaseModel):
    """Member-to-cohort assignment"""
    member_id: str
    cohort_id: int
    cohort_name: str


class CohortMembersResponse(BaseModel):
    """Response for members in a cohort"""
    cohort_id: int
    cohort_name: str
    total_members: int
    page: int
    limit: int
    members: List[MemberCohortAssignment]
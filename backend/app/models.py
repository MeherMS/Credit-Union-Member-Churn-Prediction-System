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
import logging
import asyncio
from fastapi import APIRouter, File, UploadFile, Query, HTTPException
from fastapi.responses import FileResponse
from fastapi.responses import StreamingResponse
from app.models import PredictRequest
from datetime import datetime
from typing import List
import uuid

from datetime import datetime
import pandas as pd
import numpy as np

from app.models import (
    PredictRequest, PredictionResponse, MemberProfile,
    BulkPredictRequest, BulkPredictResponse, HealthResponse,
    ReportGenerateRequest, ReportGenerateResponse, HouseholdResponse,
    HouseholdsListResponse,
    CohortCharacteristics,
    CohortRiskProfile,
    CohortResponse,
    AllCohortsResponse,
    MemberCohortAssignment,
    CohortMembersResponse
)
from app.ml_pipeline import MLPipeline
from app.database import MongoDBManager
from app.report_generator import ReportGenerator
from app.utils import FileHandler, JobManager, RiskBucketAnalyzer
from app.config import settings
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional, List, Dict, Any



def set_mongodb_client(mongo_client: AsyncIOMotorClient):
    """Set MongoDB client from main.py"""
    global client
    client = mongo_client


def convert_nan_to_none(obj):
    """
    Recursively convert all NaN/Inf values in a dict/list to None.
    Needed for JSON serialization.
    """
    if isinstance(obj, dict):
        return {k: convert_nan_to_none(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_nan_to_none(item) for item in obj]
    elif isinstance(obj, float):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return obj
    else:
        return obj

logger = logging.getLogger(__name__)

router = APIRouter()

# Required columns for CSV upload
REQUIRED_CSV_COLUMNS = [
    "credit_score", "country", "gender", "age", "tenure",
    "balance", "products_number", "credit_card", "active_member", "estimated_salary"
]

# ==================== HEALTH CHECK ====================

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        # Check if model is loaded
        model_loaded = MLPipeline.model is not None
        
        # Check if database is connected
        db_connected = MongoDBManager.database is not None
        
        return HealthResponse(
            status="healthy" if (model_loaded and db_connected) else "degraded",
            model_loaded=model_loaded,
            database_connected=db_connected,
            environment=settings.environment
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthResponse(
            status="unhealthy",
            model_loaded=False,
            database_connected=False,
            environment=settings.environment
        )

# ==================== SINGLE PREDICTION ====================

@router.post("/predict", response_model=PredictionResponse)
async def predict_churn(request: PredictRequest):
    """
    Predict churn for a single member.
    
    Example request:
    {
        "credit_score": 650,
        "country": "France",
        "gender": "M",
        "age": 35,
        "tenure": 8,
        "balance": 50000,
        "products_number": 2,
        "credit_card": 1,
        "active_member": 1,
        "estimated_salary": 75000
    }
    """
    try:
        # Convert request to dict
        features = request.dict()
        
        # Get prediction
        prediction = MLPipeline.predict(features)
        
        return PredictionResponse(**prediction)
    
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# ==================== BULK PREDICTIONS ====================

@router.post("/bulk_predict", response_model=BulkPredictResponse)
async def bulk_predict(file: UploadFile = File(...)):
    """
    Predict churn for multiple members via CSV upload.
    
    CSV must contain columns:
    credit_score, country, gender, age, tenure, balance, products_number, 
    credit_card, active_member, estimated_salary
    
    Returns: job_id for polling results
    """
    try:
        # Read file
        contents = await file.read()
        
        # Parse CSV
        df = FileHandler.parse_csv_file(contents)
        
        # Validate schema
        is_valid, missing_cols, error_msg = FileHandler.validate_csv_schema(df, REQUIRED_CSV_COLUMNS)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Create job
        job_id = JobManager.create_job(file.filename, len(df))
        
        # Update job status to processing
        JobManager.update_job(job_id, status="processing")
        
        # Run predictions asynchronously (non-blocking)
        asyncio.create_task(process_bulk_predictions(job_id, df))
        
        return BulkPredictResponse(
            job_id=job_id,
            filename=file.filename,
            status="processing",
            total_records=len(df),
            processed_records=0
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Bulk prediction error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

async def process_bulk_predictions(job_id: str, df: pd.DataFrame):
    """Process bulk predictions in background"""
    try:
        # Run predictions
        result_df = MLPipeline.batch_predict(df)
        
        # Store in MongoDB (optional)
        predictions_list = result_df.to_dict('records')
        for pred in predictions_list:
            pred['created_at'] = datetime.now()
            try:
                await MongoDBManager.insert_prediction(pred)
            except Exception as e:
                logger.warning(f"Failed to store prediction in DB: {e}")
        
        # Convert results to CSV
        results_csv = FileHandler.csv_to_bytes(result_df)
        
        # Update job
        JobManager.update_job(
            job_id,
            status="completed",
            processed_records=len(result_df),
            results=results_csv.getvalue()
        )
        
        logger.info(f"✅ Bulk prediction job {job_id} completed")
    
    except Exception as e:
        logger.error(f"Error processing bulk predictions: {e}")
        JobManager.update_job(job_id, status="failed")

@router.get("/bulk_predict/{job_id}")
async def get_bulk_prediction_status(job_id: str):
    """Get status of a bulk prediction job"""
    try:
        job = JobManager.get_job(job_id)
        
        if not job:
            raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
        
        return {
            "job_id": job_id,
            "status": job['status'],
            "total_records": job['total_records'],
            "processed_records": job['processed_records'],
            "filename": job['filename']
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching job status: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/predict-single", response_model=dict)
async def predict_single_member(request: PredictRequest):
    """
    Single member prediction with storage to MongoDB.
    
    Input: 
        - credit_score (int)
        - country (str): 'France', 'Germany', 'Spain'
        - gender (str): 'M' or 'F'
        - age (int)
        - tenure (int)
        - balance (float)
        - products_number (int)
        - credit_card (int): 0 or 1
        - active_member (int): 0 or 1
        - estimated_salary (float)
    
    Output:
        - member_id (str): Unique ID for this prediction
        - churn_probability (float): 0.0-1.0
        - risk_bucket (str): High Risk, Medium Risk, Low Risk, Safe
        - days_to_churn (int or null)
        - prediction (int): 1=churn, 0=no churn
        - top_risk_factors (list): Top 3 factors
    
    Side Effect: Stores prediction to MongoDB
    """
    try:
        logger.info(f"Single prediction request: age={request.age}, country={request.country}")
        
        # Convert request to dictionary
        features_dict = request.dict()
        
        # Preprocess features (one-hot encode + scale)
        processed_features = MLPipeline.preprocess_features(features_dict)
        
        # Get prediction from model
        prediction = MLPipeline.model.predict(processed_features)[0]
        probability = MLPipeline.model.predict_proba(processed_features)[0][1]
        
        logger.info(f"Model prediction: {probability:.4f}")
        
        # Determine risk bucket and days to churn
        if probability >= 0.7:
            risk_bucket = "High Risk"
            days_to_churn = 14
        elif probability >= 0.5:
            risk_bucket = "Medium Risk"
            days_to_churn = 45
        elif probability >= 0.3:
            risk_bucket = "Low Risk"
            days_to_churn = 80
        else:
            risk_bucket = "Safe"
            days_to_churn = None
        
        # Get top risk factors
        top_risk_factors = MLPipeline.get_top_risk_factors(processed_features, top_n=3)
        
        # Generate unique member ID
        member_id = f"MEM_{uuid.uuid4().hex[:8].upper()}"
        member_name = f"Member {member_id}"
        
        # Prepare data for MongoDB storage
        prediction_data = {
            "member_id": member_id,
            "member_name": member_name,
            # Original input features
            "credit_score": request.credit_score,
            "country": request.country,
            "gender": request.gender,
            "age": request.age,
            "tenure": request.tenure,
            "balance": request.balance,
            "products_number": request.products_number,
            "credit_card": request.credit_card,
            "active_member": request.active_member,
            "estimated_salary": request.estimated_salary,
            # Prediction results
            "prediction": int(prediction),
            "churn_probability": float(probability),
            "risk_bucket": risk_bucket,
            "days_to_churn": days_to_churn,
            "top_risk_factors": top_risk_factors,
            "created_at": datetime.utcnow()
        }
        
        # Store to MongoDB
        result = await MongoDBManager.insert_prediction(prediction_data)
        logger.info(f"Prediction stored: {member_id}")
        
        # Return response
        return {
            "success": True,
            "member_id": member_id,
            "member_name": member_name,
            "churn_probability": round(float(probability), 4),
            "risk_bucket": risk_bucket,
            "days_to_churn": days_to_churn,
            "prediction": int(prediction),
            "top_risk_factors": top_risk_factors,
            "message": f"Prediction completed. Member ID: {member_id}"
        }
    
    except Exception as e:
        logger.error(f"Single prediction error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Prediction failed: {str(e)}")

@router.get("/bulk_predict/{job_id}/download")
async def download_bulk_results(job_id: str):
    """Download results CSV from a completed bulk prediction job"""
    try:
        job = JobManager.get_job(job_id)
        
        if not job:
            raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
        
        if job['status'] != "completed":
            raise HTTPException(status_code=400, detail=f"Job not completed. Status: {job['status']}")
        
        if not job['results']:
            raise HTTPException(status_code=400, detail="Results not available")
        
        return {
            "filename": f"predictions_{job_id}.csv",
            "data": job['results'].decode('utf-8')
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading results: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# ==================== MEMBER PROFILE ====================

@router.get("/member/{member_id}", response_model=MemberProfile)
async def get_member_profile(member_id: str):
    """
    Get member profile with prediction details.
    Fetches from MongoDB if available.
    """
    try:
        # Try to fetch from MongoDB
        prediction = await MongoDBManager.get_prediction_by_id(member_id)
        
        if not prediction:
            raise HTTPException(status_code=404, detail=f"Member {member_id} not found")
        
        # Remove MongoDB _id field
        prediction.pop('_id', None)
        
        # Add default top_risk_factors if missing
        if 'top_risk_factors' not in prediction or not prediction['top_risk_factors']:
            prediction['top_risk_factors'] = ["Age", "Tenure", "Balance"]
        
        return MemberProfile(**prediction)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching member profile: {e}")
        raise HTTPException(status_code=400, detail=str(e))
# ==================== MEMBERS LIST ====================

from app.utils import convert_nan_to_none  # Add this import at top

@router.get("/members")
async def get_members_list(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    risk_level: str = Query(None, regex="^(High Risk|Medium Risk|Low Risk|Safe)$|.*"),
    country: str = Query(None)
):
    """
    Get paginated list of members with optional filters.
    
    Query parameters:
    - skip: number of records to skip (pagination)
    - limit: number of records to return (max 1000)
    - risk_level: filter by risk bucket (optional)
    - country: filter by country (optional)
    """
    try:
        # Build filter query
        min_prob = None
        max_prob = None
        
        if risk_level == "High Risk":
            min_prob = 0.7
        elif risk_level == "Medium Risk":
            min_prob, max_prob = 0.5, 0.7
        elif risk_level == "Low Risk":
            min_prob, max_prob = 0.3, 0.5
        elif risk_level == "Safe":
            max_prob = 0.3
        
        # Fetch from MongoDB
        members = await MongoDBManager.get_predictions_by_risk_level(min_prob, max_prob, country)
        
        # Apply pagination
        paginated = members[skip : skip + limit]
        
        # Remove MongoDB _id field
        for member in paginated:
            member.pop('_id', None)
        
        # Convert NaN to None for JSON serialization
        paginated = convert_nan_to_none(paginated)
        
        return {
            "total": len(members),
            "skip": skip,
            "limit": limit,
            "count": len(paginated),
            "members": paginated
        }
    
    except Exception as e:
        logger.error(f"Error fetching members list: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# ==================== DASHBOARD STATISTICS ====================

@router.get("/stats/risk_distribution")
async def get_risk_distribution():
    """Get risk bucket distribution statistics"""
    try:
        # Fetch all predictions
        all_predictions = await MongoDBManager.get_all_predictions(limit=10000)
        
        logger.info(f"Fetched {len(all_predictions)} predictions from DB")
        
        # Log first record for debugging
        if all_predictions:
            logger.info(f"First record structure: {all_predictions[0]}")
        
        # Remove _id field
        for pred in all_predictions:
            pred.pop('_id', None)
        
        # Analyze
        summary = RiskBucketAnalyzer.get_risk_summary(all_predictions)
        top_at_risk = RiskBucketAnalyzer.get_top_at_risk_members(all_predictions, top_n=10)
        
        # Remove _id from top_at_risk
        for member in top_at_risk:
            member.pop('_id', None)
        
        response = {
            "summary": summary,
            "top_at_risk_members": top_at_risk
        }
        
        # Convert all NaN values to None for JSON serialization
        response = convert_nan_to_none(response)
        
        return response
    
    except Exception as e:
        logger.error(f"Error getting risk distribution: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/report/generate")
async def generate_report(request: ReportGenerateRequest):
    """
    Generate an executive report (PDF or XLSX).
    
    Filters by churn probability, country, and age.
    Returns the file as a download.
    """
    try:
        # Fetch predictions from MongoDB
        predictions = await MongoDBManager.get_predictions_by_risk_level(
            min_prob=request.min_risk_level,
            max_prob=request.max_risk_level,
            country=request.country
        )
        
        if not predictions:
            raise HTTPException(status_code=400, detail="No predictions found matching filters")
        
        # Filter by age if provided
        if request.min_age or request.max_age:
            predictions = [
                p for p in predictions
                if (request.min_age is None or p.get('age', 0) >= request.min_age) and
                   (request.max_age is None or p.get('age', 0) <= request.max_age)
            ]
        
        if not predictions:
            raise HTTPException(status_code=400, detail="No predictions found after age filtering")
        
        # Generate report
        if request.format == "pdf":
            report_buffer = ReportGenerator.generate_pdf_report(predictions, request.dict())
            filename = f"churn_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            media_type = "application/pdf"
        elif request.format == "xlsx":
            report_buffer = ReportGenerator.generate_xlsx_report(predictions, request.dict())
            filename = f"churn_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
            media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        else:
            raise HTTPException(status_code=400, detail="Invalid format. Must be 'pdf' or 'xlsx'")
        
        # Reset buffer position to beginning
        report_buffer.seek(0)
        
        # Return file as streaming response
        return StreamingResponse(
            iter([report_buffer.getvalue()]),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
from datetime import datetime

@router.post("/predict-single", response_model=dict)
async def predict_single_member(request: PredictRequest):
    """
    Single member prediction with storage to MongoDB.
    
    Input: Member features via form/JSON
    Output: Prediction + risk bucket + days to churn
    Side Effect: Stores prediction to MongoDB
    """
    try:
        logger.info(f"Single prediction request received")
        
        # Convert request to dict
        features_dict = request.dict()
        
        # Preprocess features (one-hot encode + scale)
        processed_features = MLPipeline.preprocess_features(features_dict)
        
        # Get prediction
        prediction = MLPipeline.model.predict(processed_features)[0]
        probability = MLPipeline.model.predict_proba(processed_features)[0][1]
        
        # Determine risk bucket
        if probability >= 0.7:
            risk_bucket = "High Risk"
            days_to_churn = 14
        elif probability >= 0.5:
            risk_bucket = "Medium Risk"
            days_to_churn = 45
        elif probability >= 0.3:
            risk_bucket = "Low Risk"
            days_to_churn = 80
        else:
            risk_bucket = "Safe"
            days_to_churn = None
        
        # Get feature importance (top 3 factors)
        top_risk_factors = MLPipeline.get_top_risk_factors(processed_features, top_n=3)
        
        # Generate unique member ID
        import uuid
        member_id = f"MEM_{uuid.uuid4().hex[:8].upper()}"
        
        # Prepare data for MongoDB storage
        prediction_data = {
            "member_id": member_id,
            "member_name": f"Member {member_id}",
            **features_dict,  # Include all input features
            "prediction": int(prediction),
            "churn_probability": float(probability),
            "risk_bucket": risk_bucket,
            "days_to_churn": days_to_churn,
            "top_risk_factors": top_risk_factors,
            "created_at": datetime.utcnow()
        }
        
        # Store to MongoDB
        await MongoDBManager.store_prediction(prediction_data)
        
        logger.info(f"Prediction stored: {member_id}")
        
        return {
            "member_id": member_id,
            "churn_probability": probability,
            "risk_bucket": risk_bucket,
            "days_to_churn": days_to_churn,
            "prediction": int(prediction),
            "top_risk_factors": top_risk_factors,
            "message": f"Prediction stored with ID: {member_id}"
        }
    
    except Exception as e:
        logger.error(f"Single prediction error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


# ========== HOUSEHOLD ENDPOINTS ==========

@router.get("/households", response_model=HouseholdsListResponse)
async def get_households(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    risk_level: Optional[str] = Query(None),
    sort_by: str = Query("risk", regex="^(risk|value)$")
):
    """
    Get paginated list of households.
    
    Query Parameters:
    - skip: Number of households to skip (default: 0)
    - limit: Number of households per page (default: 10, max: 100)
    - risk_level: Filter by risk level (High Risk, Medium Risk, Low Risk, Safe)
    - sort_by: Sort by 'risk' or 'value' (default: risk)
    
    Returns:
        Paginated list of households with summaries
    """
    try:
        db = MongoDBManager.database
        collection = db['households']
        
        # Build filter
        filter_dict = {}
        if risk_level:
            filter_dict['risk_bucket'] = risk_level
        
        # Get total count
        total = await collection.count_documents(filter_dict)
        
        # Determine sort order
        if sort_by == "risk":
            sort_field = [("weighted_churn_probability", -1)]  # High risk first
        else:  # sort_by == "value"
            sort_field = [("combined_balance", -1)]  # High balance first
        
        # Fetch paginated results
        cursor = collection.find(filter_dict).sort(sort_field).skip(skip).limit(limit)
        households_list = await cursor.to_list(length=limit)
        
        # Remove MongoDB _id field
        for hh in households_list:
            hh.pop('_id', None)
        
        # Calculate page number
        page = (skip // limit) + 1 if limit > 0 else 1
        
        return HouseholdsListResponse(
            total=total,
            page=page,
            limit=limit,
            households=households_list
        )
    
    except Exception as e:
        logger.error(f"Error fetching households: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/household/{household_id}", response_model=HouseholdResponse)
async def get_household_detail(household_id: str):
    """
    Get detailed information about a specific household.
    
    Path Parameters:
    - household_id: Household identifier (e.g., HH000001)
    
    Returns:
        Complete household record with all members and metrics
    """
    try:
        db = MongoDBManager.database
        collection = db['households']
        
        household = await collection.find_one({'household_id': household_id})
        
        if not household:
            raise HTTPException(status_code=404, detail=f"Household {household_id} not found")
        
        household.pop('_id', None)
        
        return HouseholdResponse(**household)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching household detail: {e}")
        raise HTTPException(status_code=400, detail=str(e))


# ========== COHORT ENDPOINTS ==========

@router.get("/cohorts", response_model=AllCohortsResponse)
async def get_all_cohorts():
    """
    Get all cohort definitions with profiles.
    
    Returns:
        All 6 cohorts with characteristics and risk profiles
    """
    try:
        db = MongoDBManager.database
        collection = db['cohorts']
        
        # Fetch all cohorts, sorted by ID
        cursor = collection.find({}).sort('cohort_id', 1)
        cohorts_list = await cursor.to_list(length=None)
        
        if not cohorts_list:
            raise HTTPException(status_code=404, detail="No cohorts found")
        
        # Remove MongoDB _id field
        for cohort in cohorts_list:
            cohort.pop('_id', None)
        
        # Count total members across all cohorts
        total_members = sum([c['characteristics']['member_count'] for c in cohorts_list])
        
        return AllCohortsResponse(
            total_cohorts=len(cohorts_list),
            total_members=total_members,
            cohorts=cohorts_list
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching cohorts: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/cohort/{cohort_id}", response_model=CohortResponse)
async def get_cohort_detail(cohort_id: int):
    """
    Get detailed information about a specific cohort.
    
    Path Parameters:
    - cohort_id: Cohort identifier (0-5)
    
    Returns:
        Cohort profile with characteristics and risk profile
    """
    try:
        db = MongoDBManager.database
        collection = db['cohorts']
        
        cohort = await collection.find_one({'cohort_id': cohort_id})
        
        if not cohort:
            raise HTTPException(status_code=404, detail=f"Cohort {cohort_id} not found")
        
        cohort.pop('_id', None)
        
        return CohortResponse(**cohort)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching cohort detail: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/cohort/{cohort_id}/members", response_model=CohortMembersResponse)
async def get_cohort_members(
    cohort_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    """
    Get paginated list of members in a specific cohort.
    
    Path Parameters:
    - cohort_id: Cohort identifier (0-5)
    
    Query Parameters:
    - skip: Number of members to skip (default: 0)
    - limit: Members per page (default: 10, max: 100)
    
    Returns:
        Paginated list of members with cohort assignments
    """
    try:
        db = MongoDBManager.database
        
        # Get cohort info
        cohorts_collection = db['cohorts']
        cohort = await cohorts_collection.find_one({'cohort_id': cohort_id})
        
        if not cohort:
            raise HTTPException(status_code=404, detail=f"Cohort {cohort_id} not found")
        
        # Get members in this cohort
        assignments_collection = db['member_cohort_assignments']
        
        # Count total members in cohort
        total = await assignments_collection.count_documents({'cohort_id': cohort_id})
        
        # Fetch paginated members
        cursor = assignments_collection.find({'cohort_id': cohort_id}).skip(skip).limit(limit)
        members_list = await cursor.to_list(length=limit)
        
        # Remove MongoDB _id field
        for member in members_list:
            member.pop('_id', None)
        
        page = (skip // limit) + 1 if limit > 0 else 1
        
        return CohortMembersResponse(
            cohort_id=cohort_id,
            cohort_name=cohort['cohort_name'],
            total_members=total,
            page=page,
            limit=limit,
            members=members_list
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching cohort members: {e}")
        raise HTTPException(status_code=400, detail=str(e))


# ========== ANALYTICS SUMMARY ENDPOINT ==========

@router.get("/analytics/summary")
async def get_analytics_summary():
    """
    Get high-level summary of households and cohorts.
    
    Returns:
        Overview metrics for dashboard
    """
    try:
        db = MongoDBManager.database
        
        # Household stats
        households_collection = db['households']
        total_households = await households_collection.count_documents({})
        
        high_risk_hh = await households_collection.count_documents({'risk_bucket': 'High Risk'})
        medium_risk_hh = await households_collection.count_documents({'risk_bucket': 'Medium Risk'})
        low_risk_hh = await households_collection.count_documents({'risk_bucket': 'Low Risk'})
        safe_hh = await households_collection.count_documents({'risk_bucket': 'Safe'})
        
        # Get top at-risk households
        top_at_risk_cursor = households_collection.find({}).sort('weighted_churn_probability', -1).limit(5)
        top_at_risk = await top_at_risk_cursor.to_list(length=5)
        for hh in top_at_risk:
            hh.pop('_id', None)
        
        # Cohort stats
        cohorts_collection = db['cohorts']
        total_cohorts = await cohorts_collection.count_documents({})
        
        cohorts_cursor = cohorts_collection.find({}).sort('cohort_id', 1)
        cohorts = await cohorts_cursor.to_list(length=None)
        for c in cohorts:
            c.pop('_id', None)
        
        return {
            'households': {
                'total': total_households,
                'high_risk': high_risk_hh,
                'medium_risk': medium_risk_hh,
                'low_risk': low_risk_hh,
                'safe': safe_hh,
                'top_at_risk': top_at_risk
            },
            'cohorts': {
                'total': total_cohorts,
                'cohorts': cohorts
            }
        }
    
    except Exception as e:
        logger.error(f"Error fetching analytics summary: {e}")
        raise HTTPException(status_code=400, detail=str(e))






    """
    Generate an executive report (PDF or XLSX).
    
    Filters by churn probability, country, and age.
    Returns the file as a download.
    """
    try:
        # Fetch predictions from MongoDB
        predictions = await MongoDBManager.get_predictions_by_risk_level(
            min_prob=request.min_risk_level,
            max_prob=request.max_risk_level,
            country=request.country
        )
        
        if not predictions:
            raise HTTPException(status_code=400, detail="No predictions found matching filters")
        
        # Filter by age if provided
        if request.min_age or request.max_age:
            predictions = [
                p for p in predictions
                if (request.min_age is None or p.get('age', 0) >= request.min_age) and
                   (request.max_age is None or p.get('age', 0) <= request.max_age)
            ]
        
        if not predictions:
            raise HTTPException(status_code=400, detail="No predictions found after age filtering")
        
        # Generate report
        if request.format == "pdf":
            report_buffer = ReportGenerator.generate_pdf_report(predictions, request.dict())
            filename = f"churn_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            media_type = "application/pdf"
        elif request.format == "xlsx":
            report_buffer = ReportGenerator.generate_xlsx_report(predictions, request.dict())
            filename = f"churn_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
            media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        else:
            raise HTTPException(status_code=400, detail="Invalid format. Must be 'pdf' or 'xlsx'")
        
        # Return file as download
        return FileResponse(
            report_buffer,
            media_type=media_type,
            filename=filename,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        raise HTTPException(status_code=400, detail=str(e))
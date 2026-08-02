import logging
import asyncio
from fastapi import APIRouter, File, UploadFile, Query, HTTPException
from fastapi.responses import FileResponse
from fastapi.responses import StreamingResponse

from datetime import datetime
import pandas as pd
import numpy as np

from app.models import (
    PredictRequest, PredictionResponse, MemberProfile,
    BulkPredictRequest, BulkPredictResponse, HealthResponse,
    ReportGenerateRequest, ReportGenerateResponse
)
from app.ml_pipeline import MLPipeline
from app.database import MongoDBManager
from app.report_generator import ReportGenerator
from app.utils import FileHandler, JobManager, RiskBucketAnalyzer
from app.config import settings


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
        # ==================== REPORT GENERATION ====================



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
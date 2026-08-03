import logging
import csv
from io import StringIO, BytesIO
from typing import List, Dict
import pandas as pd
import uuid

logger = logging.getLogger(__name__)

class FileHandler:
    """Handle file operations (CSV parsing, saving, etc.)"""
    
    @staticmethod
    def parse_csv_file(file_content: bytes, encoding: str = 'utf-8') -> pd.DataFrame:
        """
        Parse CSV file content into DataFrame.
        Returns: DataFrame or raises exception
        """
        try:
            # Try to decode the file
            content_str = file_content.decode(encoding)
            
            # Parse CSV
            df = pd.read_csv(StringIO(content_str))
            
            logger.info(f"✅ CSV parsed successfully. Rows: {len(df)}, Columns: {len(df.columns)}")
            return df
            
        except UnicodeDecodeError:
            # Try alternative encoding
            logger.warning("UTF-8 decoding failed, trying latin-1")
            try:
                content_str = file_content.decode('latin-1')
                df = pd.read_csv(StringIO(content_str))
                return df
            except Exception as e:
                logger.error(f"Error parsing CSV: {e}")
                raise ValueError(f"Failed to parse CSV file: {str(e)}")
        except Exception as e:
            logger.error(f"Error parsing CSV: {e}")
            raise ValueError(f"Failed to parse CSV file: {str(e)}")

    @staticmethod
    def validate_csv_schema(df: pd.DataFrame, required_columns: List[str]) -> tuple:
        """
        Validate that CSV has required columns.
        Returns: (is_valid, missing_columns, error_message)
        """
        missing_cols = [col for col in required_columns if col not in df.columns]
        
        if missing_cols:
            error_msg = f"Missing required columns: {', '.join(missing_cols)}"
            logger.error(error_msg)
            return False, missing_cols, error_msg
        
        logger.info("✅ CSV schema validated")
        return True, [], None

    @staticmethod
    def csv_to_bytes(df: pd.DataFrame) -> BytesIO:
        """
        Convert DataFrame to CSV bytes.
        Returns: BytesIO object
        """
        try:
            csv_buffer = StringIO()
            df.to_csv(csv_buffer, index=False)
            
            # Convert to BytesIO
            csv_bytes = BytesIO(csv_buffer.getvalue().encode('utf-8'))
            csv_bytes.seek(0)
            
            logger.info("✅ DataFrame converted to CSV bytes")
            return csv_bytes
        except Exception as e:
            logger.error(f"Error converting DataFrame to CSV: {e}")
            raise

class JobManager:
    """Manage async job tracking"""
    
    # In-memory job storage (replace with database in production)
    jobs: Dict[str, dict] = {}

    @classmethod
    def create_job(cls, filename: str, total_records: int) -> str:
        """Create a new job and return job_id"""
        job_id = str(uuid.uuid4())
        cls.jobs[job_id] = {
            "filename": filename,
            "status": "pending",
            "total_records": total_records,
            "processed_records": 0,
            "results": None,
        }
        logger.info(f"✅ Job created: {job_id}")
        return job_id

    @classmethod
    def update_job(cls, job_id: str, **kwargs):
        """Update job status"""
        if job_id in cls.jobs:
            cls.jobs[job_id].update(kwargs)
            logger.info(f"Job {job_id} updated: {kwargs}")

    @classmethod
    def get_job(cls, job_id: str) -> dict:
        """Get job status"""
        return cls.jobs.get(job_id, None)

    @classmethod
    def delete_job(cls, job_id: str):
        """Delete job from memory"""
        if job_id in cls.jobs:
            del cls.jobs[job_id]

class RiskBucketAnalyzer:
    """Analyze risk distribution"""
    
    @staticmethod
    def get_risk_summary(predictions: list) -> dict:
        """
        Get summary of risk distribution.
        Returns: dict with counts by risk level
        """
        try:
        # Handle empty list
            if not predictions:
                return {
                "high_risk": 0,
                "medium_risk": 0,
                "low_risk": 0,
                "safe": 0,
                "members": 0,
                }
        
            # Convert to DataFrame
            df = pd.DataFrame(predictions)
        
            # Validate required column exists
            if 'churn_probability' not in df.columns:
                logger.error(f"Available columns: {df.columns.tolist()}")
                raise ValueError("'churn_probability' column not found in predictions data")
        
            # Convert to numeric (in case it's stored as string)
            df['churn_probability'] = pd.to_numeric(df['churn_probability'], errors='coerce')
        
            summary = {
            "high_risk": int(len(df[df['churn_probability'] >= 0.7])),
            "medium_risk": int(len(df[(df['churn_probability'] >= 0.5) & (df['churn_probability'] < 0.7)])),
            "low_risk": int(len(df[(df['churn_probability'] >= 0.3) & (df['churn_probability'] < 0.5)])),
            "safe": int(len(df[df['churn_probability'] < 0.3])),
            "members": int(len(df)),
            }
        
            logger.info(f"Risk summary: {summary}")
            return summary
        except Exception as e:
            logger.error(f"Error analyzing risk: {e}")
            raise

    @staticmethod
    def get_top_at_risk_members(predictions: list, top_n: int = 10) -> list:
        """Get top N at-risk members"""
        try:
            df = pd.DataFrame(predictions)
            top = df.nlargest(top_n, 'churn_probability').to_dict('records')
            return top
        except Exception as e:
            logger.error(f"Error getting top at-risk members: {e}")
            raise
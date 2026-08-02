import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.ml_pipeline import MLPipeline
from app.database import MongoDBManager
from app.routes import router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== LIFESPAN EVENTS ====================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handle startup and shutdown events.
    Loads model and connects to database on startup.
    Closes connections on shutdown.
    """
    
    # ===== STARTUP =====
    logger.info("🚀 Starting up FastAPI application...")
    
    try:
        # Load ML model
        logger.info("Loading ML model...")
        MLPipeline.load_model()
        logger.info("✅ ML model loaded successfully")
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        raise
    
    try:
        # Connect to MongoDB
        logger.info("Connecting to MongoDB Atlas...")
        await MongoDBManager.connect_db()
        logger.info("✅ Connected to MongoDB Atlas")
    except Exception as e:
        logger.error(f"❌ Failed to connect to MongoDB: {e}")
        # Don't raise - API can still work without DB for predictions
        logger.warning("⚠️  API will work without database (predictions only)")
    
    yield
    
    # ===== SHUTDOWN =====
    logger.info("🛑 Shutting down FastAPI application...")
    
    try:
        await MongoDBManager.close_db()
        logger.info("✅ Closed MongoDB connection")
    except Exception as e:
        logger.error(f"Error closing database: {e}")

# ==================== CREATE FASTAPI APP ====================

app = FastAPI(
    title="Credit Union Member Churn Prediction API",
    description="ML API for predicting credit union member churn",
    version="1.0.0",
    lifespan=lifespan
)

# ==================== CORS MIDDLEWARE ====================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (configure for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== EXCEPTION HANDLERS ====================

@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    """Handle ValueError exceptions"""
    logger.error(f"ValueError: {str(exc)}")
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# ==================== INCLUDE ROUTES ====================

app.include_router(router)

# ==================== ROOT ENDPOINT ====================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Credit Union Member Churn Prediction API",
        "docs": "/docs",
        "version": "1.0.0"
    }

# ==================== STARTUP LOG ====================

logger.info(f"🔧 Environment: {settings.environment}")
logger.info(f"🔧 Debug mode: {settings.debug}")
logger.info(f"🔧 Model path: {settings.model_path}")
logger.info(f"🔧 MongoDB database: {settings.mongodb_db_name}")
# Phase 3: Backend API (FastAPI) - COMPLETED ✅

## Objective
Build a production-ready FastAPI backend to serve churn predictions, manage member data via MongoDB, and generate PDF/XLSX reports.

---

## What We Built

### 1. **FastAPI Application Structure**
backend/
├── app/
│ ├── init.py # Package initialization
│ ├── main.py # FastAPI app & lifespan events
│ ├── config.py # Environment variables & settings
│ ├── models.py # Pydantic request/response schemas
│ ├── database.py # MongoDB async operations
│ ├── ml_pipeline.py # Model loading & predictions
│ ├── report_generator.py # PDF/XLSX report generation
│ ├── utils.py # Helper functions (file handling, jobs, risk analysis)
│ └── routes.py # All API endpoints
├── tests/
│ └── test_endpoints.py # Unit tests
├── requirements.txt # Python dependencies
├── .env.example # Environment template
└── .env # (Create from .env.example)
---

## 2. **Key Features Implemented**

### ✅ Model Loading
- Loads trained `.joblib` model from `models/churn_model.joblib` at startup
- Handles feature preprocessing (encoding, normalization)
- Extracts top risk factors using feature importance

### ✅ MongoDB Integration
- Async MongoDB connection using Motor
- Database: `Credit_Union_Member_Churn`
- Collection: `Credit_Union_Member_Churn_Prediction_System`
- Stores member profiles & predictions with timestamps

### ✅ Risk Bucketing
- **High Risk (≥70%)**: ~14 days to churn
- **Medium Risk (50-70%)**: ~45 days to churn
- **Low Risk (30-50%)**: ~80 days to churn
- **Safe (<30%)**: Low churn risk

### ✅ Report Generation
- **PDF Reports**: Professional executive summaries with:
  - Summary statistics
  - Risk distribution breakdown
  - Top 10 at-risk members table
- **XLSX Reports**: Multi-sheet workbooks with:
  - Summary sheet
  - Detailed predictions sheet
  - Formatted cells & borders

### ✅ Async Job Processing
- Bulk CSV predictions run asynchronously (non-blocking)
- Job status tracking (pending → processing → completed)
- Download results as CSV

### ✅ Error Handling & Logging
- Comprehensive logging for debugging
- Custom exception handlers
- Input validation (Pydantic schemas)
- Graceful error responses

---

## 3. **API Endpoints**

### Health & Status
GET /health
Returns: API status, model loaded, database connected
### Single Prediction
POST /predict
Input: Member features (JSON)
Output: Churn probability, risk bucket, top 3 risk factors

Example Request:
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

Example Response:
{
"churn_probability": 0.7234,
"risk_bucket": "High Risk",
"days_to_churn": 14,
"top_risk_factors": ["tenure", "balance", "credit_score"],
"prediction": 1
}
### Bulk Predictions (CSV Upload)
POST /bulk_predict
Input: CSV file with member data
Output: job_id for polling
Returns: {job_id, filename, status, total_records}

GET /bulk_predict/{job_id}
Returns: Job status & progress

GET /bulk_predict/{job_id}/download
Returns: CSV with predictions
### Member Profile

GET /member/{member_id}
Returns: Complete member profile with prediction details

GET /members?skip=0&limit=100&risk_level=High%20Risk&country=France
Returns: Paginated list of members with optional filters

### Dashboard Statistics
GET /stats/risk_distribution
Returns: Risk bucket counts & top 10 at-risk members
### Report Generation
POST /report/generate
Input: {
"min_risk_level": 0.5,
"max_risk_level": 0.8,
"country": "France",
"min_age": 30,
"max_age": 60,
"format": "pdf" // or "xlsx"
}
Output: Generated report (PDF/XLSX)
---

## 4. **Dependencies Installed**
fastapi
uvicorn
pydantic
pydantic-settings
python-dotenv
joblib
pandas
numpy
scikit-learn
xgboost
lightgbm
motor
pymongo
python-docx
reportlab
openpyxl
shap
httpx
pytest
---

## 5. **Setup Instructions**

### Step 1: Create `.env` file
Copy `.env.example` to `.env` and fill in:

MONGODB_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
MONGODB_DB_NAME=Credit_Union_Member_Churn
MONGODB_COLLECTION_NAME=Credit_Union_Member_Churn_Prediction_System
MODEL_PATH=../models/churn_model.joblib
ENVIRONMENT=development
DEBUG=True

### Step 2: Install dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Run locally
```bash
uvicorn app.main:app --reload
```

### Step 4: Access API
- **Interactive Docs:** http://localhost:8000/docs
- **Alternative Docs:** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/health

---

## 6. **Key Design Decisions**

| Decision | Rationale |
|----------|-----------|
| **Async/Await** | Non-blocking bulk predictions; scales better |
| **Motor (Async MongoDB)** | True async I/O with database; no blocking threads |
| **Pydantic** | Type validation, automatic OpenAPI docs |
| **Lifespan Context** | Clean startup/shutdown logic; loads model once |
| **CORS Enabled** | Allows frontend (Vercel) to communicate with backend (Render) |
| **Logging** | Easy debugging in production |
| **Job Manager (In-Memory)** | Simple tracking for MVP; can be upgraded to DB later |

---

## 7. **Testing**

Run tests with:
```bash
pytest tests/test_endpoints.py -v
```

Tests cover:
- ✅ Health check endpoint
- ✅ Single prediction validation
- ✅ Bulk prediction CSV handling
- ✅ Missing field validation
- ✅ Risk distribution stats

---

## 8. **Production Considerations**

### Before Deploying to Render:

1. **Security**
   - [ ] Change `allow_origins=["*"]` to specific frontend URL
   - [ ] Add rate limiting
   - [ ] Add API key authentication (optional)

2. **Monitoring**
   - [ ] Set up error logging (Sentry, LogRocket)
   - [ ] Monitor API response times
   - [ ] Track model prediction accuracy

3. **Database**
   - [ ] Ensure MongoDB Atlas free tier has enough space
   - [ ] Set up backups (Atlas auto-backup)
   - [ ] Monitor connection limits

4. **Performance**
   - [ ] Optimize batch predictions for large CSVs (>10K rows)
   - [ ] Consider caching frequently accessed member profiles
   - [ ] Profile model inference time

### Deployment Checklist:
- [ ] `.env` file created with production MongoDB URL
- [ ] All dependencies in `requirements.txt`
- [ ] Model file path correct
- [ ] Error logging configured
- [ ] CORS origins updated
- [ ] Health check passing

---

## 9. **File Size Summary**

| File | Lines | Purpose |
|------|-------|---------|
| main.py | ~100 | FastAPI initialization |
| routes.py | ~350 | 9 API endpoints |
| ml_pipeline.py | ~180 | Model & predictions |
| database.py | ~120 | MongoDB operations |
| report_generator.py | ~270 | PDF/XLSX generation |
| models.py | ~60 | Pydantic schemas |
| config.py | ~30 | Settings |
| utils.py | ~150 | Helpers |
| **Total** | **~1,260** | **Complete backend** |

---

## 10. **What's Next: Phase 4**

Next phase we'll build:
- ✅ Next.js 14 frontend dashboard
- ✅ Member profile pages
- ✅ CSV upload UI
- ✅ Report generator UI
- ✅ Risk distribution charts
- ✅ Connect to these backend endpoints

---

## 11. **Troubleshooting**

### Model not loading?
- Check `MODEL_PATH` in `.env` points to correct `.joblib` file
- Verify model was trained with same features as `MLPipeline.feature_names`

### MongoDB connection fails?
- Verify `MONGODB_URL` is correct (check Atlas dashboard)
- Ensure cluster IP whitelist allows your machine
- Check database/collection names in `.env`

### Bulk predictions slow?
- CSV size too large? Process in chunks
- Consider upgrading to async batch processing with Celery (Phase 5+)

### CORS errors from frontend?
- Update `allow_origins` in `main.py` with your frontend URL
- Example: `allow_origins=["https://yourfrontend.vercel.app"]`

---

## ✨ Phase 3 Complete!

**Backend API is production-ready and fully documented.**

Next: Phase 4 - Frontend Dashboard (Next.js + React)

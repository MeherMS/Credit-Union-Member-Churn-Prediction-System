# Credit Union Member Churn Prediction System
## Technical Roadmap

---

## 1. PROJECT OVERVIEW

**Objective**: Build a full-stack web application that predicts member churn in credit unions using ML, displays executive dashboards, and generates bulk reports.

**Target Users**: Credit union executives/leadership (portfolio showcase)

**Data**: Kaggle Bank Customer Churn Dataset (10K records)

**Prediction Task**: Binary classification (will churn in 90 days?) + probability-based urgency buckets ("High Risk: ~14 days", "Medium: ~45 days", "Low: ~80 days")

**Deployment**: Render (backend) + Vercel (frontend)

**Cost**: 100% free tier

---

## 2. ARCHITECTURE OVERVIEW
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (Vercel) │
│ Next.js/React Dashboard + Member Profiles + Report Generator│
└─────────────────────┬───────────────────────────────────────┘
│ HTTPS
▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND API (Render) │
│ FastAPI + ML Pipeline + Report Generation + Data Management │
└─────────────────────┬───────────────────────────────────────┘
│
┌─────────────┴─────────────┐
▼ ▼
┌──────────────┐ ┌──────────────────┐
│ ML Model │ │ Data / Reports │
│ (Serialized) │ │ (JSON / CSV) │
└──────────────┘ └──────────────────┘

---

## 3. TECH STACK

| Layer          | Technology                  | Rationale                                   |
|----------------|-----------------------------|---------------------------------------------|
| **Frontend**   | Next.js 14 + React + Tailwind CSS | Fast, full-featured, free hosting on Vercel |
| **Backend**    | FastAPI (Python)            | Async, lightweight, excellent for ML        |
| **ML/Data**    | scikit-learn, pandas, numpy | Industry standard, free, well-documented    |
| **Deployment** | Render (free tier)          | Free Python backend hosting                 |
| **Hosting**    | Vercel (free tier)          | Free Next.js hosting                        |
| **Visualization** | Recharts (React)          | Free charting library                       |
| **Reports**    | ReportLab / python-docx    | Free PDF/DOCX generation                    |
| **Database**   | MongoDB Atlas (free tier)   | Optional: store predictions, member profiles|
| **Version Control** | GitHub                  | Free repository                             |

---

## 4. PHASE BREAKDOWN

### **PHASE 1: DATA PREPARATION & EDA**

**Objective**: Understand data, engineer features, prepare for modeling

**Deliverables**:
- Jupyter notebook with full EDA
- Feature engineering pipeline
- Train/test split (80/20)
- Data quality report

**Tasks**:
1. Load Kaggle dataset
2. Exploratory Data Analysis
   - Check for missing values, duplicates
   - Distribution analysis (credit_score, age, balance, etc.)
   - Correlation heatmap with target (churn)
3. Feature Engineering
   - Encode categorical variables (country, gender) → one-hot or label encoding
   - Normalize numerical features (credit_score, balance, estimated_salary)
   - Feature importance analysis
4. Handle class imbalance (if churn rate is skewed)
   - SMOTE or class weight balancing
5. Create train/test/validation splits
6. Save processed dataset as CSV/pickle

**Deliverables Location**: `/data/` folder in GitHub repo

**Timeline**: 2-3 days

---

### **PHASE 2: ML MODEL TRAINING & EVALUATION**

**Objective**: Train, evaluate, and finalize churn prediction model

**Deliverables**:
- Trained model (serialized as `.pkl` or `.joblib`)
- Model evaluation report (accuracy, precision, recall, ROC-AUC, confusion matrix)
- Probability calibration analysis
- Feature importance ranking

**Tasks**:
1. Train multiple models in parallel
   - Logistic Regression (baseline)
   - Random Forest
   - XGBoost
   - LightGBM
2. Hyperparameter tuning (GridSearchCV or Optuna)
3. Cross-validation (5-fold)
4. Evaluate on test set
   - Metrics: Accuracy, Precision, Recall, F1, ROC-AUC
   - Confusion matrix
5. Probability calibration
   - Use calibrated probabilities for risk bucketing
   - Ensure predicted probabilities reflect true likelihood
6. Feature importance analysis
   - Identify top predictive features for exec dashboard
7. Serialize best model
   - Save as `churn_model.pkl` or `.joblib`

**Model Selection Criteria**:
- Best ROC-AUC on test set
- Reasonable inference speed (< 100ms per prediction)
- Interpretability (feature importance visible to execs)

**Probability Bucketing Logic** (for time-to-churn):

High Risk: prob >= 0.7 → "Will churn in ~14 days"
Medium Risk: 0.5 <= prob < 0.7 → "Will churn in ~45 days"
Low Risk: 0.3 <= prob < 0.5 → "Will churn in ~80 days"
Safe: prob < 0.3 → "Low churn risk"

*(Buckets calibrated based on actual model performance)*

**Deliverables Location**: `/models/` folder; model card documentation

**Timeline**: 3-5 days

---

### **PHASE 3: BACKEND API (FastAPI)**

**Objective**: Build API to serve predictions, manage member data, and generate reports

**Tech Stack**: FastAPI, Pydantic, pandas, joblib

**Deliverables**:
- `/predict` endpoint (single member prediction)
- `/bulk_predict` endpoint (CSV upload → batch predictions)
- `/member/<id>` endpoint (member profile + prediction + charts)
- `/report/generate` endpoint (bulk report generation)
- `/health` endpoint (system status)

**API Endpoints**:

1. **POST `/predict`**
   - Input: Member features (JSON)
   - Output: Churn probability, risk bucket, top 3 risk factors
   - Example:
```json
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
```

2. **POST `/bulk_predict`**
   - Input: CSV file (members data)
   - Output: CSV with predictions + risk buckets + feature importance per member
   - Processing: Async job (returns job_id for polling)

3. **GET `/member/<member_id>`**
   - Output: Member profile with:
     - Churn probability + risk bucket
     - Feature importance (radar chart data)
     - Historical predictions (if stored in DB)

4. **POST `/report/generate`**
   - Input: Filters (risk level, country, age range) + format (PDF/XLSX)
   - Output: Downloadable executive report
   - Includes: summary statistics, risk breakdown, top at-risk members, recommendations

5. **GET `/health`**
   - Output: API status, model loaded, database connection

**Data Flow**:

CSV Upload → Validation → Batch Prediction → Feature Importance → CSV Export

**Tasks**:
1. Set up FastAPI project structure
   - `/app/main.py` (app initialization)
   - `/app/models.py` (Pydantic schemas)
   - `/app/routes.py` (endpoints)
   - `/app/ml_pipeline.py` (prediction logic)
   - `/app/report_generator.py` (report logic)
2. Load trained model at startup
3. Implement prediction pipeline
   - Input validation
   - Feature preprocessing
   - Model inference
   - Probability bucketing
4. Implement feature importance extraction
   - Use SHAP or model.feature_importances_
5. Implement bulk CSV processing
   - Async job handling
6. Implement report generation
   - PDF: use ReportLab or python-docx
   - XLSX: use openpyxl or pandas
   - Include charts, summary stats, member lists
7. Add error handling & logging
8. Add CORS headers for frontend communication

**Deliverables Location**: `/backend/` folder

**Dependencies** (requirements.txt):

fastapi==0.104.0
uvicorn==0.24.0
pydantic==2.4.0
joblib==1.3.2
pandas==2.1.0
numpy==1.26.0
scikit-learn==1.3.2
xgboost==2.0.0
lightgbm==4.0.0
python-docx==0.8.11
reportlab==4.0.7
openpyxl==3.11.0
shap==0.43.0

**Timeline**: 4-6 days

---

### **PHASE 4: FRONTEND DASHBOARD (Next.js + React)**

**Objective**: Build executive dashboard with member profiles and report generator

**Tech Stack**: Next.js 14, React, Tailwind CSS, Recharts

**Pages & Components**:

1. **Dashboard Home** (`/`)
   - Summary cards:
     - Total members
     - High-risk count
     - Medium-risk count
     - Low-risk count
   - Risk distribution chart (donut/bar)
   - Top 10 at-risk members (table)
   - Filters: Country, age range, product count

2. **Member Profile** (`/members/<id>`)
   - Member info card (name, ID, demographics)
   - Churn prediction panel
     - Probability (gauge/progress bar)
     - Risk bucket (color-coded: red/orange/yellow/green)
     - Predicted days to churn
   - Feature importance radar chart (top 5 features driving prediction)
   - Historical predictions (if stored)
   - Recommended interventions (mock data or hard-coded)

3. **All Members** (`/members`)
   - Sortable, filterable table
   - Columns: ID, age, country, balance, risk_bucket, probability
   - Inline search
   - Pagination (50 per page)

4. **Bulk Predictions** (`/upload`)
   - CSV upload widget
   - File validation
   - Progress indicator
   - Download results (CSV with predictions)

5. **Report Generator** (`/reports`)
   - Filter options (risk level, country, age range)
   - Format selection (PDF / XLSX)
   - Generate button
   - Download link

6. **Navigation**
   - Sidebar with links to all pages
   - Logo / branding

**Tasks**:
1. Set up Next.js 14 project
   - `app/` directory structure
   - `page.tsx` for each route
2. Build dashboard components
   - Summary cards (Recharts)
   - Charts (bar, donut, radar)
   - Member table with filtering/sorting
3. Build member profile page
   - Fetch from backend
   - Display prediction + feature importance
4. Build CSV upload page
   - File input + validation
   - Call `/bulk_predict` endpoint
   - Display results table
   - Download CSV
5. Build report generator
   - Form inputs (filters)
   - Call `/report/generate` endpoint
   - Trigger download
6. Add global state management
   - useState + Context API (no Redux needed)
   - Cache API responses
7. Add loading states, error handling
8. Add responsive design (mobile-friendly)
9. Add documentation (README)

**UI/UX Considerations**:
- Risk levels color-coded: Red (>0.7), Orange (0.5-0.7), Yellow (0.3-0.5), Green (<0.3)
- Clean, professional design (not flashy)
- Focus on readability for exec audience
- No unnecessary animations

**Deliverables Location**: `/frontend/` folder

**Key Dependencies** (package.json):
```json
{
  "next": "14.0.0",
  "react": "18.2.0",
  "recharts": "2.10.0",
  "tailwindcss": "3.3.0",
  "axios": "1.6.0"
}
```

**Timeline**: 5-7 days

---

### **PHASE 5: INTEGRATION & API CONNECTIVITY**

**Objective**: Connect frontend to backend, test end-to-end flows

**Tasks**:
1. Configure API base URL (env variable for local/prod)
2. Test all endpoints from frontend
   - GET /health
   - POST /predict
   - POST /bulk_predict
   - GET /member/<id>
   - POST /report/generate
3. Mock data for development (if backend not ready)
4. Handle API errors & timeouts gracefully
5. Add loading spinners & success notifications
6. Test CSV upload flow end-to-end
7. Test report download end-to-end
8. Add request/response logging

**Deliverables**: All flows tested, documented in GitHub issues

**Timeline**: 2-3 days

---

### **PHASE 6: DEPLOYMENT**

**Objective**: Deploy backend to Render and frontend to Vercel

**Backend Deployment (Render)**:
1. Create Render account (free tier)
2. Connect GitHub repo
3. Create Web Service
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
   - Environment variables:
     - `MODEL_PATH=/models/churn_model.pkl`
     - `ENVIRONMENT=production`
4. Deploy (auto-deploys on push to main)
5. Set up Render cron job (optional) for model retraining

**Frontend Deployment (Vercel)**:
1. Create Vercel account (free tier)
2. Import GitHub repo
3. Configure build
   - Framework: Next.js
   - Build command: `next build`
4. Set environment variables
   - `NEXT_PUBLIC_API_URL=<render-backend-url>`
5. Deploy (auto-deploys on push to main)

**Post-Deployment**:
- Test all endpoints from deployed URLs
- Monitor Render logs for errors
- Set up basic monitoring (Render free tier includes logs)
- Document deployment steps in README

**Deliverables**: Live URLs for backend & frontend

**Timeline**: 1-2 days

---

### **PHASE 7: POLISH & DOCUMENTATION**

**Objective**: Add finishing touches, documentation, and portfolio readiness

**Tasks**:
1. Add comprehensive README
   - Project overview
   - How to run locally
   - API documentation
   - Feature walkthrough
   - Tech stack rationale
2. Add model card
   - Model type, training data, performance metrics
   - Limitations & ethical considerations
3. Add API documentation (Swagger/OpenAPI)
   - Auto-generated from FastAPI
4. Add error handling
   - 400/404/500 error pages
   - Graceful degradation
5. Add logging
   - Backend: Python logging
   - Frontend: Console logging for debugging
6. Create sample data / demo account
7. Add LinkedIn post / portfolio blurb
8. Record demo video (optional but impressive)
9. Add GitHub badges (build status, license, etc.)

**Deliverables**: Polished, portfolio-ready project

**Timeline**: 2-3 days

---

## 5. COMPLETE PROJECT STRUCTURE

credit-union-churn/
├── README.md
├── .gitignore
├── LICENSE
│
├── data/
│ ├── raw/
│ │ └── bank_churn_dataset.csv
│ ├── processed/
│ │ ├── train.csv
│ │ ├── test.csv
│ │ └── validation.csv
│ └── eda_report.ipynb
│
├── models/
│ ├── churn_model.pkl
│ ├── model_card.md
│ └── training_notebook.ipynb
│
├── backend/
│ ├── requirements.txt
│ ├── .env.example
│ ├── app/
│ │ ├── init.py
│ │ ├── main.py
│ │ ├── models.py (Pydantic schemas)
│ │ ├── routes.py (endpoints)
│ │ ├── ml_pipeline.py
│ │ ├── report_generator.py
│ │ ├── utils.py
│ │ └── config.py
│ └── tests/
│ └── test_endpoints.py
│
├── frontend/
│ ├── package.json
│ ├── next.config.js
│ ├── tailwind.config.js
│ ├── .env.example
│ ├── app/
│ │ ├── page.tsx (home / dashboard)
│ │ ├── members/
│ │ │ ├── page.tsx (all members table)
│ │ │ └── [id]/
│ │ │ └── page.tsx (member profile)
│ │ ├── upload/
│ │ │ └── page.tsx (bulk prediction)
│ │ ├── reports/
│ │ │ └── page.tsx (report generator)
│ │ ├── layout.tsx
│ │ └── globals.css
│ ├── components/
│ │ ├── Header.tsx
│ │ ├── Sidebar.tsx
│ │ ├── SummaryCard.tsx
│ │ ├── RiskGauge.tsx
│ │ ├── FeatureRadar.tsx
│ │ ├── MemberTable.tsx
│ │ └── CSVUploader.tsx
│ ├── lib/
│ │ ├── api.ts (API client)
│ │ └── utils.ts (helpers)
│ └── public/
│ └── assets/
│
└── .github/
└── workflows/
└── deploy.yml (CI/CD)

---

## 6. TIMELINE SUMMARY

| Phase                       | Days | Total (Cumulative) |
|-----------------------------|------|--------------------|
| Phase 1: Data Prep & EDA    | 2-3  | 2-3                |
| Phase 2: ML Training        | 3-5  | 5-8                |
| Phase 3: Backend API        | 4-6  | 9-14               |
| Phase 4: Frontend Dashboard | 5-7  | 14-21              |
| Phase 5: Integration        | 2-3  | 16-24              |
| Phase 6: Deployment         | 1-2  | 17-26              |
| Phase 7: Polish & Docs      | 2-3  | 19-29              |
|                             |      |                    |
| **TOTAL**                   |      | **~3-4 weeks**     |

---

## 7. KEY DELIVERABLES PER PHASE

| Phase | GitHub Artifacts | Shareable Output |
|-------|------------------|------------------|
| 1 | EDA notebook, processed data | Data summary report |
| 2 | Model file, training notebook | Model performance report |
| 3 | Backend code, API docs | Swagger API endpoint |
| 4 | Frontend code, components | Live dashboard URL |
| 5 | Integration tests | Working end-to-end demo |
| 6 | Deployment configs | Live backend + frontend URLs |
| 7 | Complete documentation | Ready-to-share portfolio link |

---

## 8. RISK MITIGATION

| Risk | Mitigation |
|------|-----------|
| **Model overfitting** | Cross-validation, test set evaluation, feature selection |
| **Slow API responses** | Batch prediction optimization, caching predictions |
| **Render/Vercel downtime** | Free tier SLA is ~99.5%; document in README as demo limitation |
| **CSV upload fails** | Validate schema, handle encoding issues, provide error messages |
| **Frontend-backend communication errors** | Error boundaries, retry logic, graceful degradation |
| **Unbalanced classes** | SMOTE or class weighting in Phase 2 |
| **Model staleness** | Document that model is static (trained once); note for future: retrain quarterly |

---

## 9. PORTFOLIO POSITIONING

**What to highlight when sharing**:
1. **End-to-end ML application** (data → model → API → dashboard)
2. **Production-ready architecture** (async API, error handling, logging)
3. **Scalable design** (bulk predictions, batch processing)
4. **Clean code & documentation** (README, model card, API docs)
5. **Real-world domain knowledge** (credit union churn is high-value business problem)
6. **Deployment on free tier** (shows cost-consciousness & DevOps thinking)

**Sharing strategy**:
- GitHub repo with comprehensive README
- LinkedIn post explaining the project + tech decisions
- Live dashboard link (send to friends/college)
- Demo video (5 min walkthrough)
- Model card + approach document

---

## 10. FUTURE ENHANCEMENTS (NOT IN MVP)

- [ ] Database (MongoDB Atlas) to store predictions over time
- [ ] Monitoring dashboard (model drift, prediction distribution)
- [ ] A/B testing interventions (mock data for recommendations)
- [ ] Real-time notifications (email alerts for high-risk members)
- [ ] Admin panel (retrain model, manage data)
- [ ] Mobile app version
- [ ] Explainability UI (SHAP force plots)
- [ ] Survival analysis (more sophisticated time-to-churn)

---

## 11. GETTING STARTED CHECKLIST

- [ ] Kaggle account + download dataset
- [ ] GitHub repo initialized
- [ ] Python virtual environment set up
- [ ] Render account created
- [ ] Vercel account created
- [ ] Requirements.txt + package.json templates ready
- [ ] First commit pushed to GitHub


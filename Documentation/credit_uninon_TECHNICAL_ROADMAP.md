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


### **PHASE 8: HOUSEHOLD & COHORT ANALYTICS**

**Objective**: Group individual churn predictions into business units (households) and lifecycle segments (cohorts) for targeted retention strategies

**Datasets Required**:
- Existing member data (10K records from Phase 1)
- Optional Kaggle: "Customer Lifetime Value Prediction"
  - https://www.kaggle.com/datasets/

**Deliverables**:
- Household grouping algorithm + membership mapping
- 5-8 behavioral cohorts auto-discovered via clustering
- New MongoDB collections: `households`, `cohorts`, `member_cohort_assignments`
- Dashboard pages: `/households`, `/cohorts`, `/cohort/<id>`
- Backend analysis module: `app/analytics/household_analyzer.py`, `app/analytics/cohort_analyzer.py`

**Tech Stack**: scikit-learn (K-Means clustering), pandas, MongoDB

**New API Endpoints**:
1. **GET `/households`** - List all households with summary stats
2. **GET `/household/<household_id>`** - Household details + member list + churn risk
3. **GET `/cohorts`** - All cohorts with churn rates + characteristics
4. **GET `/cohort/<cohort_id>`** - Cohort details + member breakdown
5. **POST `/analytics/assign_cohorts`** - Cluster and assign all members to cohorts

**New Frontend Pages**:
1. **`/households`** - Household overview dashboard
   - Household count by risk level
   - Household size distribution
   - Household lifetime value chart
   - Top 10 highest-value households
   - Top 10 highest-risk households

2. **`/household/<id>`** - Household detail page
   - All members in household (card layout)
   - Household churn risk (weighted average)
   - Combined financial profile
   - Product portfolio
   - Recommended interventions for household

3. **`/cohorts`** - Cohort analysis dashboard
   - Cohort cards (6-8 cohorts)
   - Churn rate by cohort
   - Member count by cohort
   - Average profile per cohort (age, income, tenure, etc.)
   - Product penetration by cohort

4. **`/cohort/<id>`** - Cohort detail page
   - Cohort characteristics (radar chart or table)
   - Member list (paginated)
   - Churn drivers specific to cohort
   - Product recommendations for cohort
   - Engagement trends

**Tasks**:
1. Build household grouping logic
   - Load member data with relationship indicators
   - Group by household_id (or derive from surname/address similarity)
   - Calculate household metrics (combined balance, product count, average age)
   
2. Build cohort discovery
   - Select features for clustering (age, income, tenure, product_count, balance, transaction_frequency)
   - Normalize features
   - Apply K-Means (n_clusters=6-8)
   - Create cohort profiles (mean/median for each feature)
   - Assign cohort labels to all members

3. Build household churn prediction
   - Calculate household churn risk (weighted average of member probabilities)
   - Flag high-risk households
   - Rank by risk + lifetime value

4. Build backend analysis modules
   - `HouseholdAnalyzer` class
   - `CohortAnalyzer` class

5. Build frontend pages + API integration
   - Fetch household data
   - Fetch cohort data
   - Display visualizations

6. Store results in MongoDB
   - `household_id` + member associations
   - `cohort_assignments` for each member
   - Cohort profiles + statistics

**Deliverables Location**: `/backend/app/analytics/` + `/frontend/app/households/` + `/frontend/app/cohorts/`

**Timeline**: 2-3 weeks

---

### **PHASE 9: LEAD SCORING & PRODUCT ADOPTION**

**Objective**: Predict which members are READY for new products (credit card, loan, investment, premium account, mobile banking)

**Datasets Required**:
- Kaggle: "E-Commerce Purchase Behavior Data" OR "Customer Purchase Prediction"
  - https://www.kaggle.com/datasets/
- Synthetic product adoption history (generate from Phase 1 member data)

**Deliverables**:
- 5 trained product adoption models (one per product type)
- Lead scoring engine with predictions for all members
- New MongoDB collection: `lead_scores`, `product_readiness`
- Dashboard pages: `/leads`, `/member/{id}/opportunities`
- Backend module: `app/analytics/lead_scorer.py`

**Tech Stack**: LightGBM (5 models), scikit-learn (CalibratedClassifierCV), pandas

**New API Endpoints**:
1. **GET `/leads?product=<credit_card|loan|investment|mobile|premium>`** - Top 100 leads for specific product
2. **GET `/member/<member_id>/opportunities`** - Personalized next-best-actions for member
3. **POST `/analytics/score_leads`** - Train models + score all members

**New Frontend Pages**:
1. **`/leads`** - Lead dashboard
   - Lead score tabs (Credit Card, Loan, Investment, Mobile, Premium)
   - Top 100 members ready for each product
   - Lead score distribution (histogram)
   - Predicted revenue per product type
   - Call-to-action buttons

2. **`/member/<id>/opportunities`** - Member opportunities page
   - Current products (cards + icons)
   - Next-best-actions (ranked by probability)
   - Each action shows:
     - Product name + description
     - Adoption probability (%)
     - Expected annual value
     - Best timing recommendation
     - Why member is ready (key factors)

**Tasks**:
1. Generate synthetic product adoption history
   - For each member: has_credit_card, has_loan, has_investment, has_mobile, has_premium (binary)
   - Correlate with existing member features

2. Train 5 lead scoring models (one per product)
   ```
   Model 1: Credit Card Adoption
   Model 2: Personal Loan Adoption  
   Model 3: Investment Account Adoption
   Model 4: Mobile Banking Adoption
   Model 5: Premium Account Adoption
   ```

3. Calibrate probabilities (use CalibratedClassifierCV)

4. Extract feature importance per model
   - What drives credit card adoption?
   - What drives loan adoption?
   - etc.

5. Build `LeadScorer` class
   - Load all 5 models
   - Score all members
   - Return top N leads per product + explanations

6. Build backend API endpoints

7. Build frontend pages + visualizations
   - Lead score tables
   - Opportunity cards for individual members
   - Revenue impact calculations

8. Store predictions in MongoDB
   - `lead_scores` collection
   - Track which members were offered which products

**Deliverables Location**: `/backend/app/analytics/lead_scorer.py` + `/frontend/app/leads/` + `/frontend/app/members/{id}/opportunities`

**Timeline**: 3-4 weeks

---

### **PHASE 10: CAMPAIGN ATTRIBUTION & ROI TRACKING**

**Objective**: Understand which marketing channels and campaigns actually drive member acquisition and product adoption

**Datasets Required**:
- Kaggle: "Bank Marketing Dataset"
  - https://www.kaggle.com/datasets/henriqueyamada/bank-marketing
- Kaggle: "Marketing Campaign Performance Data" (if available)
- Synthetic campaign exposure data (map to your members)

**Deliverables**:
- Campaign tracking database schema
- Multi-touch attribution model
- ROI calculation engine
- New MongoDB collection: `campaigns`, `campaign_touches`, `conversions`, `attribution`
- Dashboard pages: `/campaigns`, `/campaign/<id>/analysis`, `/channels`
- Backend module: `app/analytics/attribution_analyzer.py`

**Tech Stack**: RandomForest (attribution model), pandas, scikit-learn, scipy (statistics)

**New API Endpoints**:
1. **GET `/campaigns`** - All campaigns + performance
2. **GET `/campaign/<campaign_id>/analysis`** - Deep dive into single campaign
3. **GET `/channels/performance`** - Channel attribution breakdown
4. **POST `/analytics/calculate_attribution`** - Train attribution model + score
5. **GET `/roi/summary`** - Overall marketing ROI by channel

**New Frontend Pages**:
1. **`/campaigns`** - Campaign performance dashboard
   - Campaign table: name, reach, conversions, ROI, top channel
   - Campaign status (active/paused/completed)
   - Sortable columns
   - Total marketing spend + ROI

2. **`/campaign/<id>/analysis`** - Campaign detail page
   - Campaign name + description
   - Timeline (start date, end date)
   - Total spend + conversions + revenue
   - ROI % displayed prominently
   - Conversion funnel (impressions → clicks → conversions)
   - Channel breakdown (email %, SMS %, Facebook %, etc.)
   - Best performing audience segments
   - Best performing days/times
   - Touchpoint sequence analysis
   - Lift chart (incremental impact)

3. **`/channels`** - Channel performance page
   - Channel cards (Email, SMS, Facebook, Website, Branch, ATM)
   - Each shows:
     - % of total conversions
     - Conversion rate (%)
     - Avg ROI per campaign
     - Trend (↑ improving, → stable, ↓ declining)
   - Channel synergy analysis (email + SMS together vs separately)
   - Recommended channel mix

**Tasks**:
1. Define campaign data schema
   ```
   campaign {
     campaign_id,
     name,
     start_date,
     end_date,
     budget,
     channels[], // ['email', 'sms', 'facebook']
     target_segments[],
     conversions,
     revenue
   }
   
   touch {
     member_id,
     campaign_id,
     channel, // email, sms, facebook, etc.
     touch_date,
     action, // send, open, click
   }
   
   conversion {
     member_id,
     campaign_id,
     conversion_date,
     product_adopted,
     revenue
   }
   ```

2. Load Kaggle marketing dataset
   - Parse campaign history
   - Map to your member database
   - Create synthetic touches if needed

3. Build attribution model
   - Features: channel, time_to_conversion, position (first/middle/last), cohort, product_type
   - Target: conversion (1/0)
   - Train RandomForest
   - Get feature importance = channel attribution

4. Calculate ROI per campaign
   ```
   ROI = (Revenue - Spend) / Spend × 100%
   ```

5. Calculate incremental lift
   ```
   Lift = (Conversions with campaign - Baseline) / Baseline
   ```

6. Build `AttributionAnalyzer` class
   - Load model
   - Score campaign impact
   - Calculate ROI
   - Generate attribution breakdown

7. Build backend API endpoints

8. Build frontend dashboards
   - Campaign table
   - ROI visualizations
   - Channel performance comparisons
   - Touchpoint journey flows

9. Store results in MongoDB
   - Campaign performance
   - Attribution scores per campaign
   - Channel effectiveness rankings

**Deliverables Location**: `/backend/app/analytics/attribution_analyzer.py` + `/frontend/app/campaigns/`

**Timeline**: 4-5 weeks

---

### **PHASE 11: LOAN APPROVAL ENGINE**

**Objective**: Automate loan application decisions with AI-powered risk scoring and approval recommendations

**Datasets Required**:
- Kaggle: "Credit Card Approval Prediction"
  - https://www.kaggle.com/datasets/rikdifos/credit-card-approval-prediction
- Kaggle: "Loan Default Prediction"
  - https://www.kaggle.com/datasets/mineclab/loan-default-prediction
- Extend Phase 1 member data with loan fields

**Deliverables**:
- Loan default prediction model (LightGBM)
- Approval rules engine
- Counteroffer generation logic
- New MongoDB collection: `loan_applications`, `loan_decisions`, `loan_history`
- Dashboard pages: `/applications`, `/application/<id>/review`, `/decisions`
- Backend module: `app/ml_pipeline/loan_models.py`, `app/analytics/approval_engine.py`

**Tech Stack**: LightGBM (default model), rule-based engine, pandas

**New API Endpoints**:
1. **POST `/loan/apply`** - Submit loan application
2. **GET `/loan/application/<application_id>`** - Get application + decision + rationale
3. **GET `/loan/decisions`** - Historical approvals/declines/counteroffers
4. **GET `/loan/pending`** - All pending applications (for review)
5. **POST `/loan/approve`** - Approve application (store decision)
6. **POST `/loan/decline`** - Decline + generate counteroffers

**New Frontend Pages**:
1. **`/applications`** - Application dashboard
   - Application status summary (pending, approved, declined)
   - Pending applications table
   - Approved today, Declined today metrics
   - Average processing time
   - Filter by status, date range, member

2. **`/application/<id>/review`** - Application review page
   - Applicant info (name, ID, demographics)
   - Loan request details (amount, purpose, term)
   - Financial summary (income, debt, credit score)
   - Default risk score (0-100, color-coded)
   - Approval decision: **APPROVE** / **DECLINE** / **MORE INFO NEEDED**
   - Decision rationale (key factors)
   - Risk factors (red flags)
   - Protective factors (positive signals)
   - If decline: suggested counteroffers
     - Lower loan amount
     - Secured loan option
     - Wait & re-apply timing
   - Similar applications (for comparison)

3. **`/decisions`** - Historical decisions dashboard
   - Approval rate over time (line chart)
   - Approval rate by cohort (bar chart)
   - Top decline reasons (pie chart)
   - Average default risk by decision
   - Metrics: Total reviewed, Approved %, Declined %, Counteroffer %

**Tasks**:
1. Load Kaggle loan datasets
   - Parse applicant profiles
   - Parse loan history + defaults
   - Create default labels (1 = defaulted, 0 = repaid)

2. Engineer loan features
   - From member data: credit_score, income, age, tenure, balance, employment_years
   - From application: loan_amount, loan_purpose, collateral, requested_term
   - Calculate: debt_to_income, loan_to_value, payment_to_income

3. Train loan default prediction model
   ```
   Features: credit_score, income, debt_to_income, age, tenure, 
             loan_amount, employment_years, collateral
   Target: defaulted (1/0)
   Model: LightGBM classifier
   Optimize for: ROC-AUC (want to catch defaults)
   ```

4. Calibrate probabilities

5. Build approval rules engine
   ```
   if default_prob >= 0.25:
       recommendation = 'DECLINE'
   elif default_prob >= 0.15:
       recommendation = 'NEEDS_MORE_INFO'
   else:
       recommendation = 'APPROVE'
   ```

6. Build counteroffer generation
   - If high debt-to-income: suggest lower amount
   - If low credit score: suggest secured loan
   - If recent account opening: suggest waiting period
   - etc.

7. Build `LoanApprovalEngine` class
   - Load model
   - Calculate default probability
   - Generate recommendation + rationale
   - Suggest counteroffers

8. Build backend API endpoints
   - Application submission
   - Scoring + decision
   - Store decision in MongoDB

9. Build frontend pages
   - Application table
   - Decision detail page
   - Historical decisions

10. Store decisions in MongoDB
    - Application info
    - Default probability
    - Approval decision
    - Timestamp

**Deliverables Location**: `/backend/app/ml_pipeline/loan_models.py` + `/backend/app/analytics/approval_engine.py` + `/frontend/app/loan/` or `/frontend/app/applications/`

**Timeline**: 4-6 weeks

---

### **PHASE 12: MEMBER JOURNEY ANALYTICS**

**Objective**: Visualize and analyze how members interact across all channels (branch, digital, mobile, ATM) to identify critical moments and engagement patterns

**Datasets Required**:
- Existing member data from Phase 1
- Synthetic channel interaction history (generate from Kaggle customer behavior data)
- Optional Kaggle: "E-Commerce Purchase Behavior" (for journey patterns)
  - https://www.kaggle.com/datasets/mkechinov/ecommerce-purchase-behavior-data

**Deliverables**:
- Journey segmentation model (classification)
- Critical moment identification
- New MongoDB collection: `member_journeys`, `journey_events`, `critical_moments`, `journey_segments`
- Dashboard pages: `/journeys`, `/journey/<member_id>`, `/moments`, `/engagement-trends`
- Backend module: `app/analytics/journey_analyzer.py`

**Tech Stack**: pandas (time-series), scikit-learn (classification), matplotlib/plotly (visualizations)

**New API Endpoints**:
1. **GET `/journeys/segments`** - All journey segments + stats
2. **GET `/journey/<member_id>`** - Full journey timeline for member
3. **GET `/moments/critical`** - Critical moments analysis
4. **GET `/engagement/trends`** - Channel engagement trends
5. **POST `/analytics/analyze_journeys`** - Analyze all member journeys

**New Frontend Pages**:
1. **`/journeys`** - Journey segments overview
   - Journey segment cards (Branch-First, Digital-First, Omnichannel)
   - Each shows:
     - Segment name + icon
     - Member count
     - Churn rate
     - Avg channel distribution
     - Key characteristics
   - Churn rate comparison (bar chart)
   - Segment growth trends

2. **`/journey/<member_id>`** - Individual member journey timeline
   - Timeline visualization (vertical)
   - Each event shows:
     - Date + time
     - Channel (color-coded: branch, mobile, website, ATM, email, etc.)
     - Action (login, deposit, withdrawal, view rates, etc.)
     - Amount (if applicable)
   - Activity summary (last active date, total transactions, channels used)
   - Engagement score over time (line chart)
   - Critical moments highlighted
   - Risk indicators (dormant period, no digital activity, etc.)
   - Recommendations (re-engagement actions)

3. **`/moments`** - Critical moments analysis
   - Table of critical moments + impact
   - Each row shows:
     - Moment name (First transaction, First mobile login, etc.)
     - Churn impact (% difference in churn rate)
     - % of members who experience it
     - Avg time to next action
   - Visual heatmap (which moments matter most?)
   - Recommendations for intervention

4. **`/engagement-trends`** - Channel engagement over time
   - Multi-line chart: branch, mobile, website, ATM usage over months
   - Stacked bar chart: channel distribution (by cohort)
   - Sankey diagram: flows between channels
   - Engagement score trends (avg member engagement over time)
   - Churn vs engagement correlation

**Tasks**:
1. Define journey event schema
   ```
   journey_event {
     member_id,
     event_date,
     channel, // branch, mobile, website, atm, email, sms
     action, // login, deposit, withdrawal, bill_pay, etc.
     amount,
     location (if branch)
   }
   ```

2. Generate synthetic journey data
   - Create 50-100 events per member (30-60 day period)
   - Vary by cohort (Branch-First members: 70% branch, 20% ATM, 10% digital)
   - Simulate realistic patterns (regular deposits, occasional withdrawals, etc.)

3. Build journey segmentation model
   - Features: channel distribution %, avg events per week, first channel, digital adoption rate
   - Target: journey segment (Branch-First, Digital-First, Omnichannel)
   - Model: K-Means or Decision Tree

4. Identify critical moments
   - First transaction (sets tone)
   - First digital interaction (adoption)
   - Second product adoption (commitment)
   - Support contact (satisfaction test)
   - 30-day inactivity (risk signal)
   - etc.
   - Correlate each moment with churn rate

5. Build `JourneyAnalyzer` class
   - Load journey events for member
   - Calculate engagement metrics
   - Assign journey segment
   - Identify critical moments
   - Generate churn risk signals

6. Build backend API endpoints

7. Build frontend pages
   - Journey timeline visualization
   - Critical moments analysis
   - Engagement trends charts
   - Segment comparison

8. Store results in MongoDB
   - Journey events
   - Segment assignments
   - Critical moments flagged

**Deliverables Location**: `/backend/app/analytics/journey_analyzer.py` + `/frontend/app/journeys/`

**Timeline**: 3-4 weeks

---


## 5. COMPLETE PROJECT STRUCTURE

```
credit-union-churn/
├── README.md
├── .gitignore
├── LICENSE
│
├── data/
│ ├── raw/
│ │ ├── bank_churn_dataset.csv
│ │ ├── marketing_campaign_data.csv (Phase 10)
│ │ ├── loan_default_data.csv (Phase 11)
│ │ └── customer_behavior_data.csv (Phase 12)
│ ├── processed/
│ │ ├── train.csv
│ │ ├── test.csv
│ │ └── validation.csv
│ └── eda_report.ipynb
│
├── models/
│ ├── churn_model.joblib (Phase 2)
│ ├── credit_card_lead_model.joblib (Phase 9)
│ ├── personal_loan_lead_model.joblib (Phase 9)
│ ├── investment_lead_model.joblib (Phase 9)
│ ├── mobile_lead_model.joblib (Phase 9)
│ ├── premium_lead_model.joblib (Phase 9)
│ ├── loan_default_model.joblib (Phase 11)
│ ├── journey_segment_model.joblib (Phase 12)
│ ├── attribution_model.joblib (Phase 10)
│ └── model_cards/
│
├── backend/
│ ├── requirements.txt
│ ├── .env.example
│ ├── app/
│ │ ├── __init__.py
│ │ ├── main.py
│ │ ├── models.py
│ │ ├── routes.py
│ │ ├── config.py
│ │ ├── ml_pipeline.py
│ │ ├── report_generator.py
│ │ ├── utils.py
│ │ ├── database.py
│ │ ├── analytics/ (NEW)
│ │ │ ├── __init__.py
│ │ │ ├── household_analyzer.py (Phase 8)
│ │ │ ├── cohort_analyzer.py (Phase 8)
│ │ │ ├── lead_scorer.py (Phase 9)
│ │ │ ├── attribution_analyzer.py (Phase 10)
│ │ │ ├── approval_engine.py (Phase 11)
│ │ │ └── journey_analyzer.py (Phase 12)
│ │ └── ml_pipeline/
│ │ ├── loan_models.py (Phase 11)
│ └── tests/
│ └── test_endpoints.py
│
├── frontend/
│ ├── package.json
│ ├── next.config.js
│ ├── tailwind.config.js
│ ├── .env.example
│ ├── app/
│ │ ├── page.tsx (dashboard)
│ │ ├── members/
│ │ │ ├── page.tsx
│ │ │ └── [id]/
│ │ │ ├── page.tsx
│ │ │ └── opportunities/ (Phase 9)
│ │ │ └── page.tsx
│ │ ├── households/ (Phase 8)
│ │ │ ├── page.tsx
│ │ │ └── [id]/
│ │ │ └── page.tsx
│ │ ├── cohorts/ (Phase 8)
│ │ │ ├── page.tsx
│ │ │ └── [id]/
│ │ │ └── page.tsx
│ │ ├── leads/ (Phase 9)
│ │ │ └── page.tsx
│ │ ├── campaigns/ (Phase 10)
│ │ │ ├── page.tsx
│ │ │ └── [id]/
│ │ │ └── page.tsx
│ │ ├── channels/ (Phase 10)
│ │ │ └── page.tsx
│ │ ├── applications/ (Phase 11)
│ │ │ ├── page.tsx
│ │ │ └── [id]/
│ │ │ └── page.tsx
│ │ ├── decisions/ (Phase 11)
│ │ │ └── page.tsx
│ │ ├── journeys/ (Phase 12)
│ │ │ ├── page.tsx
│ │ │ └── [id]/
│ │ │ └── page.tsx
│ │ ├── moments/ (Phase 12)
│ │ │ └── page.tsx
│ │ ├── engagement-trends/ (Phase 12)
│ │ │ └── page.tsx
│ │ ├── upload/
│ │ │ └── page.tsx
│ │ ├── reports/
│ │ │ └── page.tsx
│ │ ├── layout.tsx
│ │ └── globals.css
│ ├── components/
│ │ ├── (existing components)
│ │ ├── HouseholdCard.tsx (Phase 8)
│ │ ├── CohortCard.tsx (Phase 8)
│ │ ├── LeadScoreCard.tsx (Phase 9)
│ │ ├── CampaignTable.tsx (Phase 10)
│ │ ├── ChannelChart.tsx (Phase 10)
│ │ ├── ApplicationCard.tsx (Phase 11)
│ │ ├── JourneyTimeline.tsx (Phase 12)
│ │ └── CriticalMomentChart.tsx (Phase 12)
│ ├── lib/
│ │ ├── api.ts
│ │ ├── utils.ts
│ │ └── downloadUtils.ts
│ ├── hooks/
│ │ ├── useDashboardData.ts
│ │ ├── useMembersData.ts
│ │ ├── useMemberProfile.ts
│ │ ├── useHouseholds.ts (Phase 8)
│ │ ├── useCohorts.ts (Phase 8)
│ │ ├── useLeads.ts (Phase 9)
│ │ ├── useCampaigns.ts (Phase 10)
│ │ ├── useApplications.ts (Phase 11)
│ │ └── useJourneys.ts (Phase 12)
│ ├── types/
│ │ └── index.ts
│ └── public/
│ └── assets/
│
└── .github/
└── workflows/
└── deploy.yml
```

---

## 6. TIMELINE SUMMARY

| Phase                              | Duration | Total (Cumulative) |
|------------------------------------|----------|-------------------|
| Phase 1: Data Prep & EDA           | 2-3 days | 2-3 days          |
| Phase 2: ML Training               | 3-5 days | 5-8 days          |
| Phase 3: Backend API               | 4-6 days | 9-14 days         |
| Phase 4: Frontend Dashboard        | 5-7 days | 14-21 days        |
| Phase 5: Integration               | 2-3 days | 16-24 days        |
| Phase 6: Deployment                | 1-2 days | 17-26 days        |
| Phase 7: Polish & Docs             | 2-3 days | 19-29 days        |
| **MVP SUBTOTAL**                   | **~1 month** | **~1 month**   |
|                                    |          |                   |
| Phase 8: Households & Cohorts      | 2-3 wks  | 4-5 weeks         |
| Phase 9: Lead Scoring              | 3-4 wks  | 7-9 weeks         |
| Phase 10: Campaign Attribution     | 4-5 wks  | 11-14 weeks       |
| Phase 11: Loan Approval Engine     | 4-6 wks  | 15-20 weeks       |
| Phase 12: Journey Analytics        | 3-4 wks  | 18-24 weeks       |
| **EXPANSION SUBTOTAL**             | **16-22 wks** | **~6 months** |
|                                    |          |                   |
| **TOTAL (MVP + EXPANSION)**        |          | **~7-8 months**   |


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
| 7 | Complete documentation | Portfolio-ready MVP |
| **8** | **Household + Cohort modules** | **`/households`, `/cohorts` pages** |
| **9** | **5 lead scoring models** | **`/leads`, `/opportunities` pages** |
| **10** | **Attribution model + analytics** | **`/campaigns`, `/channels` pages** |
| **11** | **Loan default model + engine** | **`/applications`, `/decisions` pages** |
| **12** | **Journey segmentation model** | **`/journeys`, `/moments` pages** |


---

## 8. RISK MITIGATION

| Risk | Mitigation |
|------|-----------|
| **Model overfitting** | Cross-validation, test set evaluation, feature selection |
| **Slow API responses** | Batch prediction optimization, caching predictions |
| **Render/Vercel downtime** | Free tier SLA ~99.5%; document as demo limitation |
| **CSV upload fails** | Validate schema, handle encoding, provide error messages |
| **Frontend-backend communication errors** | Error boundaries, retry logic, graceful degradation |
| **Unbalanced classes** | SMOTE or class weighting in Phase 2 |
| **Model staleness** | Document model is static; plan quarterly retraining |
| **Kaggle dataset incompatibility** | Data schema mismatches between phases | Test data integration before each phase |
| **Household grouping inaccuracy** | Validate relationships; use multiple linking keys (name, address, phone) |
| **Cohort instability** | Retrain clustering monthly; validate segment coherence |
| **Lead scoring accuracy drift** | Monitor prediction calibration; retrain models if drift detected |
| **Campaign attribution complexity** | Start with last-touch, evolve to multi-touch gradually |
| **Loan approval bias** | Audit for demographic bias; ensure explainability |
| **Journey data sparsity** | Some members may have few events; handle missing data gracefully |

---

## 9. PORTFOLIO POSITIONING

**What to highlight when sharing**:
1. **End-to-end ML application** (data → model → API → dashboard)
2. **Production-ready architecture** (async API, error handling, logging)
3. **Scalable design** (bulk predictions, batch processing, multi-model inference)
4. **Clean code & documentation** (README, model cards, API docs)
5. **Real-world domain knowledge** (credit union analytics, member lifecycle)
6. **Deployment on free tier** (shows cost-consciousness & DevOps thinking)
7. **Analytics platform evolution** (churn → households → leads → campaigns → loans → journeys)
8. **Multiple ML techniques** (classification, clustering, regression, attribution, time-series)
9. **Full-stack data science** (data pipeline, feature engineering, model training, API serving, dashboard)
10. **Business impact metrics** (churn reduction, cross-sell revenue, campaign ROI, loan approval speed)

**Sharing strategy**:
- GitHub repo with comprehensive README
- LinkedIn post explaining evolution: "From Churn Prediction to Analytics Platform"
- Live dashboard link + demo
- Model cards for each phase
- Technical blog post explaining approach + learnings
- Demo video showing all phases

---

## 10. FUTURE ENHANCEMENTS (NOT IN MVP)

- [ ] Real-time monitoring dashboard (model performance, prediction drift)
- [ ] A/B testing framework (test interventions, measure impact)
- [ ] Real-time notifications (email/SMS alerts for high-risk members)
- [ ] Admin panel (retrain models, manage data, configure rules)
- [ ] Mobile app version (member view of own churn risk + opportunities)
- [ ] Explainability UI (SHAP force plots, individual prediction explanations)
- [ ] Survival analysis (more sophisticated time-to-churn prediction)
- [ ] Recommendation engine (personalized product recommendations)
- [ ] Competitive benchmarking (compare metrics to industry standards)
- [ ] Regulatory compliance reporting (audit trails, decision explanations)
- [ ] Multi-currency support (international credit unions)
- [ ] API rate limiting + authentication (prepare for production traffic)
---

**Document Created**: Analytics Platform Expansion (Phases 8-12)  
**Total Pages**: 12 phases  
**Timeline**: ~7-8 months (MVP: 1 month, Expansion: 6 months)  
**Status**: Ready to integrate into main roadmap


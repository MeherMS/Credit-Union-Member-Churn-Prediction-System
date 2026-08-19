# Credit Union Member Churn Prediction System

A full-stack machine learning application that predicts which credit union members are likely to churn using a trained LightGBM model, served through a FastAPI backend and visualized in a Next.js 14 executive dashboard.

## 🎯 Project Overview

This system analyzes credit union member data to identify churn risk, assigns risk levels (High/Medium/Low/Safe), and provides executive dashboards with actionable insights. Built as a complete end-to-end ML application from data preparation through production deployment.

**Key Stats:**
- **Dataset**: 10,000 bank customer records (Kaggle)
- **Model**: LightGBM | ROC-AUC: 0.9627 | Inference: <5ms
- **Prediction Task**: Binary classification + probability-based risk bucketing
- **Architecture**: FastAPI (Render) + Next.js (Vercel) + MongoDB Atlas

---

## 🚀 Live Demo

- **Frontend Dashboard**: [Credit Union Dashboard](#) *(https://credit-union-member-churn-predictio-chi.vercel.app/)*
- **Backend API Docs**: [Swagger UI](#) *(https://credit-union-member-churn-prediction.onrender.com)*
- **Documentation**: *(https://github.com/MeherMS/Credit-Union-Member-Churn-Prediction-System/tree/main/Documentation)*

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│     Frontend (Next.js 14 + React)       │
│     Dashboard, Member Profiles, Reports │
└────────────────┬────────────────────────┘
                 │
          HTTPS / Axios Calls
                 │
                 ▼
┌─────────────────────────────────────────┐
│     Backend (FastAPI + Python)          │
│     9 REST Endpoints, ML Pipeline       │
└────────────────┬────────────────────────┘
                 │
         Async / Motor Driver
                 │
                 ▼
┌─────────────────────────────────────────┐
│   MongoDB Atlas (Data Storage)          │
│   10K+ Prediction Records               │
└─────────────────────────────────────────┘
```

---

## 🎨 Features

### Dashboard (`/`)
- Real-time summary cards (Total members, High/Medium/Low risk counts)
- Risk distribution pie chart
- Top 10 at-risk members table
- API health status indicator

### Members Directory (`/members`)
- Searchable, sortable member table
- Filters: Risk level, Country, Pagination
- Quick access to member profiles
- Real-time data from backend

### Member Profile (`/members/[id]`)
- Demographics & account information
- Churn probability gauge (0-100%)
- Feature importance radar chart (top 5 drivers)
- Risk-based recommendations
- Account activity summary

### Bulk Upload (`/upload`)
- CSV file upload with validation
- Progress tracking & job polling
- Results summary statistics
- Download predictions as CSV

### Report Generator (`/reports`)
- Filter options: Risk level, Country, Age range
- Format selection: PDF or XLSX
- Executive report generation
- Professional formatting

---

## 📊 Model Performance

**Test Set Metrics:**
| Metric | Value |
|--------|-------|
| ROC-AUC | 0.9627 |
| Accuracy | 84.3% |
| Precision | 79.2% |
| Recall | 71.4% |
| F1-Score | 0.7545 |

**Risk Bucketing:**
- **High Risk** (≥70%): ~14 days to churn
- **Medium Risk** (50-70%): ~45 days to churn
- **Low Risk** (30-50%): ~80 days to churn
- **Safe** (<30%): Low churn risk

**Model Details:**
- Algorithm: LightGBM (Gradient Boosting)
- Training samples: 8,000 (60%)
- Validation samples: 3,185 (20%)
- Test samples: 3,185 (20%)
- Features: 13 (engineered from 10 raw + categorical encoding)
- Calibration: Platt Scaling (sigmoid)

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14, React 18, Tailwind CSS | Dashboard UI |
| **Visualizations** | Recharts | Charts & graphs |
| **Backend** | FastAPI, Uvicorn | REST API server |
| **ML/Data** | scikit-learn, pandas, numpy, LightGBM | Model & preprocessing |
| **Database** | MongoDB Atlas (free tier) | Data persistence |
| **Async** | Motor | Async MongoDB operations |
| **Reports** | ReportLab, openpyxl | PDF/XLSX generation |
| **Deployment** | Render, Vercel | Production hosting |

---

## 📋 Project Structure

```
credit-union-churn/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app & lifespan
│   │   ├── routes.py            # 9 API endpoints
│   │   ├── models.py            # Pydantic schemas
│   │   ├── ml_pipeline.py       # Model loading & predictions
│   │   ├── database.py          # MongoDB async operations
│   │   ├── report_generator.py  # PDF/XLSX generation
│   │   ├── config.py            # Settings & env vars
│   │   └── utils.py             # Helper functions
│   ├── tests/
│   │   └── test_endpoints.py    # Endpoint tests
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Environment template
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Dashboard home
│   │   ├── members/             # Members directory
│   │   ├── upload/              # Bulk upload page
│   │   ├── reports/             # Report generator
│   │   └── components/          # React components
│   ├── hooks/                   # Custom data hooks
│   ├── lib/                     # Utilities & API client
│   ├── types/                   # TypeScript interfaces
│   ├── package.json             # Node dependencies
│   └── .env.local               # Environment config
│
├── models/
│   ├── churn_model.joblib       # Trained LightGBM model
│   └── feature_names.joblib     # Feature metadata
│
├── data/
│   └── bank_churn.csv           # Original dataset
│
├── notebooks/
│   └── *.ipynb                  # Training & EDA notebooks
│
└── Phase_*.md                   # Completion reports

```

---

## 🚀 Deployment

### Backend (Render)
```bash
Service: credit-union-backend
URL: https://credit-union-member-churn-prediction.onrender.com
Build: pip install -r requirements.txt
Start: uvicorn app.main:app --host 0.0.0.0
```

**Environment Variables:**
- `MONGODB_URL`: MongoDB Atlas connection string
- `MONGODB_DB_NAME`: Database name
- `MODEL_PATH`: Path to trained model
- `ENVIRONMENT`: production/development

### Frontend (Vercel)
```bash
Project: Credit-Union-Member-Churn-Prediction-System
URL: https://credit-union-frontend-xxx.vercel.app
Build: npm run build (Next.js auto-detects)
Framework: Next.js 14
```

**Environment Variables:**
- `NEXT_PUBLIC_API_URL`: Backend API base URL

---

## 🔧 Local Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB Atlas account (free tier)
- Git

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create .env file (copy from .env.example)
cp .env.example .env
# Fill in MongoDB URL and other vars

# 5. Verify model file exists
# Should have: ../models/churn_model.joblib

# 6. Run server
uvicorn app.main:app --reload
# Server runs on http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF

# 4. Run development server
npm run dev
# App runs on http://localhost:3000
```

### Test Connection

```bash
# Backend health check
curl http://localhost:8000/health

# Frontend should connect automatically
# Check browser console for API calls
```

---

## 📡 API Endpoints

All endpoints return JSON responses. See interactive documentation at `/docs` (Swagger UI) on backend.

### Health & Status
- `GET /health` - System status, model loaded, DB connected

### Predictions
- `POST /predict` - Single member prediction
- `POST /bulk_predict` - Upload CSV for batch predictions
- `GET /bulk_predict/{job_id}` - Check job status
- `GET /bulk_predict/{job_id}/download` - Download results CSV

### Member Data
- `GET /member/{member_id}` - Get member profile with prediction
- `GET /members?skip=0&limit=10&risk_level=...&country=...` - List members with filters

### Analytics
- `GET /stats/risk_distribution` - Risk summary & top at-risk members

### Reports
- `POST /report/generate` - Generate PDF or XLSX report with filters

---

## 📊 Example API Calls

### Single Prediction
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
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
  }'

# Response:
{
  "churn_probability": 0.23,
  "risk_bucket": "Low Risk",
  "days_to_churn": 80,
  "prediction": 0,
  "top_risk_factors": ["tenure", "balance", "age"]
}
```

### Get Member Profile
```bash
curl http://localhost:8000/member/MEM001

# Response: Full member record with prediction details
```

### Get Dashboard Stats
```bash
curl http://localhost:8000/stats/risk_distribution

# Response:
{
  "summary": {
    "high_risk": 45,
    "medium_risk": 120,
    "low_risk": 230,
    "safe": 605,
    "total": 1000
  },
  "top_at_risk_members": [...]
}
```

---

## 🔄 Development Workflow

### Making Changes

**Backend:**
1. Edit files in `backend/app/`
2. Server auto-reloads with `--reload` flag
3. Test via http://localhost:8000/docs
4. Push to GitHub → auto-deploys to Render

**Frontend:**
1. Edit files in `frontend/app/`
2. Next.js hot-reloads automatically
3. Check browser console for errors
4. Push to GitHub → auto-deploys to Vercel

### Adding Features

**New API Endpoint:**
1. Add route to `backend/app/routes.py`
2. Define Pydantic schema in `models.py`
3. Test in Swagger UI
4. Add frontend hook in `frontend/app/hooks/`
5. Use hook in component

**New Frontend Page:**
1. Create `frontend/app/[route]/page.tsx`
2. Add to sidebar in `components/Layout.tsx`
3. Use existing hooks or create new ones
4. Add TypeScript types

---

## ⚠️ Known Issues & Limitations

### Current Limitations
- **Cold start latency**: Render free tier ~20-30s first request
- **Storage**: MongoDB free tier limited to 512MB
- **Rate limiting**: Free tier has connection limits



---

## 📈 Model Training

The model was trained following this pipeline:

1. **Data Preparation** (Phase 1)
   - Loaded 10,000 records
   - One-hot encoded categorical features (country, gender)
   - Standardized numerical features (StandardScaler)
   - Applied SMOTE for class balance (50/50)
   - Stratified train/val/test split

2. **Model Training** (Phase 2)
   - Trained 4 baseline models (LR, RF, XGB, LGB)
   - LightGBM selected (highest ROC-AUC)
   - Hyperparameter tuning via GridSearchCV
   - Cross-validation (5-fold)
   - Probability calibration (Platt Scaling)

3. **Model Deployment**
   - Serialized to `churn_model.joblib`
   - Loaded on backend startup
   - Feature preprocessing handles new predictions

To retrain or experiment:
1. See Jupyter notebooks in `notebooks/` folder
2. Run Phase 1 & 2 notebooks
3. Replace `models/churn_model.joblib`
4. Redeploy backend

---

## 🎓 Key Learnings

### Feature Engineering
- **One-hot encoding**: `country` and `gender` must be encoded at inference time
- **Feature order**: Critical for model—must match training pipeline
- **Scaling**: Numerical features standardized; always include scaler in preprocessing

### Data Pipeline
- **SMOTE**: Effective for class imbalance (from 80/20 to 50/50)
- **Stratification**: Maintains class balance in train/val/test splits
- **No leakage**: Test set completely independent from training

### API Design
- **Async operations**: Non-blocking bulk predictions with job polling
- **Serialization**: Remove ObjectId fields, convert NaN to None for JSON
- **Error handling**: Comprehensive with meaningful messages to frontend

### Deployment
- **Environment variables**: Separate local/production configs
- **Render/Vercel**: Free tier suitable for demo/portfolio
- **Auto-deploy**: GitHub push → automatic production updates

---

## 🤝 Contributing

This is a portfolio project. For improvements:

1. **Report bugs**: File issues on GitHub
2. **Suggest features**: Discuss in issues before implementing
3. **Security**: Report privately to maintainer
4. **Code style**: Follow existing patterns (PEP 8 for Python, ESLint for TypeScript)

---

## 📚 Documentation

Detailed phase completion reports included:
- `Phase_1_Data_Preparation___EDA_-_Completion_Report.md`
- `Phase_2_ML_Model_Training___Evaluation_-_Completion_Report.md`
- `Phase_3_Backend_API__FastAPI__-_Completion_Report.md`
- `Phase_4_Frontend_Dashboard_-_Completion_Report.md`
- `Phase_5_Integration___API_Connectivity_-_Completion_Report.md`
- `Phase_6_Deployment_-_Completion_Report.md`
- `Single Member Prediction Feature - Implementation Summary`
- `Phase 8 Household & Cohort Analytics - Completion Report`
- `Phase 9 Lead Scoring & Product Adoption - Completion Report`
- `credit_uninon_TECHNICAL_ROADMAP.md` - Full project specifications`

---


## 📄 License

This project is open source for portfolio purposes. 

---

## 👤 Author

**Meher** - Lead Data Scientist  
Portfolio project showcasing end-to-end ML system development.

---

## 🔗 Resources

- [LightGBM Documentation](https://lightgbm.readthedocs.io/)
- [FastAPI Guide](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Kaggle Dataset](https://www.kaggle.com/datasets/barelydedicated/bank-customer-churn-modeling)

---

**Project Status**: ✅ MVP Testing

**Last Updated**: August 2026

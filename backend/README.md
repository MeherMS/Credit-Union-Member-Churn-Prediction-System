# Credit Union Churn Prediction - Backend API

FastAPI backend serving ML predictions for member churn.

## Local Development

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
# Fill in MONGODB_URL in .env
uvicorn app.main:app --reload
```

Visit: http://localhost:8000/docs

## Deployment (Render)

1. Connect GitHub repo to Render
2. Set environment variables in Render dashboard
3. Deploy!

## Environment Variables

See `.env.example`

Required:
- `MONGODB_URL` - MongoDB connection string (secret)

Optional:
- `ENVIRONMENT` - "production" or "development"
- `DEBUG` - true/false
- `MODEL_PATH` - Path to churn_model.joblib
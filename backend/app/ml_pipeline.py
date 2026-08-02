import joblib
import numpy as np
import pandas as pd
import logging
from app.config import settings
from shap import TreeExplainer

logger = logging.getLogger(__name__)

class MLPipeline:
    """Machine Learning Pipeline for churn predictions"""
    
    model = None
    feature_names = [
        "credit_score", "country", "gender", "age", "tenure",
        "balance", "products_number", "credit_card", "active_member", "estimated_salary"
    ]
    
    # Feature encoding (adjust based on your training data)
    COUNTRY_ENCODING = {"France": 0, "Germany": 1, "Spain": 2}
    GENDER_ENCODING = {"M": 0, "F": 1}

    @classmethod
    def load_model(cls):
        """Load trained model from disk"""
        try:
            cls.model = joblib.load(settings.model_path)
            logger.info(f"✅ Model loaded from {settings.model_path}")
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            raise

    @staticmethod
    def preprocess_features(features_dict):
        """
        Convert raw input features to 13 preprocessed features the model expects.
        
        Input: dict with keys:
            credit_score, country, gender, age, tenure, balance, 
            products_number, credit_card, active_member, estimated_salary
        
        Output: list of 13 features in exact order for LightGBM model
        """
        # Create a single-row DataFrame
        df = pd.DataFrame([features_dict])
        
        # Expected order of final features
        feature_order = [
            'age', 'estimated_salary', 'tenure', 'credit_score', 'balance',
            'products_number', 'country_Germany', 'active_member', 'gender_Female',
            'country_France', 'country_Spain', 'credit_card', 'gender_Male'
        ]
        
        # Initialize output with numerical features
        processed = {
            'age': df['age'].values[0],
            'estimated_salary': df['estimated_salary'].values[0],
            'tenure': df['tenure'].values[0],
            'credit_score': df['credit_score'].values[0],
            'balance': df['balance'].values[0],
            'products_number': df['products_number'].values[0],
            'active_member': df['active_member'].values[0],
            'credit_card': df['credit_card'].values[0],
        }
        
        # One-hot encode country
        country = df['country'].values[0]
        processed['country_Germany'] = 1 if country == 'Germany' else 0
        processed['country_France'] = 1 if country == 'France' else 0
        processed['country_Spain'] = 1 if country == 'Spain' else 0
        
        # One-hot encode gender
        gender = df['gender'].values[0]
        processed['gender_Female'] = 1 if gender == 'F' else 0
        processed['gender_Male'] = 1 if gender == 'M' else 0
        
        # Extract values in exact order
        features_array = np.array([processed[feat] for feat in feature_order]).reshape(1, -1)
        
        return features_array
    
    @staticmethod
    def predict(features_dict):
        """
        Predict churn for a single member.
        
        Input: dict with raw features
        Output: dict with prediction details
        """
        try:
            # Preprocess features
            features_array = MLPipeline.preprocess_features(features_dict)
            
            # Get prediction
            prediction = MLPipeline.model.predict(features_array)[0]
            probability = MLPipeline.model.predict_proba(features_array)[0, 1]
            
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
            
            # Get top risk factors (from feature importance)
            # For now, return mock top 3 (we'll improve this with SHAP later)
            top_risk_factors = ["Age", "Tenure", "Balance"]
            
            return {
                "prediction": int(prediction),
                "churn_probability": float(probability),
                "risk_bucket": risk_bucket,
                "days_to_churn": days_to_churn,
                "top_risk_factors": top_risk_factors
            }
        
        except Exception as e:
            raise ValueError(f"Prediction failed: {str(e)}")
    @classmethod
    def get_risk_bucket(cls, probability: float) -> tuple:
        """
        Map churn probability to risk bucket and estimated days to churn.
        Returns: (risk_bucket, days_to_churn)
        """
        if probability >= 0.7:
            return ("High Risk", 14)
        elif probability >= 0.5:
            return ("Medium Risk", 45)
        elif probability >= 0.3:
            return ("Low Risk", 80)
        else:
            return ("Safe", None)

    @classmethod
    def get_top_risk_factors(cls, X: np.ndarray, top_n: int = 3) -> list:
        """
        Extract top risk factors using model's feature importance.
        Returns: list of top feature names
        """
        try:
            # For tree-based models (Random Forest, XGBoost, LightGBM)
            if hasattr(cls.model, "feature_importances_"):
                importances = cls.model.feature_importances_
                top_indices = np.argsort(importances)[-top_n:][::-1]
                top_factors = [cls.feature_names[i] for i in top_indices]
                return top_factors
            
            # For Logistic Regression or other linear models
            elif hasattr(cls.model, "coef_"):
                coef = cls.model.coef_[0]
                top_indices = np.argsort(np.abs(coef))[-top_n:][::-1]
                top_factors = [cls.feature_names[i] for i in top_indices]
                return top_factors
            
            else:
                # Fallback: return default factors
                return ["credit_score", "tenure", "balance"]
        except Exception as e:
            logger.error(f"Error getting risk factors: {e}")
            return ["credit_score", "tenure", "balance"]

    
    
    
    @staticmethod
    def batch_predict(df: pd.DataFrame):
        """
    Predict churn for multiple members (bulk prediction).
    
    Input: pandas DataFrame with columns:
        credit_score, country, gender, age, tenure, balance,
        products_number, credit_card, active_member, estimated_salary
    
    Output: DataFrame with original data + predictions
        """
        try:
        # Make a copy to avoid modifying original
            df_copy = df.copy()
        
        # Expected feature order for model
            feature_order = [
            'age', 'estimated_salary', 'tenure', 'credit_score', 'balance',
            'products_number', 'country_Germany', 'active_member', 'gender_Female',
            'country_France', 'country_Spain', 'credit_card', 'gender_Male'
            ]
        
        # Initialize processed features
            processed_features = {}
        
        # Copy numerical features as-is
            for col in ['age', 'estimated_salary', 'tenure', 'credit_score', 'balance', 
                    'products_number', 'active_member', 'credit_card']:
                if col not in df_copy.columns:
                    raise ValueError(f"Missing required column: {col}")
                processed_features[col] = df_copy[col]
        
        # One-hot encode country
            if 'country' not in df_copy.columns:
                raise ValueError("Missing required column: country")
            processed_features['country_Germany'] = (df_copy['country'] == 'Germany').astype(int)
            processed_features['country_France'] = (df_copy['country'] == 'France').astype(int)
            processed_features['country_Spain'] = (df_copy['country'] == 'Spain').astype(int)
        
        # One-hot encode gender
            if 'gender' not in df_copy.columns:
                raise ValueError("Missing required column: gender")
            processed_features['gender_Female'] = (df_copy['gender'] == 'F').astype(int)
            processed_features['gender_Male'] = (df_copy['gender'] == 'M').astype(int)
        
        # Create DataFrame with processed features in correct order
            df_processed = pd.DataFrame(processed_features)[feature_order]
        
        # Get predictions
            predictions = MLPipeline.model.predict(df_processed)
            probabilities = MLPipeline.model.predict_proba(df_processed)[:, 1]
        
        # Determine risk buckets
            risk_buckets = []
            days_to_churn_list = []
        
            for prob in probabilities:
                if prob >= 0.7:
                    risk_buckets.append("High Risk")
                    days_to_churn_list.append(14)
                elif prob >= 0.5:
                    risk_buckets.append("Medium Risk")
                    days_to_churn_list.append(45)
                elif prob >= 0.3:
                    risk_buckets.append("Low Risk")
                    days_to_churn_list.append(80)
                else:
                    risk_buckets.append("Safe")
                    days_to_churn_list.append(None)
        
            return df_copy
    
        except Exception as e:
            raise ValueError(f"Batch prediction failed: {str(e)}")
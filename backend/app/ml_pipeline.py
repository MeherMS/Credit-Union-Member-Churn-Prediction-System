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
    
    Input: dict with raw values (e.g., age=35, credit_score=650)
    Output: array of 13 scaled features in correct order
    """
    # Scaler parameters from Phase 1 training
        scaler_mean = [6.50528800e+02, 3.89218000e+01, 5.01280000e+00, 7.64858893e+04,  
                   1.53020000e+00, 7.05500000e-01, 5.15100000e-01, 1.00090240e+05]
        scaler_scale = [9.66484660e+01, 1.04872820e+01, 2.89202976e+00, 6.23942853e+04,
                    5.81625275e-01, 4.55817672e-01, 4.99771938e-01, 5.75076172e+04]
    
        numerical_features = ['credit_score', 'age', 'tenure', 'balance', 'products_number', 
                         'credit_card', 'active_member', 'estimated_salary']
    
    # Create a single-row DataFrame
        df = pd.DataFrame([features_dict])
    
        # ✅ STEP 1: Scale numerical features (THIS WAS MISSING!)
        scaled_values = {}
        for idx, feat in enumerate(numerical_features):
            raw_value = df[feat].values[0]
            scaled_value = (raw_value - scaler_mean[idx]) / scaler_scale[idx]
            scaled_values[feat] = scaled_value
    
        # ✅ STEP 2: One-hot encode country
        country = df['country'].values[0]
        scaled_values['country_France'] = 1 if country == 'France' else 0
        scaled_values['country_Germany'] = 1 if country == 'Germany' else 0
        scaled_values['country_Spain'] = 1 if country == 'Spain' else 0
    
    # ✅ STEP 3: One-hot encode gender
        gender = df['gender'].values[0]
        scaled_values['gender_Female'] = 1 if gender == 'F' else 0
        scaled_values['gender_Male'] = 1 if gender == 'M' else 0
    
    # ✅ STEP 4: Use CORRECT feature order from training
        feature_order = [
        'credit_score', 'age', 'tenure', 'balance', 'products_number',
        'credit_card', 'active_member', 'estimated_salary',
        'country_France', 'country_Germany', 'country_Spain',
        'gender_Female', 'gender_Male'
        ]
    
    # Extract values in exact order
        features_array = np.array([scaled_values[feat] for feat in feature_order]).reshape(1, -1)
    
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
        """
        try:
            # Make a copy to avoid modifying original
            df_copy = df.copy()

            # ✅ ADD MEMBER ID & NAME (BEFORE PROCESSING)
            df_copy['member_id'] = ['MEM_' + str(i).zfill(5) for i in range(len(df_copy))]
            
            if 'name' not in df_copy.columns:
                df_copy['member_name'] = 'Member ' + df_copy['member_id']
            else:
                df_copy['member_name'] = df_copy['name']

            # ✅ SCALER PARAMETERS FROM PHASE 1
            scaler_mean = [6.50528800e+02, 3.89218000e+01, 5.01280000e+00, 7.64858893e+04,  
                        1.53020000e+00, 7.05500000e-01, 5.15100000e-01, 1.00090240e+05]
            scaler_scale = [9.66484660e+01, 1.04872820e+01, 2.89202976e+00, 6.23942853e+04,
                            5.81625275e-01, 4.55817672e-01, 4.99771938e-01, 5.75076172e+04]
            
            numerical_features = ['credit_score', 'age', 'tenure', 'balance', 'products_number', 
                                'credit_card', 'active_member', 'estimated_salary']

            # ✅ CORRECT FEATURE ORDER (FROM PHASE 1)
            feature_order = [
                'credit_score', 'age', 'tenure', 'balance', 'products_number',
                'credit_card', 'active_member', 'estimated_salary',
                'country_France', 'country_Germany', 'country_Spain',
                'gender_Female', 'gender_Male'
            ]

            # Initialize processed features dictionary
            processed_features = {}

            # ✅ STEP 1: SCALE numerical features (THIS WAS MISSING!)
            for idx, col in enumerate(numerical_features):
                if col not in df_copy.columns:
                    raise ValueError(f"Missing required column: {col}")
                
                # Apply StandardScaler formula: (x - mean) / std
                scaled_col = (df_copy[col] - scaler_mean[idx]) / scaler_scale[idx]
                processed_features[col] = scaled_col

            # ✅ STEP 2: One-hot encode country
            if 'country' not in df_copy.columns:
                raise ValueError("Missing required column: country")
            processed_features['country_France'] = (df_copy['country'] == 'France').astype(int)
            processed_features['country_Germany'] = (df_copy['country'] == 'Germany').astype(int)
            processed_features['country_Spain'] = (df_copy['country'] == 'Spain').astype(int)

            # ✅ STEP 3: One-hot encode gender
            if 'gender' not in df_copy.columns:
                raise ValueError("Missing required column: gender")
            processed_features['gender_Female'] = (df_copy['gender'] == 'F').astype(int)
            processed_features['gender_Male'] = (df_copy['gender'] == 'M').astype(int)

            # ✅ STEP 4: Create DataFrame with features in CORRECT ORDER
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

            # ✅ ADD PREDICTIONS BACK TO DATAFRAME
            df_copy['prediction'] = predictions.astype(int)
            df_copy['churn_probability'] = probabilities
            df_copy['risk_bucket'] = pd.Series(risk_buckets, index=df_copy.index)
            df_copy['days_to_churn'] = pd.Series(days_to_churn_list, index=df_copy.index)

            return df_copy

        except Exception as e:
            logger.error(f"Batch prediction error: {e}")
            raise
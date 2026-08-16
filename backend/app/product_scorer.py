import joblib
import numpy as np
import pandas as pd
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class ProductLeadScorer:
    """Load 5 product models and score member adoption probabilities"""
    
    # Class variables to store models (loaded once at startup)
    credit_card_model = None
    personal_loan_model = None
    investment_model = None
    mobile_banking_model = None
    premium_account_model = None
    
    # Feature names (same as churn model - 13 features after preprocessing)
    feature_names = None
    
    
    @classmethod
    def load_models(cls, model_path: str = None):
        """Load all 5 product models from disk."""
        try:
            if model_path is None:
                # Resolves: backend/app/product_scorer.py -> backend/app -> backend -> root -> models
                base_path = Path(__file__).resolve().parent.parent.parent / "models"
            else:
                base_path = Path(model_path).resolve()

            # Check if directory exists before trying to load
            if not base_path.exists():
                # Fallback: check if 'models' is directly in current working directory
                alt_path = Path.cwd() / "models"
                if alt_path.exists():
                    base_path = alt_path
                else:
                    raise FileNotFoundError(f"Directory not found: {base_path}")

            # Load all 5 models
            cls.credit_card_model = joblib.load(base_path / "lead_model_credit_card.joblib")
            logger.info("✓ Credit card model loaded")

            cls.personal_loan_model = joblib.load(base_path / "lead_model_personal_loan.joblib")
            logger.info("✓ Personal loan model loaded")

            cls.investment_model = joblib.load(base_path / "lead_model_investment.joblib")
            logger.info("✓ Investment model loaded")

            cls.mobile_banking_model = joblib.load(base_path / "lead_model_mobile_banking.joblib")
            logger.info("✓ Mobile banking model loaded")

            cls.premium_account_model = joblib.load(base_path / "lead_model_premium_account.joblib")
            logger.info("✓ Premium account model loaded")

            logger.info(f"All 5 product models loaded successfully from {base_path}!")
            # Temporary debug logging inside load_models()
            if hasattr(cls.credit_card_model, "feature_name_"):
                logger.info(f"Credit Card Model expected features: {cls.credit_card_model.feature_name_}")
                logger.info(f"Total expected features: {cls.credit_card_model.n_features_in_}")
            return True

        except FileNotFoundError as e:
            logger.error(f"Model file not found: {str(e)}")
            raise Exception(f"Failed to load product models: {str(e)}")
        except Exception as e:
            logger.error(f"Error loading product models: {str(e)}")
            raise Exception(f"Failed to load product models: {str(e)}")
    @staticmethod
    def preprocess_features(features_dict: dict) -> np.ndarray:
        """Convert raw input features to 13 processed features
        
        One-hot encode categorical variables and normalize numerical features.
        Must match churn model preprocessing exactly.
        
        Args:
            features_dict: Raw member features dictionary
            
        Returns:
            np.ndarray: Preprocessed features array (shape: 1, 13)
        """
        try:
            from app.ml_pipeline import MLPipeline
            
            # Use existing MLPipeline preprocessing (same as churn model)
            processed = MLPipeline.preprocess_features(features_dict)
            return processed
            
        except Exception as e:
            logger.error(f"Feature preprocessing error: {str(e)}")
            raise Exception(f"Failed to preprocess features: {str(e)}")
    
    @classmethod
    def score_product(cls, product_name: str, features_array: np.ndarray) -> float:
        """Score adoption probability for a single product
        
        Args:
            product_name: Name of product ('credit_card', 'personal_loan', etc.)
            features_array: Preprocessed features array (shape: 1, 13)
            
        Returns:
            float: Adoption probability (0.0 to 1.0)
        """
        try:
            # Select appropriate model
            if product_name == "credit_card":
                model = cls.credit_card_model
            elif product_name == "personal_loan":
                model = cls.personal_loan_model
            elif product_name == "investment":
                model = cls.investment_model
            elif product_name == "mobile_banking":
                model = cls.mobile_banking_model
            elif product_name == "premium_account":
                model = cls.premium_account_model
            else:
                raise ValueError(f"Unknown product: {product_name}")
            
            if model is None:
                raise Exception(f"Model for {product_name} not loaded")
            
            # Get probability for positive class (probability of adoption)
            probability = model.predict_proba(features_array)[0][1]
            return float(probability)
            
        except Exception as e:
            logger.error(f"Error scoring {product_name}: {str(e)}")
            raise Exception(f"Failed to score {product_name}: {str(e)}")
    
    @classmethod
    def score_all_products(cls, features_dict: dict, credit_card_status: int) -> dict:
        """Score all 5 products for a member
        
        Args:
            features_dict: Raw member features
            credit_card_status: 0 or 1 (does member already have credit card?)
            
        Returns:
            dict: {
                "credit_card": 0.0-1.0,
                "personal_loan": 0.0-1.0,
                "investment": 0.0-1.0,
                "mobile_banking": 0.0-1.0,
                "premium_account": 0.0-1.0
            }
        """
        try:
            logger.info(f"Scoring products for member (credit_card_status={credit_card_status})")
            
            # Preprocess features once
            processed_features = cls.preprocess_features(features_dict)
            
            # Score each product
            product_scores = {}
            
            # Credit card: if already owns (credit_card_status=1), probability = 1.0
            if credit_card_status == 1:
                product_scores["credit_card"] = 1.0
                logger.debug("Credit card: member already owns (prob=1.0)")
            else:
                cc_prob = cls.score_product("credit_card", processed_features)
                product_scores["credit_card"] = cc_prob
                logger.debug(f"Credit card adoption probability: {cc_prob:.4f}")
            
            # Personal Loan
            pl_prob = cls.score_product("personal_loan", processed_features)
            product_scores["personal_loan"] = pl_prob
            logger.debug(f"Personal loan adoption probability: {pl_prob:.4f}")
            
            # Investment
            inv_prob = cls.score_product("investment", processed_features)
            product_scores["investment"] = inv_prob
            logger.debug(f"Investment adoption probability: {inv_prob:.4f}")
            
            # Mobile Banking
            mb_prob = cls.score_product("mobile_banking", processed_features)
            product_scores["mobile_banking"] = mb_prob
            logger.debug(f"Mobile banking adoption probability: {mb_prob:.4f}")
            
            # Premium Account
            pa_prob = cls.score_product("premium_account", processed_features)
            product_scores["premium_account"] = pa_prob
            logger.debug(f"Premium account adoption probability: {pa_prob:.4f}")
            
            return product_scores
            
        except Exception as e:
            logger.error(f"Error scoring all products: {str(e)}")
            raise Exception(f"Failed to score products: {str(e)}")
    
    @staticmethod
    def generate_recommendation(product_name: str, probability: float, has_product: int) -> str:
        """Generate friendly recommendation based on adoption probability
        
        Args:
            product_name: Product name
            probability: Adoption probability (0.0-1.0)
            has_product: 0 or 1 (does member already own?)
            
        Returns:
            str: Recommendation text
        """
        if has_product == 1:
            return "Already has this product"
        
        if probability >= 0.7:
            return "⭐ High probability - recommend reaching out"
        elif probability >= 0.5:
            return "Good candidate for this product"
        elif probability >= 0.3:
            return "Moderate probability - consider in future"
        else:
            return "Low probability - deprioritize"
    
    @classmethod
    def identify_top_opportunity(cls, product_scores: dict, credit_card_status: int) -> str:
        """Identify product with highest adoption probability (excluding already owned)
        
        Args:
            product_scores: Dict of all product probabilities
            credit_card_status: 0 or 1
            
        Returns:
            str: Product name with highest opportunity
        """
        # Exclude products member already owns
        available_products = {}
        
        for product_name, probability in product_scores.items():
            # Skip credit card if already owns
            if product_name == "credit_card" and credit_card_status == 1:
                continue
            available_products[product_name] = probability
        
        # Find product with highest probability
        if not available_products:
            return "none"
        
        top_product = max(available_products, key=available_products.get)
        return top_product
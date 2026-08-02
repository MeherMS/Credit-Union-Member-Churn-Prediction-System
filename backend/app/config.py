from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings from environment variables"""

    # MongoDB
    mongodb_url: str = ""
    mongodb_db_name: str = "Credit_Union_Member_Churn"
    mongodb_collection_name: str = "Credit_Union_Member_Churn_Prediction_System"

    # Model
    model_path: str = "../models/churn_model.joblib"

    # Environment
    environment: str = "development"
    debug: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()

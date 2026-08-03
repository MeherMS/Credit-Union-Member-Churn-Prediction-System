from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings from environment variables"""

    # MongoDB
    mongodb_url: str = ""
    mongodb_db_name: str = "Credit_Union_Member_Churn"
    mongodb_collection_name: str = "Credit_Union_Member_Churn"

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
    @property
    def model_path(self) -> str:
        """Get absolute path to model, regardless of working directory"""
        # If MODEL_PATH is set in env, use it
        env_path = os.getenv("MODEL_PATH")
        if env_path and os.path.exists(env_path):
            return env_path
        
        # Otherwise, construct absolute path from project root
        backend_dir = Path(__file__).parent.parent  # backend/ directory
        project_root = backend_dir.parent  # project root
        model_file = project_root / "models" / "churn_model.joblib"
        
        return str(model_file)


settings = Settings()

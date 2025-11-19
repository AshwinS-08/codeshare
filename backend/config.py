import os
from typing import List, Type
from dotenv import load_dotenv


# Load environment variables from a .env file if present
load_dotenv()


def _cors_origins_from_env(defaults: List[str]) -> List[str]:
    raw = os.getenv("CORS_ORIGINS")
    if not raw:
        return defaults
    # comma-separated list
    return [o.strip() for o in raw.split(",") if o.strip()]


class Config:
    """Base configuration class"""

    # IMPORTANT: Override in production via environment variables
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")

    # Supabase configuration
    SUPABASE_URL = os.environ.get("SUPABASE_URL")
    # Prefer explicit service role keys; provide aliases for convenience
    SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get(
        "SUPABASE_SERVICE_KEY"
    )
    SUPABASE_KEY = os.environ.get("SUPABASE_KEY") or os.environ.get("SUPABASE_ANON_KEY")

    # File upload settings
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS = {
        "txt",
        "pdf",
        "png",
        "jpg",
        "jpeg",
        "gif",
        "doc",
        "docx",
        "py",
        "js",
        "html",
        "css",
        "json",
        "xml",
        "zip",
        "tar",
        "gz",
    }

    # Share settings
    DEFAULT_EXPIRY_HOURS = 24
    MAX_EXPIRY_HOURS = 168  # 7 days
    CODE_LENGTH = 6

    # CORS settings
    CORS_ORIGINS = _cors_origins_from_env(
        [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8080",
            "http://localhost:8081",
            "https://localhost:3000",
            "https://localhost:8080",
            "https://localhost:8081",
            "https://your-frontend-domain.com",
        ]
    )


class DevelopmentConfig(Config):
    """Development configuration"""

    DEBUG = True
    FLASK_ENV = "development"


class ProductionConfig(Config):
    """Production configuration"""

    DEBUG = False
    FLASK_ENV = "production"


class TestingConfig(Config):
    """Testing configuration"""

    TESTING = True
    DEBUG = True


# Configuration mapping
config: dict[str, Type[Config]] = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}

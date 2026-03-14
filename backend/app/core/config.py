import os
from dotenv import load_dotenv

load_dotenv()

PROJECT_NAME = "JobGuard AI"
API_V1_STR = "/api/v1"

# Database
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("SQLALCHEMY_DATABASE_URI")

if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL environment variable is not set. "
        "Set DATABASE_URL or SQLALCHEMY_DATABASE_URI in the backend service environment."
    )

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

print("Connected to PostgreSQL database configuration")

SQLALCHEMY_DATABASE_URI = DATABASE_URL

# Security & CORS
CORS_ORIGINS_STR = os.getenv("BACKEND_CORS_ORIGINS", "")
if CORS_ORIGINS_STR:
    BACKEND_CORS_ORIGINS = [origin.strip() for origin in CORS_ORIGINS_STR.split(",")]
else:
    BACKEND_CORS_ORIGINS = ["*"]

# AI Performance
ENV = os.getenv("ENV", "production")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

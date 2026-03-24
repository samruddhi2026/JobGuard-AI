import os
from dotenv import load_dotenv

load_dotenv()

PROJECT_NAME = "JobGuard AI"
API_V1_STR = "/api/v1"

# Database
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("SQLALCHEMY_DATABASE_URI")

if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

DATABASE_CONFIGURED = bool(DATABASE_URL)
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
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

import os
from dotenv import load_dotenv
from typing import List

load_dotenv()

PROJECT_NAME = "JobGuard AI"
API_V1_STR = "/api/v1"

# Database
POSTGRES_SERVER = os.getenv("POSTGRES_SERVER", "localhost")
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "root")
POSTGRES_DB = os.getenv("POSTGRES_DB", "jobguard")

# Handle Supabase/Render DATABASE_URL format
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

SQLALCHEMY_DATABASE_URI = DATABASE_URL or f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}/{POSTGRES_DB}"

# Security & CORS
CORS_ORIGINS_STR = os.getenv("BACKEND_CORS_ORIGINS", "")
if CORS_ORIGINS_STR:
    BACKEND_CORS_ORIGINS: List[str] = [origin.strip() for origin in CORS_ORIGINS_STR.split(",")]
else:
    # Allow local and a wildcard for initial free hosting setup
    BACKEND_CORS_ORIGINS: List[str] = ["*"] 

# AI Performance
ENV = os.getenv("ENV", "development")
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

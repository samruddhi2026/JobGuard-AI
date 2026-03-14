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

SQLALCHEMY_DATABASE_URI = os.getenv(
    "DATABASE_URL",
    f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}/{POSTGRES_DB}"
)

# Security & CORS
BACKEND_CORS_ORIGINS: List[str] = os.getenv(
    "BACKEND_CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

# AI Performance
ENV = os.getenv("ENV", "development")
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

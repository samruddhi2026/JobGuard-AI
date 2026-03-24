from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from loguru import logger
import uvicorn
import sys

from app.api.router_verify import router as verify_router
from app.api.router_ats import router as ats_router
from app.api.router_scraper import router as scraper_router
from app.api.router_stats import router as stats_router
from app.api.router_feedback import router as feedback_router
from app.api.router_ai import router as ai_router
from app.db.session import engine, Base, check_database_connection
from app.core import config
import app.db.models

# Configure Loguru
logger.remove()
logger.add(sys.stdout, format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>")

# Configure Rate Limiter
limiter = Limiter(key_func=get_remote_address)

# Create tables only when DB is configured, but don't block API startup if the
# database is temporarily unavailable.
if engine is not None:
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as exc:
        logger.warning(f"Database initialization skipped: {exc}")
else:
    logger.warning("DATABASE_URL is not set. Skipping database initialization.")

app = FastAPI(
    title=config.PROJECT_NAME,
    description="Production-ready AI powered platform for Job seekers security.",
    version="1.1.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

app.include_router(verify_router, prefix="/api/v1/verify", tags=["Verification"])
app.include_router(ats_router, prefix="/api/v1/ats", tags=["ATS & Matching"])
app.include_router(scraper_router, prefix="/api/v1/scraper", tags=["Scraper"])
app.include_router(stats_router, prefix="/api/v1/stats", tags=["Statistics"])
app.include_router(feedback_router, prefix="/api/v1/feedback", tags=["Feedback"])
app.include_router(ai_router, prefix="/api/v1/ai", tags=["AI Features"])

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": f"Welcome to {config.PROJECT_NAME} API v1.1",
        "version": "1.1.0"
    }

@app.get("/health")
async def health_check():
    db_status = check_database_connection()
    overall_status = "healthy" if db_status["connected"] or not db_status["configured"] else "degraded"
    return {
        "status": overall_status,
        "service": config.PROJECT_NAME,
        "database": db_status
    }

@app.get("/api/status")
async def api_status():
    db_status = check_database_connection()
    return {
        "service": config.PROJECT_NAME,
        "version": "1.1.0",
        "environment": config.ENV,
        "debug": config.DEBUG,
        "database": db_status,
        "cors_origins": config.BACKEND_CORS_ORIGINS,
        "api_prefix": config.API_V1_STR
    }

if __name__ == "__main__":
    logger.info("Starting JobGuard AI Backend...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

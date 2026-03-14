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
from app.db.session import engine, Base
from app.core import config
import app.db.models 

# Configure Loguru
logger.remove()
logger.add(sys.stdout, format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>")

# Configure Rate Limiter
limiter = Limiter(key_func=get_remote_address)

# Create tables
Base.metadata.create_all(bind=engine)

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

@app.get("/")
async def root():
    return {"message": f"Welcome to {config.PROJECT_NAME} API v1.1"}

if __name__ == "__main__":
    logger.info("Starting JobGuard AI Backend...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

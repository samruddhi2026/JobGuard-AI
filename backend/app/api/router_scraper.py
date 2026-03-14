from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.services.scraper_service import ScraperService
from app.db.session import get_db
from app.db.models import JobListing
from typing import List
from loguru import logger

router = APIRouter()

@router.get("/search")
async def search_jobs(company: str, location: str = None, db: Session = Depends(get_db)):
    if not company or len(company.strip()) < 2:
        raise HTTPException(status_code=400, detail="Search query is too short or empty.")
    try:
        # 'company' parameter is treated as a generic search query (company or role)
        jobs = await ScraperService.fetch_job_listings(company, location)
        career_page = ScraperService.get_official_career_page(company)
        
        # Save top results to the database gracefully
        try:
            for job in jobs[:5]:
                db_job = JobListing(
                    company=job.get("company"),
                    title=job.get("role"),
                    link=job.get("link"),
                    source=job.get("source"),
                    is_verified=job.get("verified", False),
                    description=job.get("description"),
                    experience_required=job.get("experience")
                )
                db.add(db_job)
            db.commit()
        except Exception as db_err:
            db.rollback()
            logger.warning(f"Failed to save job listings to DB: {db_err}")
        
        return {
            "query": company,
            "official_career_page": career_page,
            "jobs": jobs
        }
    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        logger.error(f"Scraper error for query '{company}': {error_msg}")
        # Return a more descriptive error if possible
        detail = str(e) if str(e) else "Internal Scraping Error. Check backend logs."
        raise HTTPException(status_code=400, detail=detail)

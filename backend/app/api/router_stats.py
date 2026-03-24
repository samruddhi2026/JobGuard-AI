from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.db.models import JobVerification, Resume, JobListing
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/summary")
async def get_dashboard_summary(db: Session = Depends(get_db)):
    # Calculate counts
    total_verifications = db.query(func.count(JobVerification.id)).scalar()
    total_resumes = db.query(func.count(Resume.id)).scalar()
    total_jobs = db.query(func.count(JobListing.id)).scalar()
    
    # Calculate averages
    avg_ats_score = db.query(func.avg(Resume.ats_score)).scalar() or 0
    
    # Recent activity
    recent_verifications = db.query(JobVerification).order_by(JobVerification.scanned_at.desc()).limit(5).all()
    
    # Transform activity for frontend
    activities = []
    for v in recent_verifications:
        activities.append({
            "type": "Verification",
            "target": v.domain or v.url,
            "status": "Safe" if v.trust_score > 70 else ("Suspicious" if v.trust_score > 40 else "Likely Scam"),
            "time": v.scanned_at.strftime("%Y-%m-%d %H:%M"),
            "score": v.trust_score
        })

    return {
        "stats": [
            { "label": "Links Verified", "value": str(total_verifications), "trend": "Real-time" },
            { "label": "Resume Scans", "value": str(total_resumes), "trend": f"{int(avg_ats_score)} avg score" },
            { "label": "Jobs Found", "value": str(total_jobs), "trend": "Global" }
        ],
        "recent_activity": activities
    }

@router.get("/insights")
async def get_market_insights(db: Session = Depends(get_db)):
    """Advanced market insights for the dashboard."""
    # 1. Skill Distribution (mocking/extracting from descriptions if available)
    # In a real app, this would be a separate table or a more complex query.
    # We'll use the most common skills found in descriptions.
    from app.services.ats_service import ATSService
    ats = ATSService()
    
    jobs = db.query(JobListing).limit(100).all()
    skill_counts = {}
    location_counts = {}
    
    for job in jobs:
        # Skills
        if job.description:
            skills = ats.extract_skills(job.description)
            for s in skills:
                skill_counts[s] = skill_counts.get(s, 0) + 1
        
        # Location (heuristically from source or description)
        loc = "Remote"
        if job.description and "Location:" in job.description:
            try: loc = job.description.split("Location:")[1].split("\n")[0].strip()
            except: pass
        location_counts[loc] = location_counts.get(loc, 0) + 1

    # Format for charts
    top_skills = sorted([{"name": k.title(), "value": v} for k, v in skill_counts.items()], key=lambda x: x["value"], reverse=True)[:8]
    top_locations = sorted([{"name": k, "value": v} for k, v in location_counts.items()], key=lambda x: x["value"], reverse=True)[:5]

    # Fallback/Mock data if DB is empty to show the feature
    if not top_skills:
        top_skills = [
            {"name": "Python", "value": 45},
            {"name": "React", "value": 38},
            {"name": "TypeScript", "value": 32},
            {"name": "SQL", "value": 28},
            {"name": "AWS", "value": 25},
            {"name": "Docker", "value": 20},
            {"name": "FastAPI", "value": 18},
            {"name": "Machine Learning", "value": 15}
        ]
    
    if not top_locations:
        top_locations = [
            {"name": "Remote", "value": 60},
            {"name": "New York", "value": 15},
            {"name": "San Francisco", "value": 12},
            {"name": "London", "value": 8},
            {"name": "Bangalore", "value": 5}
        ]

    return {
        "top_skills": top_skills,
        "top_locations": top_locations,
        "market_sentiment": "Positive",
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M")
    }

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

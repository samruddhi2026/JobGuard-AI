from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.services.verification_service import VerificationService
from app.db.session import get_db
from app.db.models import JobVerification
from pydantic import BaseModel

router = APIRouter()

class VerifyRequest(BaseModel):
    url: str
    official_domain: str = None

@router.post("/verify")
async def verify_job(request: VerifyRequest, db: Session = Depends(get_db)):
    try:
        result = await VerificationService.get_trust_score(request.url, request.official_domain)
        
        # Save to DB
        db_verification = JobVerification(
            url=request.url,
            domain=result.get("domain"),
            trust_score=result.get("trust_score"),
            risk_score=result.get("risk_score"),
            explanation=result.get("explanation")
        )
        db.add(db_verification)
        db.commit()
        
        return result
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

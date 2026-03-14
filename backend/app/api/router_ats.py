from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from app.services.ats_service import ATSService
from app.services.matching_service import MatchingService
from app.db.session import get_db
from app.db.models import Resume
from pydantic import BaseModel
import json

from app.services.file_extractor import FileExtractor
from typing import Optional

router = APIRouter()
ats_service = ATSService()
matching_service = MatchingService()

@router.post("/ats-check")
async def ats_check(
    resume_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    try:
        final_text = ""
        
        if file:
            content = await file.read()
            extracted_text = await FileExtractor.extract_text(content, file.filename)
            if not extracted_text:
                raise HTTPException(status_code=400, detail="Unsupported file format or extraction failed.")
            final_text = extracted_text
        elif resume_text:
            final_text = resume_text
        else:
            raise HTTPException(status_code=400, detail="Either 'resume_text' or 'file' must be provided.")

        result = ats_service.calculate_ats_score(final_text)
        
        # Save to DB
        db_resume = Resume(
            content=final_text[:2000],  # Truncate content for storage
            skills=result.get("extracted_skills"),
            ats_score=result.get("ats_score"),
            feedback=result.get("suggestions")
        )
        db.add(db_resume)
        db.commit()
        
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class MatchRequest(BaseModel):
    resume_text: str
    job_description: str

@router.post("/match")
async def resume_job_match(request: MatchRequest, db: Session = Depends(get_db)):
    try:
        result = matching_service.get_match_score(request.resume_text, request.job_description)
        
        if "error" in result:
            raise HTTPException(status_code=503, detail=result["error"])

        # Save match activity to Resume table (as a match entry)
        db_match = Resume(
            content=f"MATCH: {request.job_description[:100]}...",
            skills=result.get("matching_skills"),
            ats_score=result.get("match_score"),
            feedback=[f"Similarity: {result['semantic_similarity']}%", f"Experience: {result['experience_match']}"]
        )
        db.add(db_match)
        db.commit()
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

from fastapi import APIRouter, HTTPException, Body
from app.services.ai_service import AIService
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()
ai_service = AIService()

class InterviewPrepRequest(BaseModel):
    job_description: str
    seniority: Optional[str] = "Mid-Level"

class CoverLetterRequest(BaseModel):
    job_description: str
    resume_text: Optional[str] = ""

@router.post("/interview-prep")
async def get_interview_prep(request: InterviewPrepRequest):
    """Generate interview questions and tips."""
    try:
        result = await ai_service.generate_interview_prep(request.job_description, request.seniority)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cover-letter")
async def get_cover_letter_parts(request: CoverLetterRequest):
    """Generate tailored cover letter sections."""
    try:
        result = await ai_service.generate_cover_letter_parts(request.job_description, request.resume_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/gap-analysis")
async def get_gap_analysis(request: CoverLetterRequest):
    """Analyze the gap between resume and JD."""
    try:
        result = await ai_service.generate_gap_analysis(request.job_description, request.resume_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

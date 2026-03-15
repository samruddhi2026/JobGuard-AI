from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Feedback
from app.schemas.feedback import FeedbackCreate, FeedbackResponse
from loguru import logger

router = APIRouter()

@router.post("/", response_model=FeedbackResponse, status_code=201)
async def create_feedback(feedback: FeedbackCreate, db: Session = Depends(get_db)):
    try:
        db_feedback = Feedback(
            name=feedback.name,
            email=feedback.email,
            rating=feedback.rating,
            comment=feedback.comment
        )
        db.add(db_feedback)
        db.commit()
        db.refresh(db_feedback)
        logger.info(f"New feedback received: Rating {feedback.rating}")
        return db_feedback
    except Exception as e:
        db.rollback()
        logger.error(f"Error saving feedback: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

class FeedbackBase(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    rating: int
    comment: str

class FeedbackCreate(FeedbackBase):
    pass

class FeedbackResponse(FeedbackBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

from sqlalchemy import Column, Integer, String, Boolean, JSON, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.session import Base

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class JobVerification(Base):
    __tablename__ = "job_verifications"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    url = Column(String, nullable=False)
    domain = Column(String)
    trust_score = Column(Integer)
    risk_score = Column(Integer)
    explanation = Column(String)
    scanned_at = Column(DateTime(timezone=True), server_default=func.now())

class Resume(Base):
    __tablename__ = "resumes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(String)
    skills = Column(JSON)
    ats_score = Column(Integer)
    feedback = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class JobListing(Base):
    __tablename__ = "job_listings"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company = Column(String)
    title = Column(String)
    location = Column(String, nullable=True)
    link = Column(String)
    source = Column(String)
    is_verified = Column(Boolean, default=False)
    description = Column(String, nullable=True)
    experience_required = Column(String, nullable=True)
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())

class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    rating = Column(Integer, nullable=False)
    comment = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

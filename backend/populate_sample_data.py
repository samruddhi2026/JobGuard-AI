import uuid
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Add backend to path to import models
sys.path.append(os.getcwd())

from app.db.session import engine, SessionLocal, Base
from app.db.models import JobListing

SAMPLE_JOBS = [
    {
        "company": "Google",
        "title": "Senior Software Engineer",
        "location": "Mountain View, CA",
        "source": "Greenhouse",
        "description": "We are looking for a Senior Software Engineer with expertise in Python, Go, and Distributed Systems. Experience with Kubernetes and Docker is a plus.",
        "experience": "5+ years"
    },
    {
        "company": "Meta",
        "title": "Product Designer",
        "location": "Remote",
        "source": "Lever",
        "description": "Join our design team to build the future of social connection. Skills: Figma, React, Product Design, User Research.",
        "experience": "3+ years"
    },
    {
        "company": "Amazon",
        "title": "Data Scientist",
        "location": "Seattle, WA",
        "source": "Workday",
        "description": "Analyze large datasets and build machine learning models. Skills: Python, SQL, Machine Learning, AWS, SageMaker.",
        "experience": "Senior"
    },
    {
        "company": "Stripe",
        "title": "Backend Engineer",
        "location": "Dublin, Ireland",
        "source": "Greenhouse",
        "description": "Help us build the infrastructure for the internet economy. Skills: Ruby, SQL, API Design, Security.",
        "experience": "Mid-Senior"
    },
    {
        "company": "Netflix",
        "title": "Full Stack Engineer",
        "location": "Los Gatos, CA",
        "source": "Direct",
        "description": "Build high-scale user interfaces. Skills: JavaScript, TypeScript, React, Node.js, AWS.",
        "experience": "5+ years"
    },
    {
        "company": "Microsoft",
        "title": "Azure Solution Architect",
        "location": "Redmond, WA",
        "source": "Lever",
        "description": "Design cloud solutions for enterprise customers. Skills: Azure, C#, SQL, Cloud Architecture.",
        "experience": "Principal"
    },
    {
        "company": "Airbnb",
        "title": "iOS Developer",
        "location": "San Francisco, CA",
        "source": "Greenhouse",
        "description": "Build world-class mobile experiences. Skills: Swift, SwiftUI, iOS SDK.",
        "experience": "4+ years"
    },
    {
        "company": "Uber",
        "title": "Site Reliability Engineer",
        "location": "New York, NY",
        "source": "Direct",
        "description": "Ensure the reliability and performance of our infrastructure. Skills: Python, Go, Docker, Kubernetes, Linux.",
        "experience": "Mid-Level"
    }
]

def populate():
    # Force recreate the job_listings table to apply schema changes
    print("Recreating database schema...")
    try:
        JobListing.__table__.drop(bind=engine, checkfirst=True)
    except Exception as e:
        print(f"Note: Could not drop table: {e}")
        
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print(f"Checking existing job listings...")
        count = db.query(JobListing).count()
        if count > 0:
            print(f"Found {count} existing jobs. Clearing table for fresh sample data...")
            db.query(JobListing).delete()
            db.commit()

        print(f"Populating {len(SAMPLE_JOBS)} sample job listings...")
        for job in SAMPLE_JOBS:
            db_job = JobListing(
                id=uuid.uuid4(),
                company=job["company"],
                title=job["title"],
                location=job["location"],
                link=f"https://careers.{job['company'].lower()}.com/jobs/{uuid.uuid4().hex[:8]}",
                source=job["source"],
                is_verified=True,
                description=job["description"],
                experience_required=job["experience"],
                fetched_at=datetime.now()
            )
            db.add(db_job)
        
        db.commit()
        print("Successfully populated sample data!")
    except Exception as e:
        db.rollback()
        print(f"Error populating data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    populate()

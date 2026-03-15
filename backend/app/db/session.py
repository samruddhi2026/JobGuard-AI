from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import SQLALCHEMY_DATABASE_URI

engine = create_engine(SQLALCHEMY_DATABASE_URI) if SQLALCHEMY_DATABASE_URI else None
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) if engine else None

Base = declarative_base()

def get_db():
    if SessionLocal is None:
        raise RuntimeError("Database is not configured. Set DATABASE_URL or SQLALCHEMY_DATABASE_URI.")

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

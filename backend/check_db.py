import os
from sqlalchemy import create_engine, text
from app.core.config import SQLALCHEMY_DATABASE_URI

def check():
    print(f"Connecting to: {SQLALCHEMY_DATABASE_URI}")
    try:
        engine = create_engine(SQLALCHEMY_DATABASE_URI)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("Successfully connected to the database!")
            
            # Check if tables exist
            result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
            tables = [row[0] for row in result]
            print(f"Existing tables: {tables}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check()

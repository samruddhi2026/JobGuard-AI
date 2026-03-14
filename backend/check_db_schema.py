from sqlalchemy import create_engine, inspect
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/jobguard")

def check_schema():
    engine = create_engine(DATABASE_URL)
    inspector = inspect(engine)
    columns = inspector.get_columns('job_listings')
    print("Columns in 'job_listings' table:")
    for col in columns:
        print(f" - {col['name']} ({col['type']})")

if __name__ == "__main__":
    check_schema()

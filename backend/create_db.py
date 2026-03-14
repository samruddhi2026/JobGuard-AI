from sqlalchemy import create_engine, text

def check_db():
    uri = "postgresql://postgres:root@localhost/postgres"
    engine = create_engine(uri, isolation_level="AUTOCOMMIT")
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1 FROM pg_database WHERE datname='jobguard'"))
        exists = result.scalar() is not None
        if not exists:
            print("Database 'jobguard' does not exist. Creating it...")
            conn.execute(text("CREATE DATABASE jobguard"))
            print("Database 'jobguard' created.")
        else:
            print("Database 'jobguard' already exists.")

if __name__ == "__main__":
    check_db()

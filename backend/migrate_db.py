import psycopg2
import sys

def migrate():
    try:
        conn = psycopg2.connect("postgresql://postgres:root@localhost/jobguard")
        cur = conn.cursor()
        print("Adding columns to job_listings...")
        cur.execute("ALTER TABLE job_listings ADD COLUMN IF NOT EXISTS description VARCHAR;")
        cur.execute("ALTER TABLE job_listings ADD COLUMN IF NOT EXISTS experience_required VARCHAR;")
        conn.commit()
        cur.close()
        conn.close()
        print("Migration successful!")
    except Exception as e:
        print(f"Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    migrate()

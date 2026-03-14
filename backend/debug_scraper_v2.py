import asyncio
from app.services.scraper_service import ScraperService
from loguru import logger
import sys

async def debug():
    query = "Junior software engineer"
    print(f"--- Debugging Scraper for: {query} ---")
    try:
        jobs = await ScraperService.fetch_job_listings(query)
        print(f"Found {len(jobs)} jobs")
        for j in jobs[:2]:
            print(f" - {j['company']}: {j['role']} ({j['link']})")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"CRASH: {e}")

if __name__ == "__main__":
    asyncio.run(debug())

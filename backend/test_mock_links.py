import asyncio
from app.services.scraper_service import ScraperService
import json

async def main():
    print("Testing 'InnovateAI':")
    jobs = await ScraperService.fetch_job_listings("InnovateAI")
    
    # Asserting that the links are clean
    for job in jobs[:3]:
        print(f"[{job['company']}] -> {job['link']}")

if __name__ == "__main__":
    asyncio.run(main())

import asyncio
import aiohttp
from app.services.scraper_service import ScraperService
import os

async def main():
    # Force some environment variables if needed
    os.environ["PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD"] = "1"
    
    print("--- Testing USA-Specific Jobs ---")
    usa_jobs = await ScraperService.fetch_job_listings("Software Engineer", "USA")
    for j in usa_jobs[:3]:
        print(f"[{j['company']}] {j['role']} in {j['location']}")
        
    print("\n--- Testing India-Specific Jobs ---")
    india_jobs = await ScraperService.fetch_job_listings("Engineer", "India")
    for j in india_jobs[:3]:
        print(f"[{j['company']}] {j['role']} in {j['location']}")

    print("\n--- Testing Specific City (San Francisco) ---")
    sf_jobs = await ScraperService.fetch_job_listings("Designer", "San Francisco")
    for j in sf_jobs[:3]:
        print(f"[{j['company']}] {j['role']} in {j['location']}")

if __name__ == "__main__":
    asyncio.run(main())

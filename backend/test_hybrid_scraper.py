import asyncio
from app.services.scraper_service import ScraperService
import json

async def main():
    print("Testing 'Software Engineer':")
    jobs = await ScraperService.fetch_job_listings("Software Engineer")
    print(json.dumps([{"c": j["company"], "r": j["role"]} for j in jobs], indent=2))
    
    print("\nTesting 'Google':")
    jobs2 = await ScraperService.fetch_job_listings("Google")
    print(json.dumps([{"c": j["company"], "r": j["role"]} for j in jobs2], indent=2))

if __name__ == "__main__":
    asyncio.run(main())

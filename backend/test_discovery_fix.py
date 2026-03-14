import asyncio
from app.services.scraper_service import ScraperService
import json

async def test_career_discovery():
    scraper = ScraperService()
    
    # Test case 1: Generic query that was causing issues
    print("Testing generic query: 'junior data'")
    results = await scraper.fetch_job_listings("junior data")
    print(json.dumps(results, indent=2))
    
    # Test case 2: Real company
    print("\nTesting real company: 'Microsoft'")
    results = await scraper.fetch_job_listings("Microsoft")
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    asyncio.run(test_career_discovery())

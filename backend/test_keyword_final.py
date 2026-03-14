import asyncio
from app.services.scraper_service import ScraperService
import json

async def test_keyword():
    print("--- Testing Keyword Discovery: 'Python Developer' ---")
    results = await ScraperService.fetch_job_listings("Python Developer")
    print(json.dumps(results, indent=2))
    
    if results:
        print("\n--- Testing Detail Extraction on first match ---")
        details = await ScraperService.extract_job_details(results[0]["link"])
        print(json.dumps(details, indent=2))

if __name__ == "__main__":
    asyncio.run(test_keyword())

import asyncio
from app.services.scraper_service import ScraperService
import json

async def test_realtime():
    print("--- Testing REAL-TIME Discovery: 'Junior Engineer AI' ---")
    results = await ScraperService.fetch_job_listings("Junior Engineer AI")
    print(f"Found {len(results)} results")
    for r in results:
        print(f"[{r['source']}] {r['company']}: {r['role']} -> {r['link']}")
        if r.get('description'):
            print(f"   JD Snippet: {r['description'][:100]}...")
    
if __name__ == "__main__":
    asyncio.run(test_realtime())

import asyncio
import json
from app.services.scraper_service import ScraperService

async def debug_listings():
    query = "Data Analyst"
    location = "USA"
    print(f"Searching for '{query}' in '{location}'...")
    jobs = await ScraperService.fetch_job_listings(query, location)
    
    print(f"\nTOTAL JOBS RETRIEVED: {len(jobs)}")
    print("-" * 50)
    
    for i, j in enumerate(jobs, 1):
        print(f"{i}. [{j['company']}] {j['role']}")
        print(f"   Location: {j['location']}")
        print(f"   Link: {j['link']}")
        print(f"   Description Snippet: {j['description'][:150]}...")
        # Check if it's the placeholder
        is_placeholder = "Click Apply Now" in j['description']
        print(f"   Is Placeholder: {is_placeholder}")
        print("-" * 30)

if __name__ == "__main__":
    asyncio.run(debug_listings())

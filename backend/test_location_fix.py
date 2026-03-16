import asyncio
import sys
sys.path.insert(0, '.')
from app.services.scraper_service import ScraperService

async def test():
    print("=== Testing: Software Engineer in India ===")
    jobs = await ScraperService.fetch_job_listings("Software Engineer", "India")
    for j in jobs[:5]:
        print(f"  [{j['source']}] {j['role']} @ {j['company']} | {j['location']}")
    print(f"  Total: {len(jobs)} results\n")

    print("=== Testing: Data Analyst in UK ===")
    jobs = await ScraperService.fetch_job_listings("Data Analyst", "UK")
    for j in jobs[:5]:
        print(f"  [{j['source']}] {j['role']} @ {j['company']} | {j['location']}")
    print(f"  Total: {len(jobs)} results\n")

    print("=== Testing: Designer (no location) ===")
    jobs = await ScraperService.fetch_job_listings("Designer")
    for j in jobs[:3]:
        print(f"  [{j['source']}] {j['role']} @ {j['company']} | {j['location']}")
    print(f"  Total: {len(jobs)} results")

asyncio.run(test())

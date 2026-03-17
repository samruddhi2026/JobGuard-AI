import asyncio
from app.services.scraper_service import ScraperService

async def check_loc_strict():
    query = "Data analyst"
    location = "Pune"
    results = await ScraperService.fetch_job_listings(query, location)
    
    print(f"DEBUG: Found {len(results)} results for Pune")
    pune_count = 0
    bengaluru_count = 0
    
    for r in results:
        loc = r['location'].lower()
        print(f"Result: {r['company']} - {r['role']} | Location: {r['location']}")
        if "pune" in loc:
            pune_count += 1
        if "bengaluru" in loc or "bangalore" in loc:
            bengaluru_count += 1
            
    print(f"SUMMARY: Pune results: {pune_count}, Bengaluru results: {bengaluru_count}")
    if bengaluru_count == 0:
        print("SUCCESS: No Bengaluru results found for Pune search!")
    else:
        print("FAILURE: Bengaluru results leaked into Pune search.")

if __name__ == "__main__":
    asyncio.run(check_loc_strict())

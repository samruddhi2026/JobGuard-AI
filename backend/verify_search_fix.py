import asyncio
from app.services.scraper_service import ScraperService
from loguru import logger

async def test_relevance_and_variety():
    query = "Junior Data analyst"
    location = "Pune"
    
    logger.info(f"Testing search for '{query}' in '{location}'...")
    
    # First search
    results1 = await ScraperService.fetch_job_listings(query, location)
    logger.info(f"Search 1 returned {len(results1)} results")
    for r in results1[:3]:
        logger.info(f"R1: {r['company']} - {r['role']} ({r['source']})")
        # Check for HTML tags
        if '<' in r['description'] and '>' in r['description']:
            logger.error(f"HTML TAGS DETECTED in description: {r['description'][:50]}")
        else:
            logger.success("No HTML tags in description.")

    # Second search (repeated prompt)
    results2 = await ScraperService.fetch_job_listings(query, location)
    logger.info(f"Search 2 returned {len(results2)} results")
    
    # Check for variety
    links1 = set(r['link'] for r in results1)
    links2 = set(r['link'] for r in results2)
    
    intersection = links1.intersection(links2)
    logger.info(f"Common results: {len(intersection)}")
    
    if len(results1) > 0 and len(intersection) < len(results1):
        logger.success("Variety confirmed! Different results returned for same prompt.")
    else:
        logger.warning("No variety detected or not enough results to distinguish.")

    # Check relevance (stricter match)
    query_words = query.lower().split()
    for r in results1:
        role_lower = r['role'].lower()
        loc_lower = r['location'].lower()
        
        # Keyword relevance
        if not all(w in role_lower for w in query_words):
             logger.warning(f"Relevance warning: '{r['role']}' does not contain all query words.")
        
        # Location relevance (CRITICAL FIX)
        if "pune" not in loc_lower and "remote" not in loc_lower and "india" != loc_lower:
            if "bengaluru" in loc_lower or "bangalore" in loc_lower:
                logger.error(f"CITY MATCH FAILURE: Search was for 'Pune' but got '{r['location']}' from {r['company']}")
            else:
                logger.warning(f"Location mismatch: Search was for 'Pune' but got '{r['location']}'")
        else:
            logger.success(f"Location match: '{r['location']}' is valid for 'Pune' search.")

if __name__ == "__main__":
    asyncio.run(test_relevance_and_variety())

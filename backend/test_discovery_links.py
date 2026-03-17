import asyncio
import aiohttp
from app.services.scraper_service import ScraperService

async def test_discovery():
    query = "data analyst dubai"
    print(f"Testing discovery for: {query}")
    links = await ScraperService.discover_jobs(query)
    print(f"Found {len(links)} links:")
    for l in links:
        print(f" - {l}")

if __name__ == "__main__":
    asyncio.run(test_discovery())

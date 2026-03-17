import asyncio
import aiohttp
from app.services.scraper_service import ScraperService

async def debug_gitlab():
    query = "data analyst"
    location = "dubai"
    board = "gitlab"
    
    async with aiohttp.ClientSession(headers=ScraperService.get_headers()) as session:
        results = await ScraperService._fetch_greenhouse_board(session, board, query, location)
        print(f"RESULTS_FOR_GITLAB_DUBAI: {len(results)}")
        for r in results:
            print(f"Company: {r['company']} | Role: {r['role']} | Location: {r['location']}")

if __name__ == "__main__":
    asyncio.run(debug_gitlab())

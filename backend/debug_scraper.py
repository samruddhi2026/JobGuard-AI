import asyncio
import aiohttp
from app.services.scraper_service import ScraperService

async def debug():
    urls = [
        "https://careers.wipro.com/job/Analyst/126264-en_US/?from=email", # Legitimate
        "https://adagrad.workable.com", # Non-existent company
        "https://google.com" # Generic
    ]
    
    for url in urls:
        print(f"\nVerifying: {url}")
        result = await ScraperService.verify_url(url)
        print(f"Status: {result.get('is_available')}")
        print(f"Reason: {result.get('reason')}")
        print(f"Final URL: {result.get('final_url')}")

if __name__ == "__main__":
    asyncio.run(debug())

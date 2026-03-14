import asyncio
import sys
import os

# Add the current directory to sys.path to allow importing 'app'
sys.path.append(os.getcwd())

from app.services.scraper_service import ScraperService

async def debug_verification():
    import aiohttp
    url = "https://careers.google.com"
    print(f"DEBUG: Verifying {url}...")
    
    # Manually check what indicator is found
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"}
    async with aiohttp.ClientSession() as session:
        async with session.get(url, timeout=7, headers=headers) as response:
            text = (await response.text()).lower()
            parked_indicators = ["godaddy", "domain is for sale", "buy this domain", "parked free", "hugedomains", "sedo", "this domain may be for sale"]
            for ind in parked_indicators:
                if ind in text:
                    print(f"FOUND INDICATOR: '{ind}'")
                    # find surrounding context
                    idx = text.find(ind)
                    print(f"CONTEXT: ...{text[max(0, idx-50):min(len(text), idx+50)]}...")
    
    res = await ScraperService.verify_url(url)
    print(f"SERVICE RESULT: {res}")

if __name__ == "__main__":
    asyncio.run(debug_verification())

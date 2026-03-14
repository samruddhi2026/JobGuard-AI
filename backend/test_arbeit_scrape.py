import aiohttp
import asyncio
from bs4 import BeautifulSoup

async def main():
    headers = {"User-Agent": "JobGuardAI"}
    url = "https://www.arbeitnow.com/jobs/companies/nucs-ai/product-manager-berlin-101019"
    async with aiohttp.ClientSession(headers=headers) as session:
        async with session.get(url) as resp:
            text = await resp.text()
            soup = BeautifulSoup(text, 'html.parser')
            for a in soup.find_all('a'):
                href = a.get('href', '')
                if href and href.startswith('http') and 'arbeitnow' not in href:
                    print(f"External link: {href} (Text: {a.get_text().strip()})")

if __name__ == "__main__":
    asyncio.run(main())

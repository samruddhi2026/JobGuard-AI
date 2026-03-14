import aiohttp
import asyncio
from bs4 import BeautifulSoup
import urllib.parse

async def main():
    query = "Junior Data Analyst"
    url = f"https://remote.co/remote-jobs/search/?search_keywords={urllib.parse.quote(query)}"
    headers = {"User-Agent": "Mozilla/5.0"}
    async with aiohttp.ClientSession(headers=headers) as session:
        async with session.get(url) as resp:
            print(f"Status: {resp.status}")
            if resp.status == 200:
                html = await resp.text()
                soup = BeautifulSoup(html, 'html.parser')
                jobs = soup.find_all('div', class_='card-body')
                print(f"Found {len(jobs)} jobs")

if __name__ == "__main__":
    asyncio.run(main())

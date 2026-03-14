import aiohttp
import asyncio
from bs4 import BeautifulSoup

async def main():
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    }
    async with aiohttp.ClientSession(headers=headers) as session:
        data = {'q': '"Junnior Data Analyst" site:lever.co'}
        async with session.post('https://lite.duckduckgo.com/lite/', data=data) as resp:
            text = await resp.text()
            print(f"Status: {resp.status}")
            soup = BeautifulSoup(text, 'html.parser')
            links = []
            for a in soup.find_all('a', class_='result-url'):
                href = a.get('href')
                if href: links.append(href)
            print(f"Found {len(links)} links")

if __name__ == "__main__":
    asyncio.run(main())

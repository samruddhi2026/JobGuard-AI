import aiohttp
import asyncio
from bs4 import BeautifulSoup
import urllib.parse

async def main():
    query = "Google Software Engineer jobs site:careers.google.com"
    url = f"https://www.bing.com/search?q={urllib.parse.quote(query)}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    }
    
    async with aiohttp.ClientSession(headers=headers) as session:
        async with session.get(url) as resp:
            text = await resp.text()
            soup = BeautifulSoup(text, 'html.parser')
            print(f"Status: {resp.status}")
            
            for a in soup.find_all('a'):
                href = a.get('href', '')
                if href.startswith('http') and 'google.com' in href:
                    print(f"Found: {href}")

if __name__ == "__main__":
    asyncio.run(main())

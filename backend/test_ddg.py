import aiohttp
import asyncio
from bs4 import BeautifulSoup

async def main():
    query = '"Microsoft" site:lever.co OR site:greenhouse.io'
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    }
    
    async with aiohttp.ClientSession(headers=headers) as session:
        # POST to html.duckduckgo.com works better
        data = {'q': query}
        async with session.post('https://html.duckduckgo.com/html/', data=data) as resp:
            text = await resp.text()
            soup = BeautifulSoup(text, 'html.parser')
            links = []
            for a in soup.find_all('a', class_='result__url'):
                href = a.get('href')
                if href and ('lever.co' in href or 'greenhouse.io' in href):
                    links.append(href)
            
            print(f"Found {len(links)} links:")
            for l in links: print(l)

if __name__ == "__main__":
    asyncio.run(main())

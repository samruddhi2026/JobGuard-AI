import aiohttp
import asyncio
from bs4 import BeautifulSoup

async def main():
    queries = [
        '"Junnior Data Analyst" site:lever.co OR site:greenhouse.io OR site:workable.com OR site:smartrecruiters.com OR site:breezy.hr',
        '"Junnior Data Analyst" site:lever.co OR site:greenhouse.io',
        'Junior Data Analyst site:lever.co OR site:greenhouse.io OR site:workable.com',
        'Junior Data Analyst Greenhouse Lever Workable',
        'Software Engineer site:lever.co'
    ]
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    }
    
    async with aiohttp.ClientSession(headers=headers) as session:
        for q in queries:
            print(f"Testing: {q}")
            data = {'q': q}
            async with session.post('https://html.duckduckgo.com/html/', data=data) as resp:
                text = await resp.text()
                soup = BeautifulSoup(text, 'html.parser')
                links = [a.get('href') for a in soup.find_all('a', class_='result__url')]
                print(f"  Found {len(links)} links")

if __name__ == "__main__":
    asyncio.run(main())

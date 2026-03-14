import aiohttp
import asyncio
from bs4 import BeautifulSoup

async def main():
    async with aiohttp.ClientSession() as session:
        async with session.get("https://arbeitnow.com/api/job-board-api", timeout=10) as resp:
            data = await resp.json()
            jobs = data.get("data", [])
            print(f"Total jobs: {len(jobs)}")
            match = 0
            query = "machine learning"
            for j in jobs:
                if query in j.get('title', '').lower() or query in j.get('description', '').lower():
                    match += 1
            print(f"Matches for '{query}': {match}")

if __name__ == "__main__":
    asyncio.run(main())

import asyncio
import aiohttp
import json
from bs4 import BeautifulSoup

async def list_all_gitlab():
    url = "https://boards-api.greenhouse.io/v1/boards/gitlab/jobs?content=true"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    async with aiohttp.ClientSession(headers=headers) as session:
        async with session.get(url) as resp:
            data = await resp.json()
            jobs = data.get("jobs", [])
            print(f"Total Gitlab jobs: {len(jobs)}")
            for j in jobs[:20]:
                print(f"Role: {j.get('title')} | Location: {j.get('location', {}).get('name')}")

if __name__ == "__main__":
    asyncio.run(list_all_gitlab())

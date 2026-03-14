import asyncio
import aiohttp
from typing import List, Dict

async def test_search(query: str, location: str):
    board = "stripe"
    url = f"https://boards-api.greenhouse.io/v1/boards/{board}/jobs?content=true"
    async with aiohttp.ClientSession() as session:
        async with session.get(url, timeout=10) as resp:
            if resp.status == 200:
                data = await resp.json()
                jobs = data.get("jobs", [])
                print(f"Total jobs on {board}: {len(jobs)}")
                
                matched = 0
                for j in jobs:
                    title = j.get("title", "")
                    loc = j.get("location", {}).get("name", "Remote")
                    
                    role_match = query.lower() in title.lower()
                    loc_match = location.lower() in loc.lower() or "remote" in loc.lower()
                    
                    if role_match:
                        print(f"Role Match: {title} | Location: {loc} | Loc Match: {loc_match}")
                    
                    if role_match and loc_match:
                        matched += 1
                
                print(f"Total Matches: {matched}")
            else:
                print(f"Error: {resp.status}")

if __name__ == "__main__":
    asyncio.run(test_search("Data Analyst", "USA"))

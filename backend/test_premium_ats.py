import asyncio
import aiohttp
from typing import List, Dict
import time

async def fetch_board(session: aiohttp.ClientSession, board: str, query: str) -> List[Dict]:
    url = f"https://boards-api.greenhouse.io/v1/boards/{board}/jobs"
    results = []
    try:
        async with session.get(url, timeout=5) as resp:
            if resp.status == 200:
                data = await resp.json()
                jobs = data.get("jobs", [])
                for j in jobs:
                    title = j.get("title", "")
                    location = j.get("location", {}).get("name", "Remote")
                    # simple match
                    if not query or query.lower() in title.lower():
                        results.append({
                            "company": board.title(),
                            "title": title,
                            "location": location,
                            "link": j.get("absolute_url")
                        })
    except Exception as e:
         pass
    return results

async def main():
    start = time.time()
    boards = ['stripe', 'discord', 'airbnb', 'dropbox', 'figma', 'reddit', 'lyft', 'square', 'twilio', 'coinbase', 'plaid']
    query = "Software Engineer"
    
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_board(session, b, query) for b in boards]
        results = await asyncio.gather(*tasks)
        
        all_jobs = []
        for r in results:
            all_jobs.extend(r)
            
        print(f"Found {len(all_jobs)} '{query}' jobs from Top-Tier Companies in {time.time()-start:.2f}s")
        for j in all_jobs[:5]:
            print(f"- {j['company']}: {j['title']} ({j['link']})")

if __name__ == "__main__":
    asyncio.run(main())

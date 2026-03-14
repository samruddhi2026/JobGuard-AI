import asyncio
import aiohttp

async def fetch_greenhouse(session, board):
    url = f"https://boards-api.greenhouse.io/v1/boards/{board}/jobs"
    try:
        async with session.get(url, timeout=10) as resp:
            if resp.status == 200:
                data = await resp.json()
                jobs = data.get("jobs", [])
                print(f"Greenhouse ({board}): Found {len(jobs)} jobs")
                if jobs:
                    print(f"  Sample: {jobs[0].get('title')} -> {jobs[0].get('absolute_url')}")
            else:
                print(f"Greenhouse ({board}) error: {resp.status}")
    except Exception as e:
        print(f"Greenhouse ({board}) Exception: {e}")

async def fetch_lever(session, board):
    url = f"https://api.lever.co/v0/postings/{board}?mode=json"
    try:
        async with session.get(url, timeout=10) as resp:
            if resp.status == 200:
                data = await resp.json()
                print(f"Lever ({board}): Found {len(data)} jobs")
                if data:
                    print(f"  Sample: {data[0].get('text')} -> {data[0].get('hostedUrl')}")
            else:
                print(f"Lever ({board}) error: {resp.status}")
    except Exception as e:
        print(f"Lever ({board}) Exception: {e}")

async def main():
    async with aiohttp.ClientSession() as session:
        boards_gh = ["stripe", "discord", "airbnb", "dropbox", "figma", "reddit"]
        boards_lever = ["netflix", "coursera", "yelp", "canva", "shopify"]
        
        for b in boards_gh:
            await fetch_greenhouse(session, b)
            
        for b in boards_lever:
            await fetch_lever(session, b)

if __name__ == "__main__":
    asyncio.run(main())

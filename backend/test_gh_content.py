import asyncio
import aiohttp
import json

async def main():
    board = "stripe"
    url = f"https://boards-api.greenhouse.io/v1/boards/{board}/jobs?content=true"
    async with aiohttp.ClientSession() as session:
        async with session.get(url, timeout=10) as resp:
            if resp.status == 200:
                data = await resp.json()
                jobs = data.get("jobs", [])
                if jobs:
                    job = jobs[0]
                    content = job.get("content", "NO CONTENT")
                    print(f"Content Length: {len(content)}")
                    print(f"Content Snippet: {content[:500]}")
                else:
                    print("No jobs found")
            else:
                print(f"Error: {resp.status}")

if __name__ == "__main__":
    asyncio.run(main())

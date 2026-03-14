import asyncio
import aiohttp

async def main():
    async with aiohttp.ClientSession() as session:
        # Test Greenhouse API
        greenhouse_board = "github"
        url = f"https://boards-api.greenhouse.io/v1/boards/{greenhouse_board}/jobs"
        try:
            async with session.get(url, timeout=10) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    jobs = data.get("jobs", [])
                    print(f"Greenhouse ({greenhouse_board}): Found {len(jobs)} jobs")
                    if jobs:
                        print(f"  Sample: {jobs[0]['title']} -> {jobs[0]['absolute_url']}")
                else:
                    print(f"Greenhouse error: {resp.status}")
        except Exception as e:
            print(f"Greenhouse Exception: {e}")

        # Test Lever API
        lever_board = "netflix"
        url2 = f"https://api.lever.co/v0/postings/{lever_board}?mode=json"
        try:
            async with session.get(url2, timeout=10) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    print(f"Lever ({lever_board}): Found {len(data)} jobs")
                    if data:
                        print(f"  Sample: {data[0]['text']} -> {data[0]['hostedUrl']}")
                else:
                    print(f"Lever error: {resp.status}")
        except Exception as e:
            print(f"Lever Exception: {e}")

if __name__ == "__main__":
    asyncio.run(main())

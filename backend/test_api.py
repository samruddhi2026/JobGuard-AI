import aiohttp
import asyncio

async def main():
    async with aiohttp.ClientSession() as session:
        url = 'https://remoteok.com/api?tag=Junior+Data+Analyst'
        async with session.get(url, headers={"User-Agent": "JobGuardAI/1.0"}) as resp:
            print(f"RemoteOK Status: {resp.status}")
            if resp.status == 200:
                data = await resp.json()
                print(f"Found {len(data) - 1} jobs")

if __name__ == "__main__":
    asyncio.run(main())

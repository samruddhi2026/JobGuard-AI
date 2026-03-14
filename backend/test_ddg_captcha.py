import aiohttp
import asyncio

async def main():
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    }
    async with aiohttp.ClientSession(headers=headers) as session:
        data = {'q': 'Software Engineer'}
        async with session.post('https://html.duckduckgo.com/html/', data=data) as resp:
            text = await resp.text()
            print(f"Status: {resp.status}")
            print(text[:1000])

if __name__ == "__main__":
    asyncio.run(main())

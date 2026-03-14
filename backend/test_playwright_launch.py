from playwright.async_api import async_playwright
import asyncio

async def test_launch():
    async with async_playwright() as p:
        try:
            browser = await p.chromium.launch(headless=True)
            print("Successfully launched Playwright")
            await browser.close()
        except Exception as e:
            print(f"Failed to launch Playwright: {e}")

if __name__ == "__main__":
    asyncio.run(test_launch())

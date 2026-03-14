import asyncio
from app.services.scraper_service import ScraperService

async def test_discovery():
    companies = ["Microsoft", "Stripe", "Lever", "Greenhouse"]
    for company in companies:
        print(f"--- Discovering for: {company} ---")
        results = await ScraperService.fetch_job_listings(company)
        for r in results:
            print(f"[{r['source']}] {r['link']} (Verified: {r['verified']})")

if __name__ == "__main__":
    asyncio.run(test_discovery())

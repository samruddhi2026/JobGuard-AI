import asyncio
from app.services.scraper_service import ScraperService

async def main():
    print("\nTesting fetch_job_listings with 'Microsoft'...")
    jobs = await ScraperService.fetch_job_listings("Microsoft")
    if jobs:
        for job in jobs:
            print(f"- {job['company']}: {job['role']} ({job['link']})")
    else:
        print("No jobs found for Microsoft.")

if __name__ == "__main__":
    asyncio.run(main())

from app.services.scraper_service import ScraperService

D = "Dubai"
RN = "Remote, North America"
RE = "Remote, EMEA"

res1 = ScraperService._normalize_location_match(D, RN, True)
res2 = ScraperService._normalize_location_match(D, RE, True)

print(f"D_vs_RN: {res1}")
print(f"D_vs_RE: {res2}")

from app.services.scraper_service import ScraperService

def test_logic():
    # Test 1: North America Remote for Dubai search
    res = ScraperService._normalize_location_match("Dubai", "Remote, North America", allow_remote=True)
    print(f"Match 'Dubai' vs 'Remote, North America': {res} (Expected: False)")
    
    # Test 2: EMEA Remote for Dubai search
    res = ScraperService._normalize_location_match("Dubai", "Remote, EMEA", allow_remote=True)
    print(f"Match 'Dubai' vs 'Remote, EMEA': {res} (Expected: True)")
    
    # Test 3: Pune for Pune search
    res = ScraperService._normalize_location_match("Pune", "Pune, India", allow_remote=True)
    print(f"Match 'Pune' vs 'Pune, India': {res} (Expected: True)")
    
    # Test 5: America for Dubai search (Realistic from Greenhouse)
    res = ScraperService._normalize_location_match("Dubai", "Austin, TX (Remote)", allow_remote=True)
    print(f"Match 'Dubai' vs 'Austin, TX (Remote)': {res} (Expected: False)")

    # Test 6: North America for Dubai search
    res = ScraperService._normalize_location_match("Dubai", "Remote, North America", allow_remote=True)
    print(f"Match 'Dubai' vs 'Remote, North America': {res} (Expected: False)")

if __name__ == "__main__":
    test_logic()

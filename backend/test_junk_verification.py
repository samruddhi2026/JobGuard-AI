from app.services.verification_service import VerificationService
import json

def test_junk_link():
    junk_url = "http://,m,dmnnkjf.com"
    result = VerificationService.get_trust_score(junk_url)
    print(f"Junk Link Test: {junk_url}")
    print(json.dumps(result, indent=2))
    
    # Also test valid one
    valid_url = "https://careers.google.com"
    result_valid = VerificationService.get_trust_score(valid_url)
    print(f"\nValid Link Test: {valid_url}")
    print(json.dumps(result_valid, indent=2))

if __name__ == "__main__":
    test_junk_link()

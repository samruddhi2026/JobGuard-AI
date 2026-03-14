from app.services.ats_service import ATSService
import json

def test_gibberish_ats():
    ats = ATSService()
    
    # Gibberish text from user screenshot
    gibberish = "jhhrvavknnafvjfvkajfvn fjbknlfkvnkfnvakrnvgjntiofdjvmkdfnvkjngnnfmn vm, fkjnvknvkiireop5orfefnfknnm,cvmndkwjmoeirfjjtbgnj knvkmfklvmktekjvgpotfevgjjadnmvgkkjmrooigor4k4e wiknfjkdnvmamlsdfkcoajtgjnvjndf,vmlske"
    
    print(f"Testing gibberish text (Length: {len(gibberish)})")
    result = ats.calculate_ats_score(gibberish)
    print(json.dumps(result, indent=2))
    
    # Assert score is 0
    if result["ats_score"] == 0:
        print("\nSUCCESS: Gibberish correctly returned 0%.")
    else:
        print(f"\nFAILURE: Gibberish returned {result['ats_score']}% instead of 0%.")

    # Test real resume snippet for regression
    resume = "John Doe. Software Engineer. Experience: Developed Python web applications at Google. Skills: Python, React, FastAPI."
    print("\nTesting real resume snippet:")
    result_real = ats.calculate_ats_score(resume)
    print(f"Score: {result_real['ats_score']}%")

if __name__ == "__main__":
    test_gibberish_ats()

import requests

def test_match():
    url = "http://localhost:8000/api/v1/ats/match"
    payload = {
        "resume_text": "Experienced Python Developer with expertise in FastAPI, PostgreSQL, and AWS. Strong background in building scalable AI applications.",
        "job_description": "We are looking for a Backend Engineer proficient in Python and FastAPI. Experience with AWS and SQL databases is required. Knowledge of AI and Machine Learning is a plus."
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_match()

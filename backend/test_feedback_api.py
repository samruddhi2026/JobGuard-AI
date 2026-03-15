import requests
import json

def test_feedback_submission():
    url = "http://localhost:8000/api/v1/feedback/"
    payload = {
        "name": "Test User",
        "email": "test@example.com",
        "rating": 5,
        "comment": "This is a test feedback submission."
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 201:
            print("Successfully submitted feedback!")
        else:
            print("Failed to submit feedback.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_feedback_submission()

import requests

def test_upload():
    url = "http://localhost:8000/api/v1/ats/ats-check"
    files = {'file': open('d:/jobguard-ai/backend/sample_resume.txt', 'rb')}
    
    try:
        response = requests.post(url, files=files)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_upload()

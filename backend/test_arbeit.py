import urllib.request
import json

def main():
    url = "https://arbeitnow.com/api/job-board-api"
    req = urllib.request.Request(url, headers={'User-Agent': 'JobGuardAI'})
    try:
        response = urllib.request.urlopen(req)
        data = json.loads(response.read())
        jobs = data.get('data', [])
        print(f"Keys: {jobs[0].keys()}")
        print(f"URL: {jobs[0].get('url')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()

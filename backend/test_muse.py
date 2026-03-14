import urllib.request
import json

def main():
    url = "https://www.themuse.com/api/public/jobs?category=Software%20Engineer&page=1"
    req = urllib.request.Request(url, headers={'User-Agent': 'JobGuardAI'})
    try:
        response = urllib.request.urlopen(req)
        data = json.loads(response.read())
        jobs = data.get('results', [])
        print(f"Found {len(jobs)} jobs")
        if jobs:
            print(f"Keys: {jobs[0].keys()}")
            print(f"URL: {jobs[0].get('refs')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()

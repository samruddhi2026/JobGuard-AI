import urllib.request
import json

def main():
    url = "https://hn.algolia.com/api/v1/search?query=Software+Engineer&tags=job"
    req = urllib.request.Request(url, headers={'User-Agent': 'JobGuardAI'})
    try:
        response = urllib.request.urlopen(req)
        data = json.loads(response.read())
        jobs = data.get('hits', [])
        print(f"Found {len(jobs)} jobs")
        if jobs:
            print(f"Sample URL: {jobs[0].get('url')}")
            for hit in jobs[:3]:
                print(hit.get('url'))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()

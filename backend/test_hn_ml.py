import urllib.request
import json

def main():
    url = "https://hn.algolia.com/api/v1/search?query=Machine+Learning&tags=job"
    req = urllib.request.Request(url, headers={'User-Agent': 'JobGuardAI'})
    try:
        response = urllib.request.urlopen(req)
        data = json.loads(response.read())
        jobs = data.get('hits', [])
        print(f"Found {len(jobs)} jobs")
        if jobs:
            for hit in jobs[:5]:
                print(f"- {hit.get('title')} -> {hit.get('url')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()

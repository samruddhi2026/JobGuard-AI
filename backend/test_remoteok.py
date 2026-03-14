import urllib.request
import json
from bs4 import BeautifulSoup

def main():
    url = "https://remoteok.com/api"
    req = urllib.request.Request(url, headers={'User-Agent': 'JobGuardAI'})
    try:
        response = urllib.request.urlopen(req)
        data = json.loads(response.read())
        jobs = data[1:] # First element is legal text
        print(f"Found {len(jobs)} jobs")
        print(f"Sample full URL: {jobs[0].get('apply_url') or jobs[0].get('url')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()

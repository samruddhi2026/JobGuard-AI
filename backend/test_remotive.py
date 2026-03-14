import urllib.request
import json
import urllib.parse

def main():
    query = "Data Analyst"
    url = f"https://remotive.io/api/remote-jobs?search={urllib.parse.quote(query)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'JobGuardAI'})
    try:
        response = urllib.request.urlopen(req)
        data = json.loads(response.read())
        jobs = data.get('jobs', [])
        print(f"Found {len(jobs)} jobs")
        for j in jobs[:2]:
            print(f"- {j['company_name']}: {j['title']} ({j['url']})")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()

import urllib.request
import json
import re

def main():
    url = "https://hn.algolia.com/api/v1/search?query=Machine+Learning&tags=job"
    req = urllib.request.Request(url, headers={'User-Agent': 'JobGuardAI'})
    try:
        response = urllib.request.urlopen(req)
        data = json.loads(response.read())
        jobs = data.get('hits', [])
        
        results = []
        for hit in jobs:
            title_raw = hit.get('title', '')
            link = hit.get('url', '')
            
            # Simple heuristic: Company Name is often before "Is Hiring" or "Hiring" or | or -
            company = "Tech Startup"
            title = title_raw
            if ' Is Hiring ' in title_raw:
                parts = title_raw.split(' Is Hiring ')
                company = parts[0].strip()
                title = parts[1].strip()
            elif ' is hiring ' in title_raw:
                parts = title_raw.split(' is hiring ')
                company = parts[0].strip()
                title = parts[1].strip()
            elif ' | ' in title_raw:
                parts = title_raw.split(' | ')
                company = parts[0].strip()
                title = parts[1].strip()
                
            if link and link.startswith('http') and 'ycombinator.com' not in link:
                results.append({
                    "company": company,
                    "role": title,
                    "link": link
                })
        
        for r in results[:5]:
            print(f"- {r['company']}: {r['role']} ({r['link']})")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
